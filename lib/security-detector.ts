export type ThreatLevel = 'INFO' | 'SUSPICIOUS' | 'UNAUTHORIZED' | 'ATTACK';

export type ThreatType =
  | 'NORMAL_VISIT'
  | 'SQL_INJECTION'
  | 'PATH_TRAVERSAL'
  | 'SENSITIVE_FILE_SCAN'
  | 'EXPLOIT_SCANNER_BOT'
  | 'XSS_INJECTION'
  | 'COMMAND_INJECTION'
  | 'UNAUTHORIZED_ADMIN_ACCESS'
  | 'BRUTE_FORCE_LOGIN'
  | 'ANOMALOUS_REQUEST';

export interface SecurityInspectionResult {
  isThreat: boolean;
  threatLevel: ThreatLevel;
  threatType: ThreatType;
  description: string;
  matchedRule?: string;
  matchedPayload?: string;
  environment: 'PRODUCTION' | 'LOCAL';
  host: string;
  clientIp: string;
  country: string;
  isCloudflare: boolean;
}

// Reconnaissance sensitive paths probed by bots and attackers
const SENSITIVE_PATH_PATTERNS = [
  /^\/(\.env|\.env\.[a-z0-9]+)/i,
  /^\/\.git(\/.*)?/i,
  /^\/\.aws(\/.*)?/i,
  /^\/\.vscode(\/.*)?/i,
  /^\/\.well-known\/(?!pki-validation\/)/i,
  /^\/(wp-admin|wp-login\.php|wp-content|wp-includes|xmlrpc\.php)/i,
  /^\/(phpmyadmin|pma|myadmin|adminer\.php|dbadmin)/i,
  /^\/(actuator|actuator\/health|actuator\/env)/i,
  /^\/(server-status|server-info|\.ds_store)/i,
  /^\/(dump\.sql|backup\.sql|database\.sqlite|db\.sql|dump\.tar\.gz)/i,
  /^\/(eval-stdin\.php|shell\.php|webshell\.php|alfa\.php|c99\.php)/i,
  /^\/(solr|telescope|cgi-bin|api\/v1\/debug)/i,
  /^\/(config\.json|credentials|\.credentials)/i,
];

