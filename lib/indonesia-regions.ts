export interface SubDistrict {
  nama: string;
  kodepos: string;
}

export interface District {
  nama: string;
  defaultKodepos: string;
  kelurahan: SubDistrict[];
  lat?: number;
  lng?: number;
}

export interface City {
  nama: string;
  kecamatan: District[];
}

export interface Province {
  nama: string;
  kota: City[];
}

export const INDONESIA_REGIONS: Province[] = [
  {
    nama: 'DKI Jakarta',
    kota: [
      {
        nama: 'Jakarta Selatan',
        kecamatan: [
          {
            nama: 'Setiabudi',
            defaultKodepos: '12910',
            lat: -6.2110,
            lng: 106.8280,
            kelurahan: [
              { nama: 'Karet Kuningan', kodepos: '12940' },
              { nama: 'Karet Pedurenan', kodepos: '12940' },
              { nama: 'Karet Semanggi', kodepos: '12930' },
              { nama: 'Karet', kodepos: '12920' },
              { nama: 'Setiabudi', kodepos: '12910' },
              { nama: 'Menteng Atas', kodepos: '12960' },
              { nama: 'Pasar Manggis', kodepos: '12970' },
              { nama: 'Guntur', kodepos: '12980' },
            ],
          },
          {
            nama: 'Tebet',
            defaultKodepos: '12810',
            lat: -6.2280,
            lng: 106.8550,
            kelurahan: [
              { nama: 'Tebet Barat', kodepos: '12810' },
              { nama: 'Tebet Timur', kodepos: '12820' },
              { nama: 'Kebon Baru', kodepos: '12830' },
              { nama: 'Bukit Duri', kodepos: '12840' },
              { nama: 'Manggarai', kodepos: '12850' },
              { nama: 'Manggarai Selatan', kodepos: '12860' },
              { nama: 'Menteng Dalam', kodepos: '12870' },
            ],
          },
          {
            nama: 'Cilandak',
            defaultKodepos: '12430',
            lat: -6.2950,
            lng: 106.7980,
            kelurahan: [
              { nama: 'Cilandak Barat', kodepos: '12430' },
              { nama: 'Lebak Bulus', kodepos: '12440' },
              { nama: 'Pondok Labu', kodepos: '12450' },
              { nama: 'Gandaria Selatan', kodepos: '12420' },
              { nama: 'Cipete Selatan', kodepos: '12410' },
            ],
          },
          {
            nama: 'Kebayoran Baru',
            defaultKodepos: '12110',
            lat: -6.2420,
            lng: 106.7970,
            kelurahan: [
              { nama: 'Senayan', kodepos: '12190' },
              { nama: 'Melawai', kodepos: '12160' },
              { nama: 'Kramat Pela', kodepos: '12130' },
              { nama: 'Gandaria Utara', kodepos: '12140' },
              { nama: 'Cipete Utara', kodepos: '12150' },
              { nama: 'Pulo', kodepos: '12160' },
              { nama: 'Petogogan', kodepos: '12170' },
              { nama: 'Rawa Barat', kodepos: '12180' },
              { nama: 'Selong', kodepos: '12110' },
              { nama: 'Gunung', kodepos: '12120' },
            ],
          },
          {
            nama: 'Mampang Prapatan',
            defaultKodepos: '12790',
            lat: -6.2510,
            lng: 106.8250,
            kelurahan: [
              { nama: 'Mampang Prapatan', kodepos: '12790' },
              { nama: 'Bangka', kodepos: '12730' },
              { nama: 'Pela Mampang', kodepos: '12720' },
              { nama: 'Tegal Parang', kodepos: '12790' },
              { nama: 'Kuningan Barat', kodepos: '12710' },
            ],
          },
          {
            nama: 'Pancoran',
            defaultKodepos: '12780',
            lat: -6.2580,
            lng: 106.8430,
            kelurahan: [
              { nama: 'Pancoran', kodepos: '12780' },
              { nama: 'Kalibata', kodepos: '12740' },
              { nama: 'Rawa Jati', kodepos: '12750' },
              { nama: 'Duren Tiga', kodepos: '12760' },
              { nama: 'Cikoko', kodepos: '12770' },
              { nama: 'Pengadegan', kodepos: '12770' },
            ],
          },
          {
            nama: 'Pasar Minggu',
            defaultKodepos: '12520',
            lat: -6.2840,
            lng: 106.8370,
            kelurahan: [
              { nama: 'Pasar Minggu', kodepos: '12520' },
              { nama: 'Pejaten Barat', kodepos: '12510' },
              { nama: 'Pejaten Timur', kodepos: '12510' },
              { nama: 'Kebagusan', kodepos: '12520' },
              { nama: 'Jati Padang', kodepos: '12540' },
              { nama: 'Ragunan', kodepos: '12550' },
              { nama: 'Cilandak Timur', kodepos: '12560' },
            ],
          },
          {
            nama: 'Kebayoran Lama',
            defaultKodepos: '12240',
            lat: -6.2480,
            lng: 106.7720,
            kelurahan: [
              { nama: 'Kebayoran Lama Utara', kodepos: '12240' },
              { nama: 'Kebayoran Lama Selatan', kodepos: '12240' },
              { nama: 'Pondok Pinang', kodepos: '12310' },
              { nama: 'Cipulir', kodepos: '12230' },
              { nama: 'Grogol Utara', kodepos: '12210' },
              { nama: 'Grogol Selatan', kodepos: '12220' },
            ],
          },
        ],
      },
      {
        nama: 'Jakarta Pusat',
        kecamatan: [
          {
            nama: 'Tanah Abang',
            defaultKodepos: '10210',
            lat: -6.2120,
            lng: 106.8180,
            kelurahan: [
              { nama: 'Bendungan Hilir', kodepos: '10210' },
              { nama: 'Karet Tengsin', kodepos: '10220' },
              { nama: 'Kebon Melati', kodepos: '10230' },
              { nama: 'Kebon Kacang', kodepos: '10240' },
              { nama: 'Kampung Bali', kodepos: '10250' },
              { nama: 'Petamburan', kodepos: '10260' },
              { nama: 'Gelora', kodepos: '10270' },
            ],
          },
          {
            nama: 'Senen',
            defaultKodepos: '10410',
            lat: -6.1950,
            lng: 106.8520,
            kelurahan: [
              { nama: 'Senen', kodepos: '10410' },
              { nama: 'Kwitang', kodepos: '10420' },
              { nama: 'Kenari', kodepos: '10430' },
              { nama: 'Paseban', kodepos: '10440' },
              { nama: 'Kramat', kodepos: '10450' },
              { nama: 'Bungur', kodepos: '10460' },
            ],
          },
          {
            nama: 'Menteng',
            defaultKodepos: '10310',
            lat: -6.1970,
            lng: 106.8340,
            kelurahan: [
              { nama: 'Menteng', kodepos: '10310' },
              { nama: 'Pegangsaan', kodepos: '10320' },
              { nama: 'Cikini', kodepos: '10330' },
              { nama: 'Kebon Sirih', kodepos: '10340' },
              { nama: 'Gondangdia', kodepos: '10350' },
            ],
          },
          {
            nama: 'Gambir',
            defaultKodepos: '10110',
            lat: -6.1750,
            lng: 106.8200,
            kelurahan: [
              { nama: 'Gambir', kodepos: '10110' },
              { nama: 'Kebon Kelapa', kodepos: '10120' },
              { nama: 'Petojo Selatan', kodepos: '10130' },
              { nama: 'Duri Pulo', kodepos: '10140' },
              { nama: 'Cideng', kodepos: '10150' },
              { nama: 'Petojo Utara', kodepos: '10160' },
            ],
          },
          {
            nama: 'Cempaka Putih',
            defaultKodepos: '10510',
            lat: -6.1820,
            lng: 106.8710,
            kelurahan: [
              { nama: 'Cempaka Putih Timur', kodepos: '10510' },
              { nama: 'Cempaka Putih Barat', kodepos: '10520' },
              { nama: 'Rawasari', kodepos: '10570' },
            ],
          },
          {
            nama: 'Kemayoran',
            defaultKodepos: '10610',
            lat: -6.1620,
            lng: 106.8580,
            kelurahan: [
              { nama: 'Kemayoran', kodepos: '10610' },
              { nama: 'Gunung Sahari Selatan', kodepos: '10610' },
              { nama: 'Kebon Kosong', kodepos: '10630' },
              { nama: 'Harapan Mulya', kodepos: '10640' },
              { nama: 'Cempaka Baru', kodepos: '10640' },
              { nama: 'Utan Panjang', kodepos: '10650' },
              { nama: 'Serdang', kodepos: '10650' },
            ],
          },
        ],
      },
      {
        nama: 'Jakarta Barat',
        kecamatan: [
          {
            nama: 'Palmerah',
            defaultKodepos: '11480',
            lat: -6.2050,
            lng: 106.7900,
            kelurahan: [
              { nama: 'Palmerah', kodepos: '11480' },
              { nama: 'Kemanggisan', kodepos: '11480' },
              { nama: 'Slipi', kodepos: '11410' },
              { nama: 'Kota Bambu Utara', kodepos: '11420' },
              { nama: 'Kota Bambu Selatan', kodepos: '11420' },
              { nama: 'Jati Pulo', kodepos: '11430' },
            ],
          },
          {
            nama: 'Grogol Petamburan',
            defaultKodepos: '11450',
            lat: -6.1680,
            lng: 106.7880,
            kelurahan: [
              { nama: 'Grogol', kodepos: '11450' },
              { nama: 'Tomang', kodepos: '11440' },
              { nama: 'Tanjung Duren Utara', kodepos: '11470' },
              { nama: 'Tanjung Duren Selatan', kodepos: '11470' },
              { nama: 'Wijaya Kusuma', kodepos: '11460' },
              { nama: 'Jelambar', kodepos: '11460' },
              { nama: 'Jelambar Baru', kodepos: '11460' },
            ],
          },
          {
            nama: 'Kebon Jeruk',
            defaultKodepos: '11530',
            lat: -6.1950,
            lng: 106.7700,
            kelurahan: [
              { nama: 'Kebon Jeruk', kodepos: '11530' },
              { nama: 'Sukabumi Utara', kodepos: '11540' },
              { nama: 'Sukabumi Selatan', kodepos: '11560' },
              { nama: 'Kelapa Dua', kodepos: '11550' },
              { nama: 'Duri Kepa', kodepos: '11510' },
              { nama: 'Kedoya Selatan', kodepos: '11520' },
              { nama: 'Kedoya Utara', kodepos: '11520' },
            ],
          },
          {
            nama: 'Kembangan',
            defaultKodepos: '11610',
            lat: -6.1900,
            lng: 106.7400,
            kelurahan: [
              { nama: 'Kembangan Utara', kodepos: '11610' },
              { nama: 'Kembangan Selatan', kodepos: '11610' },
              { nama: 'Meruya Utara', kodepos: '11620' },
              { nama: 'Meruya Selatan', kodepos: '11650' },
              { nama: 'Srengseng', kodepos: '11630' },
              { nama: 'Joglo', kodepos: '11640' },
            ],
          },
        ],
      },
      {
        nama: 'Jakarta Utara',
        kecamatan: [
          {
            nama: 'Kelapa Gading',
            defaultKodepos: '14240',
            lat: -6.1550,
            lng: 106.9050,
            kelurahan: [
              { nama: 'Kelapa Gading Barat', kodepos: '14240' },
              { nama: 'Kelapa Gading Timur', kodepos: '14240' },
              { nama: 'Pegangsaan Dua', kodepos: '14250' },
            ],
          },
          {
            nama: 'Tanjung Priok',
            defaultKodepos: '14310',
            lat: -6.1260,
            lng: 106.8850,
            kelurahan: [
              { nama: 'Tanjung Priok', kodepos: '14310' },
              { nama: 'Sunter Agung', kodepos: '14350' },
              { nama: 'Sunter Jaya', kodepos: '14360' },
              { nama: 'Papanggo', kodepos: '14340' },
              { nama: 'Warakas', kodepos: '14370' },
            ],
          },
          {
            nama: 'Pademangan',
            defaultKodepos: '14420',
            lat: -6.1350,
            lng: 106.8370,
            kelurahan: [
              { nama: 'Pademangan Timur', kodepos: '14410' },
              { nama: 'Pademangan Barat', kodepos: '14420' },
              { nama: 'Ancol', kodepos: '14430' },
            ],
          },
        ],
      },
      {
        nama: 'Jakarta Timur',
        kecamatan: [
          {
            nama: 'Jatinegara',
            defaultKodepos: '13310',
            lat: -6.2300,
            lng: 106.8700,
            kelurahan: [
              { nama: 'Kampung Melayu', kodepos: '13320' },
              { nama: 'Bidara Cina', kodepos: '13330' },
              { nama: 'Cipinang Cempedak', kodepos: '13340' },
              { nama: 'Rawa Bunga', kodepos: '13350' },
              { nama: 'Bali Mester', kodepos: '13310' },
            ],
          },
          {
            nama: 'Duren Sawit',
            defaultKodepos: '13440',
            lat: -6.2350,
            lng: 106.9150,
            kelurahan: [
              { nama: 'Duren Sawit', kodepos: '13440' },
              { nama: 'Pondok Bambu', kodepos: '13430' },
              { nama: 'Klender', kodepos: '13470' },
              { nama: 'Pondok Kelapa', kodepos: '13450' },
              { nama: 'Malaka Jaya', kodepos: '13460' },
            ],
          },
          {
            nama: 'Matraman',
            defaultKodepos: '13140',
            lat: -6.2020,
            lng: 106.8620,
            kelurahan: [
              { nama: 'Pisangan Baru', kodepos: '13110' },
              { nama: 'Utan Kayu Selatan', kodepos: '13120' },
              { nama: 'Utan Kayu Utara', kodepos: '13120' },
              { nama: 'Kayu Manis', kodepos: '13130' },
              { nama: 'Pal Meriam', kodepos: '13140' },
              { nama: 'Kebon Manggis', kodepos: '13150' },
            ],
          },
          {
            nama: 'Pulo Gadung',
            defaultKodepos: '13220',
            lat: -6.1950,
            lng: 106.8900,
            kelurahan: [
              { nama: 'Rawamangun', kodepos: '13220' },
              { nama: 'Pulo Gadung', kodepos: '13260' },
              { nama: 'Pisangan Timur', kodepos: '13230' },
              { nama: 'Cipinang', kodepos: '13240' },
              { nama: 'Jati', kodepos: '13220' },
              { nama: 'Kayu Putih', kodepos: '13210' },
            ],
          },
        ],
      },
    ],
  },
  {
    nama: 'Jawa Barat',
    kota: [
      {
        nama: 'Kota Depok',
        kecamatan: [
          {
            nama: 'Beji',
            defaultKodepos: '16421',
            lat: -6.3700,
            lng: 106.8250,
            kelurahan: [
              { nama: 'Beji', kodepos: '16421' },
              { nama: 'Beji Timur', kodepos: '16422' },
              { nama: 'Kemiri Muka', kodepos: '16423' },
              { nama: 'Pondok Cina', kodepos: '16424' },
              { nama: 'Kukusan', kodepos: '16425' },
              { nama: 'Tanah Baru', kodepos: '16426' },
            ],
          },
          {
            nama: 'Sukmajaya',
            defaultKodepos: '16412',
            lat: -6.3980,
            lng: 106.8400,
            kelurahan: [
              { nama: 'Sukmajaya', kodepos: '16412' },
              { nama: 'Mekarjaya', kodepos: '16411' },
              { nama: 'Baktijaya', kodepos: '16418' },
              { nama: 'Abadijaya', kodepos: '16417' },
              { nama: 'Tirtajaya', kodepos: '16412' },
              { nama: 'Cisalak', kodepos: '16416' },
            ],
          },
        ],
      },
      {
        nama: 'Kota Bekasi',
        kecamatan: [
          {
            nama: 'Bekasi Selatan',
            defaultKodepos: '17148',
            lat: -6.2480,
            lng: 106.9890,
            kelurahan: [
              { nama: 'Pekayon Jaya', kodepos: '17148' },
              { nama: 'Jaka Setia', kodepos: '17147' },
              { nama: 'Kayuringin Jaya', kodepos: '17144' },
              { nama: 'Jaka Mulya', kodepos: '17146' },
              { nama: 'Marga Jaya', kodepos: '17141' },
            ],
          },
          {
            nama: 'Bekasi Barat',
            defaultKodepos: '17135',
            lat: -6.2350,
            lng: 106.9750,
            kelurahan: [
              { nama: 'Kranji', kodepos: '17135' },
              { nama: 'Bintara', kodepos: '17134' },
              { nama: 'Bintara Jaya', kodepos: '17136' },
              { nama: 'Kota Baru', kodepos: '17133' },
              { nama: 'Jaka Sampurna', kodepos: '17145' },
            ],
          },
        ],
      },
      {
        nama: 'Kota Bandung',
        kecamatan: [
          {
            nama: 'Coblong',
            defaultKodepos: '40132',
            lat: -6.8850,
            lng: 107.6150,
            kelurahan: [
              { nama: 'Dago', kodepos: '40135' },
              { nama: 'Lebakgede', kodepos: '40132' },
              { nama: 'Lebaksiliwangi', kodepos: '40132' },
              { nama: 'Sadang Serang', kodepos: '40133' },
              { nama: 'Sekeloa', kodepos: '40134' },
              { nama: 'Cipaganti', kodepos: '40131' },
            ],
          },
        ],
      },
    ],
  },
  {
    nama: 'Banten',
    kota: [
      {
        nama: 'Kota Tangerang Selatan',
        kecamatan: [
          {
            nama: 'Serpong',
            defaultKodepos: '15310',
            lat: -6.3200,
            lng: 106.6750,
            kelurahan: [
              { nama: 'Serpong', kodepos: '15311' },
              { nama: 'Buaran', kodepos: '15310' },
              { nama: 'Ciater', kodepos: '15310' },
              { nama: 'Cilenggang', kodepos: '15310' },
              { nama: 'Rawa Buntu', kodepos: '15318' },
              { nama: 'Rawa Mekar Jaya', kodepos: '15310' },
              { nama: 'Lengkong Gudang', kodepos: '15321' },
              { nama: 'Lengkong Gudang Timur', kodepos: '15321' },
            ],
          },
          {
            nama: 'Ciputat Timur',
            defaultKodepos: '15412',
            lat: -6.3100,
            lng: 106.7550,
            kelurahan: [
              { nama: 'Pisangan', kodepos: '15419' },
              { nama: 'Cireundeu', kodepos: '15419' },
              { nama: 'Rengas', kodepos: '15412' },
              { nama: 'Rempoa', kodepos: '15412' },
              { nama: 'Pondok Ranji', kodepos: '15412' },
              { nama: 'Cempaka Putih', kodepos: '15412' },
            ],
          },
        ],
      },
      {
        nama: 'Kota Tangerang',
        kecamatan: [
          {
            nama: 'Tangerang',
            defaultKodepos: '15111',
            lat: -6.1780,
            lng: 106.6320,
            kelurahan: [
              { nama: 'Sukasari', kodepos: '15118' },
              { nama: 'Babakan', kodepos: '15118' },
              { nama: 'Sukarasa', kodepos: '15111' },
              { nama: 'Cikokol', kodepos: '15117' },
              { nama: 'Kelapa Indah', kodepos: '15117' },
            ],
          },
        ],
      },
    ],
  },
  {
    nama: 'Jawa Timur',
    kota: [
      {
        nama: 'Kota Surabaya',
        kecamatan: [
          {
            nama: 'Gubeng',
            defaultKodepos: '60281',
            lat: -7.2750,
            lng: 112.7550,
            kelurahan: [
              { nama: 'Gubeng', kodepos: '60281' },
              { nama: 'Airlangga', kodepos: '60286' },
              { nama: 'Barata Jaya', kodepos: '60284' },
              { nama: 'Kertajaya', kodepos: '60282' },
              { nama: 'Mojo', kodepos: '60285' },
              { nama: 'Pucang Sewu', kodepos: '60283' },
            ],
          },
          {
            nama: 'Wonokromo',
            defaultKodepos: '60241',
            lat: -7.3000,
            lng: 112.7400,
            kelurahan: [
              { nama: 'Wonokromo', kodepos: '60241' },
              { nama: 'Darmo', kodepos: '60241' },
              { nama: 'Sawunggaling', kodepos: '60242' },
              { nama: 'Jagir', kodepos: '60244' },
              { nama: 'Ngagel', kodepos: '60246' },
              { nama: 'Ngagel Rejo', kodepos: '60245' },
            ],
          },
        ],
      },
    ],
  },
];

