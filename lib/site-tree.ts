import type { PageNode } from './site-crawler';

/** Pohon hierarki dari path halaman + tata letak untuk diagram (murni, dipakai klien & tes). */

export interface TreeNode {
  id: string; // path lengkap, mis. "/kost/jakarta"
  label: string; // segmen terakhir
  page?: PageNode;
  children: TreeNode[];
  /** jumlah halaman nyata di bawahnya (termasuk dirinya bila punya halaman) */
  count: number;
}

export function buildTree(pages: PageNode[]): TreeNode {
  const root: TreeNode = { id: '/', label: '/', children: [], count: 0, page: pages.find((p) => p.path === '/') };
  const index = new Map<string, TreeNode>([['/', root]]);
  const sorted = [...pages].filter((p) => p.path !== '/').sort((a, b) => a.path.localeCompare(b.path));
  for (const p of sorted) {
    const segs = p.path.split('/').filter(Boolean);
    let cur = root;
    let acc = '';
    segs.forEach((seg, i) => {
      acc += '/' + seg;
      let node = index.get(acc);
      if (!node) {
        node = { id: acc, label: seg, children: [], count: 0 };
        index.set(acc, node);
        cur.children.push(node);
      }
      if (i === segs.length - 1) node.page = p;
      cur = node;
    });
  }
  const tally = (n: TreeNode): number => {
    n.children.sort((a, b) => Number(b.children.length > 0) - Number(a.children.length > 0) || a.label.localeCompare(b.label));
    n.count = (n.page ? 1 : 0) + n.children.reduce((s, c) => s + tally(c), 0);
    return n.count;
  };
  tally(root);
  return root;
}

/** Simpul yang cabangnya terlalu banyak diciutkan dulu agar diagram tetap terbaca. */
export function defaultCollapsed(root: TreeNode, threshold = 8): Set<string> {
  const out = new Set<string>();
  const walk = (n: TreeNode) => {
    if (n.id !== '/' && n.children.length > threshold) out.add(n.id);
    n.children.forEach(walk);
  };
  walk(root);
  return out;
}

export interface Laid {
  node: TreeNode;
  x: number;
  y: number;
  depth: number;
  collapsed: boolean;
}

export interface Layout {
  items: Laid[];
  edges: { from: Laid; to: Laid }[];
  width: number;
  height: number;
}

export const NODE_W = 196;
export const NODE_H = 48;
const GAP_X = 56;
const GAP_Y = 12;

export function layoutTree(root: TreeNode, collapsed: Set<string>): Layout {
  const items: Laid[] = [];
  const edges: Layout['edges'] = [];
  let leafY = 0;
  const place = (n: TreeNode, depth: number): Laid => {
    const isCollapsed = collapsed.has(n.id) && n.children.length > 0;
    const kids = isCollapsed ? [] : n.children;
    const placed = kids.map((c) => place(c, depth + 1));
    const laid: Laid = { node: n, x: depth * (NODE_W + GAP_X), y: 0, depth, collapsed: isCollapsed };
    if (placed.length === 0) {
      laid.y = leafY;
      leafY += NODE_H + GAP_Y;
    } else {
      laid.y = (placed[0].y + placed[placed.length - 1].y) / 2;
      placed.forEach((c) => edges.push({ from: laid, to: c }));
    }
    items.push(laid);
    return laid;
  };
  place(root, 0);
  const maxX = Math.max(...items.map((i) => i.x)) + NODE_W;
  return { items, edges, width: maxX, height: Math.max(leafY - GAP_Y, NODE_H) };
}

/** Semua id leluhur dari sebuah path (untuk membuka cabang saat mencari). */
export function ancestorsOf(path: string): string[] {
  const segs = path.split('/').filter(Boolean);
  const out: string[] = [];
  let acc = '';
  for (let i = 0; i < segs.length - 1; i++) {
    acc += '/' + segs[i];
    out.push(acc);
  }
  return out;
}