// SQL Injection signatures
const SQLI_PATTERNS = [
  /(\b(union\s+select|union\s+all\s+select)\b)/i,
  /(\bselect\b.+\bfrom\b)/i,
  /(\b(insert\s+into|delete\s+from|drop\s+table|alter\s+table)\b)/i,
  /('|\b)\s*(or|and)\s+('?1'?\s*=\s*'?1'|true)/i,
  /(\b(sleep|benchmark)\s*\(\s*\d+\s*\))/i,
  /(\binformation_schema\b)/i,
  /(\bwaitfor\s+delay\b)/i,
  /(--\s*$|\/\*.*\*\/)/,
  /(char\s*\(\s*\d+\s*\))/i,
  /(0x[0-9a-fA-F]{4,})/,
];

// Path traversal / Local File Inclusion
const PATH_TRAVERSAL_PATTERNS = [
  /(\.\.[\/\\])/,
  /(%2e%2e[\/\\]|%2e%2e%2f|%2e%2e%5c)/i,
  /(\/etc\/(passwd|shadow|hosts|issue))/,
  /(win\.ini|system32|boot\.ini)/i,
  /(\/proc\/self\/environ)/,
];

// XSS and RCE signatures
const XSS_PATTERNS = [
  /(<script\b[^>]*>)/i,
  /(javascript\s*:)/i,
  /(onerror\s*=|onload\s*=|onclick\s*=|onmouseover\s*=)/i,
  /(document\.cookie|window\.location|eval\s*\()/i,
];

const COMMAND_INJECTION_PATTERNS = [
  /(;\s*(cat|ls|pwd|whoami|id|uname|netstat)\b)/i,
  /(\|\s*(bash|sh|zsh|curl|wget)\b)/i,
  /(powershell(\.exe)?|cmd(\.exe)?)/i,
  /(`.+`|\$\(.*\))/,
];

// Attacker tools / scanner user agents
const MALICIOUS_BOT_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /wpscan/i,
  /nuclei/i,
  /acunetix/i,
  /nessus/i,
  /havij/i,
  /nmap/i,
  /censys/i,
  /shodan/i,
  /burpcollaborator/i,
];

export function inspectRequest(params: {
  pathname: string;
  search: string;
  method: string;
  host: string;
  clientIp: string;
  country: string;
  userAgent: string;
  isCloudflare: boolean;
  hasAdminCookie: boolean;
}): SecurityInspectionResult {
  const {
    pathname,
    search,
    method,
    host,
    clientIp,
    country,
    userAgent,
    isCloudflare,
    hasAdminCookie,
  } = params;

  // Determine environment
  const lowerHost = host.toLowerCase();
  const isProdHost =
    lowerHost.includes('trycloudflare.com') ||
    lowerHost.includes('ngrok') ||
    lowerHost.includes('vercel.app') ||
    (!lowerHost.includes('localhost') && !lowerHost.includes('127.0.0.1') && !lowerHost.startsWith('192.168.') && !lowerHost.startsWith('10.'));

  const environment: 'PRODUCTION' | 'LOCAL' = isProdHost ? 'PRODUCTION' : 'LOCAL';

  const decodedSearch = (() => {
    try {
      return decodeURIComponent(search);
    } catch {
      return search;
    }
  })();

  const fullTarget = `${pathname}${search}`;
  const decodedFullTarget = `${pathname}${decodedSearch}`;

  // 1. Check Malicious User Agent
  for (const botPattern of MALICIOUS_BOT_UA_PATTERNS) {
    if (botPattern.test(userAgent)) {
      return {
        isThreat: true,
        threatLevel: 'ATTACK',
        threatType: 'EXPLOIT_SCANNER_BOT',
        description: `Alat peretas / Scanner otomatis terdeteksi (${userAgent.slice(0, 40)})`,
        matchedRule: botPattern.toString(),
        matchedPayload: userAgent.slice(0, 80),
        environment,
        host,
        clientIp,
        country,
        isCloudflare,
      };
    }
  }

  // 2. Check Sensitive Path Reconnaissance (e.g. .env, .git, wp-login, phpmyadmin)
  for (const pattern of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(pathname)) {
      return {
        isThreat: true,
        threatLevel: 'ATTACK',
        threatType: 'SENSITIVE_FILE_SCAN',
        description: `Percobaan pemindaian file rahasia / celah eksploitasi: ${pathname}`,
        matchedRule: pattern.toString(),
        matchedPayload: pathname,
        environment,
        host,
        clientIp,
        country,
        isCloudflare,
      };
    }
  }

  // 3. Check Path Traversal / LFI
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(fullTarget) || pattern.test(decodedFullTarget)) {
      return {
        isThreat: true,
        threatLevel: 'ATTACK',
        threatType: 'PATH_TRAVERSAL',
        description: `Percobaan Path Traversal / Akses file internal sistem`,
        matchedRule: pattern.toString(),
        matchedPayload: fullTarget.slice(0, 100),
        environment,
        host,
        clientIp,
        country,
        isCloudflare,
      };
    }
  }

  // 4. Check SQL Injection
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(fullTarget) || pattern.test(decodedFullTarget)) {
      return {
        isThreat: true,
        threatLevel: 'ATTACK',
        threatType: 'SQL_INJECTION',
        description: `Percobaan serangan SQL Injection terdeteksi dalam URL / Parameter`,
        matchedRule: pattern.toString(),
        matchedPayload: fullTarget.slice(0, 100),
        environment,
        host,
        clientIp,
        country,
        isCloudflare,
      };
    }
  }

  // 5. Check Command Injection
  for (const pattern of COMMAND_INJECTION_PATTERNS) {
    if (pattern.test(fullTarget) || pattern.test(decodedFullTarget)) {
      return {
        isThreat: true,
        threatLevel: 'ATTACK',
        threatType: 'COMMAND_INJECTION',
        description: `Percobaan Remote Command Injection / Eksekusi shell sistem`,
        matchedRule: pattern.toString(),
        matchedPayload: fullTarget.slice(0, 100),
        environment,
        host,
        clientIp,
        country,
        isCloudflare,
      };
    }
  }

  // 6. Check XSS
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(fullTarget) || pattern.test(decodedFullTarget)) {
      return {
        isThreat: true,
        threatLevel: 'ATTACK',
        threatType: 'XSS_INJECTION',
        description: `Percobaan serangan Cross-Site Scripting (XSS)`,
        matchedRule: pattern.toString(),
        matchedPayload: fullTarget.slice(0, 100),
        environment,
        host,
        clientIp,
        country,
        isCloudflare,
      };
    }
  }

  // 7. Check Unauthorized Admin Route Access
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLoginPage = pathname === '/admin/login' || pathname === '/api/admin/auth';

  if (isAdminPath && !isLoginPage && !hasAdminCookie) {
    return {
      isThreat: true,
      threatLevel: 'UNAUTHORIZED',
      threatType: 'UNAUTHORIZED_ADMIN_ACCESS',
      description: `Upaya masuk tanpa izin ke halaman/API Admin tanpa sesi otentikasi`,
      matchedPayload: `${method} ${pathname}`,
      environment,
      host,
      clientIp,
      country,
      isCloudflare,
    };
  }

  // Normal request
  return {
    isThreat: false,
    threatLevel: 'INFO',
    threatType: 'NORMAL_VISIT',
    description: `Akses halaman normal`,
    environment,
    host,
    clientIp,
    country,
    isCloudflare,
  };
}