export function getProvinces(): string[] {
  return INDONESIA_REGIONS.map(p => p.nama);
}

export function getCities(provinceName: string): string[] {
  const prov = INDONESIA_REGIONS.find(p => p.nama === provinceName);
  return prov ? prov.kota.map(k => k.nama) : [];
}

export function getDistricts(provinceName: string, cityName: string): District[] {
  const prov = INDONESIA_REGIONS.find(p => p.nama === provinceName);
  if (!prov) return [];
  const city = prov.kota.find(c => c.nama === cityName);
  return city ? city.kecamatan : [];
}

export function getSubDistricts(provinceName: string, cityName: string, districtName: string): SubDistrict[] {
  const districts = getDistricts(provinceName, cityName);
  const district = districts.find(d => d.nama === districtName);
  return district ? district.kelurahan : [];
}

export interface MatchedRegionResult {
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  kodepos?: string;
}

export function matchRegionFromGeocode(rawAddress: any): MatchedRegionResult {
  if (!rawAddress) return {};

  const clean = (str: string) => (str || '').toLowerCase().replace(/^(kota|kabupaten|kab\.|kecamatan|kec\.|kelurahan|kel\.)\s+/i, '').trim();

  // Raw fields from Nominatim or other geocoders
  const rawState = rawAddress.state || rawAddress.province || '';
  const rawCity = rawAddress.city || rawAddress.county || rawAddress.city_district || rawAddress.town || '';
  const rawDistrict = rawAddress.suburb || rawAddress.city_district || rawAddress.district || rawAddress.municipality || '';
  const rawSubDistrict = rawAddress.neighbourhood || rawAddress.quarter || rawAddress.hamlet || rawAddress.village || '';
  const rawPostcode = rawAddress.postcode || '';

  let matchedProv: Province | undefined;
  let matchedCity: City | undefined;
  let matchedDistrict: District | undefined;
  let matchedSubDistrict: SubDistrict | undefined;

  // 1. Match Province
  if (rawState) {
    const cleanState = clean(rawState);
    matchedProv = INDONESIA_REGIONS.find(p => {
      const cleanP = clean(p.nama);
      return cleanP === cleanState || cleanP.includes(cleanState) || cleanState.includes(cleanP);
    });
  }

  // Fallback: If rawState is "Daerah Khusus Ibukota Jakarta" or "DKI Jakarta" or contains "jakarta"
  if (!matchedProv) {
    const combinedText = `${rawState} ${rawCity} ${rawDistrict}`.toLowerCase();
    if (combinedText.includes('jakarta')) {
      matchedProv = INDONESIA_REGIONS.find(p => p.nama === 'DKI Jakarta');
    } else if (combinedText.includes('jawa barat') || combinedText.includes('west java')) {
      matchedProv = INDONESIA_REGIONS.find(p => p.nama === 'Jawa Barat');
    } else if (combinedText.includes('banten')) {
      matchedProv = INDONESIA_REGIONS.find(p => p.nama === 'Banten');
    } else if (combinedText.includes('jawa timur') || combinedText.includes('east java')) {
      matchedProv = INDONESIA_REGIONS.find(p => p.nama === 'Jawa Timur');
    }
  }

  // 2. Match City
  const provToSearch = matchedProv ? [matchedProv] : INDONESIA_REGIONS;
  if (rawCity) {
    const cleanCity = clean(rawCity);
    for (const p of provToSearch) {
      const foundC = p.kota.find(c => {
        const cName = clean(c.nama);
        return cName === cleanCity || cName.includes(cleanCity) || cleanCity.includes(cName);
      });
      if (foundC) {
        matchedCity = foundC;
        if (!matchedProv) matchedProv = p;
        break;
      }
    }
  }

  // If city district is in Jakarta (e.g., "Jakarta Selatan")
  if (!matchedCity && rawAddress.city_district) {
    const cleanDist = clean(rawAddress.city_district);
    for (const p of provToSearch) {
      const foundC = p.kota.find(c => {
        const cName = clean(c.nama);
        return cName === cleanDist || cName.includes(cleanDist) || cleanDist.includes(cName);
      });
      if (foundC) {
        matchedCity = foundC;
        if (!matchedProv) matchedProv = p;
        break;
      }
    }
  }

  // 3. Match District (Kecamatan)
  const citiesToSearch = matchedCity ? [matchedCity] : (matchedProv ? matchedProv.kota : INDONESIA_REGIONS.flatMap(p => p.kota));
  const candidateDistNames = [rawDistrict, rawAddress.city_district, rawAddress.suburb, rawAddress.municipality].filter(Boolean);

  for (const candidate of candidateDistNames) {
    const cleanCand = clean(candidate);
    for (const c of citiesToSearch) {
      const foundD = c.kecamatan.find(d => {
        const dName = clean(d.nama);
        return dName === cleanCand || dName.includes(cleanCand) || cleanCand.includes(dName);
      });
      if (foundD) {
        matchedDistrict = foundD;
        if (!matchedCity) matchedCity = c;
        if (!matchedProv) matchedProv = INDONESIA_REGIONS.find(p => p.kota.includes(c));
        break;
      }
    }
    if (matchedDistrict) break;
  }

  // 4. Match SubDistrict (Kelurahan)
  const districtsToSearch = matchedDistrict ? [matchedDistrict] : (matchedCity ? matchedCity.kecamatan : []);
  const candidateSubNames = [rawSubDistrict, rawAddress.village, rawAddress.hamlet, rawAddress.quarter, rawAddress.neighbourhood].filter(Boolean);

  for (const candidate of candidateSubNames) {
    const cleanCand = clean(candidate);
    for (const d of districtsToSearch) {
      const foundS = d.kelurahan.find(s => {
        const sName = clean(s.nama);
        return sName === cleanCand || sName.includes(cleanCand) || cleanCand.includes(sName);
      });
      if (foundS) {
        matchedSubDistrict = foundS;
        if (!matchedDistrict) matchedDistrict = d;
        break;
      }
    }
    if (matchedSubDistrict) break;
  }

  // 5. Determine Postcode
  let finalKodepos = rawPostcode;
  if (matchedSubDistrict?.kodepos) {
    finalKodepos = matchedSubDistrict.kodepos;
  } else if (!finalKodepos && matchedDistrict?.defaultKodepos) {
    finalKodepos = matchedDistrict.defaultKodepos;
  }

  return {
    provinsi: matchedProv?.nama,
    kota: matchedCity?.nama,
    kecamatan: matchedDistrict?.nama,
    kelurahan: matchedSubDistrict?.nama,
    kodepos: finalKodepos,
  };
}

