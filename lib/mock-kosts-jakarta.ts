import { Kost } from './types';

/** Kost contoh tambahan: 10 per wilayah (Barat, Utara, Selatan, Timur, Pusat). Data contoh, ganti dengan data pemilik asli. */
export const JAKARTA_SAMPLE_KOSTS: Kost[] = [
  {
    "id": "kost-jkt-011",
    "slug": "kost-kebon-jeruk-cozy-kebon-jeruk-jakarta-barat",
    "nama": "Kost Kebon Jeruk Cozy",
    "alamat": "Jl. Kamboja No. 11, Kebon Jeruk, Jakarta Barat",
    "area": "Kebon Jeruk",
    "kota": "Jakarta",
    "harga": 2100000,
    "tipe": "putra",
    "latitude": -6.1972,
    "longitude": 106.7689,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Dapur Bersama",
      "Meja Kursi",
      "Penjaga 24 Jam"
    ],
    "deskripsi": "Kost putra nyaman di Kebon Jeruk, Jakarta Barat, dekat Kampus Binus Syahdan dan akses tol dalam kota. Kamar bersih dengan sirkulasi udara baik, 27 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "penuh",
    "owner_whatsapp": "628120000011",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m011-1",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-011/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan asri Kost Putri Tebet"
      },
      {
        "id": "m011-2",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-011/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m011-3",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-011/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m011-4",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-011/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m011-5",
        "kost_id": "kost-jkt-011",
        "tipe": "video",
        "storage_key": "kost-jkt-011/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m011-6",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-011/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m011-7",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-011/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m011-8",
        "kost_id": "kost-jkt-011",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-011/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m011-9",
        "kost_id": "kost-jkt-011",
        "tipe": "video",
        "storage_key": "kost-jkt-011/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m011-10",
        "kost_id": "kost-jkt-011",
        "tipe": "video",
        "storage_key": "kost-jkt-011/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-012",
    "slug": "kost-meruya-putri-asri-kembangan-jakarta-barat",
    "nama": "Kost Meruya Putri Asri",
    "alamat": "Jl. Mawar No. 18, Kembangan, Jakarta Barat",
    "area": "Meruya",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "putri",
    "latitude": -6.1886,
    "longitude": 106.741,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Bebas Banjir",
      "Kulkas",
      "Penjaga 24 Jam",
      "Smart TV",
      "Rooftop Lounge",
      "Lemari Pakaian"
    ],
    "deskripsi": "Kost putri nyaman di Meruya, Jakarta Barat, dekat Universitas Mercu Buana dan Jakarta Barat Selatan. Kamar bersih dengan sirkulasi udara baik, 8 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000012",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m012-1",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-012/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Benhil Residence"
      },
      {
        "id": "m012-2",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-012/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m012-3",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-012/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m012-4",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-012/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m012-5",
        "kost_id": "kost-jkt-012",
        "tipe": "video",
        "storage_key": "kost-jkt-012/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m012-6",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-012/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m012-7",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-012/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m012-8",
        "kost_id": "kost-jkt-012",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-012/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m012-9",
        "kost_id": "kost-jkt-012",
        "tipe": "video",
        "storage_key": "kost-jkt-012/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m012-10",
        "kost_id": "kost-jkt-012",
        "tipe": "video",
        "storage_key": "kost-jkt-012/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-013",
    "slug": "kost-cengkareng-mahasiswa-cengkareng-jakarta-barat",
    "nama": "Kost Cengkareng Mahasiswa",
    "alamat": "Jl. Cempaka No. 45, Cengkareng, Jakarta Barat",
    "area": "Cengkareng",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "campur",
    "latitude": -6.1483,
    "longitude": 106.7381,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Water Heater",
      "CCTV 24 Jam",
      "Rooftop Lounge",
      "Balkon Pribadi",
      "Akses Card 24 Jam"
    ],
    "deskripsi": "Kost campur nyaman di Cengkareng, Jakarta Barat, dekat Stasiun Rawa Buaya dan akses Bandara Soekarno-Hatta. Kamar bersih dengan sirkulasi udara baik, 12 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000013",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m013-1",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-013/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan kost Palmerah Binus"
      },
      {
        "id": "m013-2",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-013/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m013-3",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-013/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m013-4",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-013/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m013-5",
        "kost_id": "kost-jkt-013",
        "tipe": "video",
        "storage_key": "kost-jkt-013/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m013-6",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-013/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m013-7",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-013/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m013-8",
        "kost_id": "kost-jkt-013",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-013/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m013-9",
        "kost_id": "kost-jkt-013",
        "tipe": "video",
        "storage_key": "kost-jkt-013/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m013-10",
        "kost_id": "kost-jkt-013",
        "tipe": "video",
        "storage_key": "kost-jkt-013/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-014",
    "slug": "kost-kalideres-homey-kalideres-jakarta-barat",
    "nama": "Kost Kalideres Homey",
    "alamat": "Jl. Kemuning No. 19, Kalideres, Jakarta Barat",
    "area": "Kalideres",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "putra",
    "latitude": -6.1427,
    "longitude": 106.6992,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Dapur Bersama",
      "Meja Kursi",
      "Water Heater",
      "Bebas Banjir"
    ],
    "deskripsi": "Kost putra nyaman di Kalideres, Jakarta Barat, dekat Terminal Kalideres dan akses tol Jakarta-Tangerang. Kamar bersih dengan sirkulasi udara baik, 29 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000014",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m014-1",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-014/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Grogol Suite"
      },
      {
        "id": "m014-2",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-014/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m014-3",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-014/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m014-4",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-014/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m014-5",
        "kost_id": "kost-jkt-014",
        "tipe": "video",
        "storage_key": "kost-jkt-014/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m014-6",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-014/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m014-7",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-014/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m014-8",
        "kost_id": "kost-jkt-014",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-014/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m014-9",
        "kost_id": "kost-jkt-014",
        "tipe": "video",
        "storage_key": "kost-jkt-014/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m014-10",
        "kost_id": "kost-jkt-014",
        "tipe": "video",
        "storage_key": "kost-jkt-014/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-015",
    "slug": "kost-putri-glodok-studio-taman-sari-jakarta-barat",
    "nama": "Kost Putri Glodok Studio",
    "alamat": "Jl. Dahlia No. 41, Taman Sari, Jakarta Barat",
    "area": "Glodok",
    "kota": "Jakarta",
    "harga": 2750000,
    "tipe": "putri",
    "latitude": -6.1468,
    "longitude": 106.8164,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kasur Springbed",
      "Housekeeping 1x/Minggu",
      "Akses Card 24 Jam",
      "Penjaga 24 Jam",
      "Parkir Motor"
    ],
    "deskripsi": "Kost putri nyaman di Glodok, Jakarta Barat, dekat Stasiun Jakarta Kota dan pusat kuliner Glodok. Kamar bersih dengan sirkulasi udara baik, 8 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000015",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m015-1",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-015/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Salemba Cendana"
      },
      {
        "id": "m015-2",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-015/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m015-3",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-015/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m015-4",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-015/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m015-5",
        "kost_id": "kost-jkt-015",
        "tipe": "video",
        "storage_key": "kost-jkt-015/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m015-6",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-015/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m015-7",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-015/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m015-8",
        "kost_id": "kost-jkt-015",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-015/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m015-9",
        "kost_id": "kost-jkt-015",
        "tipe": "video",
        "storage_key": "kost-jkt-015/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m015-10",
        "kost_id": "kost-jkt-015",
        "tipe": "video",
        "storage_key": "kost-jkt-015/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-016",
    "slug": "kost-jembatan-besi-prima-tambora-jakarta-barat",
    "nama": "Kost Jembatan Besi Prima",
    "alamat": "Jl. Sakura No. 41, Tambora, Jakarta Barat",
    "area": "Jembatan Besi",
    "kota": "Jakarta",
    "harga": 1200000,
    "tipe": "campur",
    "latitude": -6.1482,
    "longitude": 106.8035,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Meja Kursi",
      "Kasur Springbed",
      "Parkir Motor"
    ],
    "deskripsi": "Kost campur nyaman di Jembatan Besi, Jakarta Barat, dekat Stasiun Duri dan akses ke Kota Tua. Kamar bersih dengan sirkulasi udara baik, 27 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000016",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m016-1",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-016/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Gedung modern 4 lantai Kost Setiabudi Skyline"
      },
      {
        "id": "m016-2",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-016/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m016-3",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-016/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m016-4",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-016/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m016-5",
        "kost_id": "kost-jkt-016",
        "tipe": "video",
        "storage_key": "kost-jkt-016/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m016-6",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-016/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m016-7",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-016/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m016-8",
        "kost_id": "kost-jkt-016",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-016/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m016-9",
        "kost_id": "kost-jkt-016",
        "tipe": "video",
        "storage_key": "kost-jkt-016/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m016-10",
        "kost_id": "kost-jkt-016",
        "tipe": "video",
        "storage_key": "kost-jkt-016/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-017",
    "slug": "kost-slipi-cozy-palmerah-jakarta-barat",
    "nama": "Kost Slipi Cozy",
    "alamat": "Jl. Kamboja No. 29, Palmerah, Jakarta Barat",
    "area": "Slipi",
    "kota": "Jakarta",
    "harga": 2100000,
    "tipe": "putra",
    "latitude": -6.1966,
    "longitude": 106.7943,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Lemari Pakaian",
      "Bebas Banjir",
      "Housekeeping 1x/Minggu",
      "Penjaga 24 Jam",
      "Kulkas"
    ],
    "deskripsi": "Kost putra nyaman di Slipi, Jakarta Barat, dekat Stasiun Palmerah dan Slipi Jaya. Kamar bersih dengan sirkulasi udara baik, 10 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000017",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m017-1",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-017/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Tanjung Duren Asri"
      },
      {
        "id": "m017-2",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-017/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m017-3",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-017/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m017-4",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-017/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m017-5",
        "kost_id": "kost-jkt-017",
        "tipe": "video",
        "storage_key": "kost-jkt-017/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m017-6",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-017/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m017-7",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-017/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m017-8",
        "kost_id": "kost-jkt-017",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-017/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m017-9",
        "kost_id": "kost-jkt-017",
        "tipe": "video",
        "storage_key": "kost-jkt-017/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m017-10",
        "kost_id": "kost-jkt-017",
        "tipe": "video",
        "storage_key": "kost-jkt-017/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-018",
    "slug": "kost-tomang-putri-asri-grogol-petamburan-jakarta-barat",
    "nama": "Kost Tomang Putri Asri",
    "alamat": "Jl. Mawar No. 40, Grogol Petamburan, Jakarta Barat",
    "area": "Tomang",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "putri",
    "latitude": -6.1766,
    "longitude": 106.7889,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kulkas",
      "Smart TV",
      "Laundry Kiloan Dekat",
      "Penjaga 24 Jam",
      "Bebas Banjir"
    ],
    "deskripsi": "Kost putri nyaman di Tomang, Jakarta Barat, dekat Kampus Untar dan Trisakti Grogol. Kamar bersih dengan sirkulasi udara baik, 23 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000018",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m018-1",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-018/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80&crop=right",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Kelapa Gading Boulevard"
      },
      {
        "id": "m018-2",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-018/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m018-3",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-018/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m018-4",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-018/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m018-5",
        "kost_id": "kost-jkt-018",
        "tipe": "video",
        "storage_key": "kost-jkt-018/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m018-6",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-018/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m018-7",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-018/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m018-8",
        "kost_id": "kost-jkt-018",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-018/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m018-9",
        "kost_id": "kost-jkt-018",
        "tipe": "video",
        "storage_key": "kost-jkt-018/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m018-10",
        "kost_id": "kost-jkt-018",
        "tipe": "video",
        "storage_key": "kost-jkt-018/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-019",
    "slug": "kost-kedoya-mahasiswa-kebon-jeruk-jakarta-barat",
    "nama": "Kost Kedoya Mahasiswa",
    "alamat": "Jl. Cempaka No. 39, Kebon Jeruk, Jakarta Barat",
    "area": "Kedoya",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "campur",
    "latitude": -6.1629,
    "longitude": 106.7622,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Laundry Kiloan Dekat",
      "Lemari Pakaian",
      "Meja Kursi",
      "Balkon Pribadi",
      "Dapur Bersama"
    ],
    "deskripsi": "Kost campur nyaman di Kedoya, Jakarta Barat, dekat Kampus Binus Kemanggisan dan Green Garden. Kamar bersih dengan sirkulasi udara baik, 9 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000019",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m019-1",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-019/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80&crop=top",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Bangunan minimalis tropis Kost Cilandak Fatmawati"
      },
      {
        "id": "m019-2",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-019/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m019-3",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-019/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m019-4",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-019/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m019-5",
        "kost_id": "kost-jkt-019",
        "tipe": "video",
        "storage_key": "kost-jkt-019/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m019-6",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-019/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m019-7",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-019/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m019-8",
        "kost_id": "kost-jkt-019",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-019/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m019-9",
        "kost_id": "kost-jkt-019",
        "tipe": "video",
        "storage_key": "kost-jkt-019/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m019-10",
        "kost_id": "kost-jkt-019",
        "tipe": "video",
        "storage_key": "kost-jkt-019/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-020",
    "slug": "kost-puri-indah-homey-kembangan-jakarta-barat",
    "nama": "Kost Puri Indah Homey",
    "alamat": "Jl. Kemuning No. 43, Kembangan, Jakarta Barat",
    "area": "Puri Indah",
    "kota": "Jakarta",
    "harga": 3000000,
    "tipe": "putra",
    "latitude": -6.1862,
    "longitude": 106.7359,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Bebas Banjir",
      "Laundry Kiloan Dekat",
      "Lemari Pakaian"
    ],
    "deskripsi": "Kost putra nyaman di Puri Indah, Jakarta Barat, dekat Puri Indah Mall dan akses tol Jakarta-Merak. Kamar bersih dengan sirkulasi udara baik, 23 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000020",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m020-1",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-020/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan gedung Kost Kuningan Executive Residence"
      },
      {
        "id": "m020-2",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-020/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m020-3",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-020/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m020-4",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-020/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m020-5",
        "kost_id": "kost-jkt-020",
        "tipe": "video",
        "storage_key": "kost-jkt-020/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m020-6",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-020/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m020-7",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-020/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m020-8",
        "kost_id": "kost-jkt-020",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-020/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m020-9",
        "kost_id": "kost-jkt-020",
        "tipe": "video",
        "storage_key": "kost-jkt-020/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m020-10",
        "kost_id": "kost-jkt-020",
        "tipe": "video",
        "storage_key": "kost-jkt-020/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-021",
    "slug": "kost-kelapa-gading-prima-kelapa-gading-jakarta-utara",
    "nama": "Kost Kelapa Gading Prima",
    "alamat": "Jl. Sakura No. 24, Kelapa Gading, Jakarta Utara",
    "area": "Kelapa Gading",
    "kota": "Jakarta",
    "harga": 2300000,
    "tipe": "campur",
    "latitude": -6.1539,
    "longitude": 106.9032,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Akses Card 24 Jam",
      "Rooftop Lounge",
      "Lemari Pakaian",
      "Dapur Bersama"
    ],
    "deskripsi": "Kost campur nyaman di Kelapa Gading, Jakarta Utara, dekat Mall of Indonesia dan Mal Kelapa Gading. Kamar bersih dengan sirkulasi udara baik, 12 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000021",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m021-1",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-021/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan asri Kost Putri Tebet"
      },
      {
        "id": "m021-2",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-021/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m021-3",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-021/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m021-4",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-021/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m021-5",
        "kost_id": "kost-jkt-021",
        "tipe": "video",
        "storage_key": "kost-jkt-021/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m021-6",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-021/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m021-7",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-021/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m021-8",
        "kost_id": "kost-jkt-021",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-021/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m021-9",
        "kost_id": "kost-jkt-021",
        "tipe": "video",
        "storage_key": "kost-jkt-021/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m021-10",
        "kost_id": "kost-jkt-021",
        "tipe": "video",
        "storage_key": "kost-jkt-021/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-022",
    "slug": "kost-pluit-cozy-penjaringan-jakarta-utara",
    "nama": "Kost Pluit Cozy",
    "alamat": "Jl. Kamboja No. 34, Penjaringan, Jakarta Utara",
    "area": "Pluit",
    "kota": "Jakarta",
    "harga": 3000000,
    "tipe": "putra",
    "latitude": -6.1145,
    "longitude": 106.7908,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Bebas Banjir",
      "Housekeeping 1x/Minggu",
      "Parkir Motor",
      "Kasur Springbed",
      "Dapur Bersama"
    ],
    "deskripsi": "Kost putra nyaman di Pluit, Jakarta Utara, dekat Pluit Village dan Muara Karang. Kamar bersih dengan sirkulasi udara baik, 28 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000022",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m022-1",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-022/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Benhil Residence"
      },
      {
        "id": "m022-2",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-022/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m022-3",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-022/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m022-4",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-022/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m022-5",
        "kost_id": "kost-jkt-022",
        "tipe": "video",
        "storage_key": "kost-jkt-022/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m022-6",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-022/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m022-7",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-022/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m022-8",
        "kost_id": "kost-jkt-022",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-022/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m022-9",
        "kost_id": "kost-jkt-022",
        "tipe": "video",
        "storage_key": "kost-jkt-022/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m022-10",
        "kost_id": "kost-jkt-022",
        "tipe": "video",
        "storage_key": "kost-jkt-022/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-023",
    "slug": "kost-pantai-indah-kapuk-putri-asri-penjaringan-jakarta-utara",
    "nama": "Kost Pantai Indah Kapuk Putri Asri",
    "alamat": "Jl. Mawar No. 9, Penjaringan, Jakarta Utara",
    "area": "Pantai Indah Kapuk",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "putri",
    "latitude": -6.107,
    "longitude": 106.7438,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Laundry Kiloan Dekat",
      "Kulkas",
      "Dapur Bersama",
      "Smart TV",
      "Lemari Pakaian"
    ],
    "deskripsi": "Kost putri nyaman di Pantai Indah Kapuk, Jakarta Utara, dekat PIK Avenue dan Golf Island. Kamar bersih dengan sirkulasi udara baik, 10 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000023",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m023-1",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-023/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan kost Palmerah Binus"
      },
      {
        "id": "m023-2",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-023/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m023-3",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-023/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m023-4",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-023/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m023-5",
        "kost_id": "kost-jkt-023",
        "tipe": "video",
        "storage_key": "kost-jkt-023/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m023-6",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-023/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m023-7",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-023/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m023-8",
        "kost_id": "kost-jkt-023",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-023/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m023-9",
        "kost_id": "kost-jkt-023",
        "tipe": "video",
        "storage_key": "kost-jkt-023/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m023-10",
        "kost_id": "kost-jkt-023",
        "tipe": "video",
        "storage_key": "kost-jkt-023/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-024",
    "slug": "kost-sunter-mahasiswa-tanjung-priok-jakarta-utara",
    "nama": "Kost Sunter Mahasiswa",
    "alamat": "Jl. Cempaka No. 10, Tanjung Priok, Jakarta Utara",
    "area": "Sunter",
    "kota": "Jakarta",
    "harga": 1500000,
    "tipe": "campur",
    "latitude": -6.1381,
    "longitude": 106.8673,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Water Heater",
      "Penjaga 24 Jam",
      "Parkir Motor",
      "Meja Kursi",
      "Kasur Springbed",
      "Rooftop Lounge"
    ],
    "deskripsi": "Kost campur nyaman di Sunter, Jakarta Utara, dekat Danau Sunter dan akses tol Wiyoto Wiyono. Kamar bersih dengan sirkulasi udara baik, 12 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000024",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m024-1",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-024/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Grogol Suite"
      },
      {
        "id": "m024-2",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-024/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m024-3",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-024/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m024-4",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-024/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m024-5",
        "kost_id": "kost-jkt-024",
        "tipe": "video",
        "storage_key": "kost-jkt-024/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m024-6",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-024/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m024-7",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-024/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m024-8",
        "kost_id": "kost-jkt-024",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-024/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m024-9",
        "kost_id": "kost-jkt-024",
        "tipe": "video",
        "storage_key": "kost-jkt-024/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m024-10",
        "kost_id": "kost-jkt-024",
        "tipe": "video",
        "storage_key": "kost-jkt-024/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-025",
    "slug": "kost-ancol-homey-pademangan-jakarta-utara",
    "nama": "Kost Ancol Homey",
    "alamat": "Jl. Kemuning No. 21, Pademangan, Jakarta Utara",
    "area": "Ancol",
    "kota": "Jakarta",
    "harga": 1800000,
    "tipe": "putra",
    "latitude": -6.1268,
    "longitude": 106.8325,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Rooftop Lounge",
      "Balkon Pribadi",
      "Kasur Springbed"
    ],
    "deskripsi": "Kost putra nyaman di Ancol, Jakarta Utara, dekat Taman Impian Jaya Ancol dan Mangga Dua. Kamar bersih dengan sirkulasi udara baik, 17 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000025",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m025-1",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-025/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Salemba Cendana"
      },
      {
        "id": "m025-2",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-025/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m025-3",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-025/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m025-4",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-025/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m025-5",
        "kost_id": "kost-jkt-025",
        "tipe": "video",
        "storage_key": "kost-jkt-025/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m025-6",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-025/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m025-7",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-025/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m025-8",
        "kost_id": "kost-jkt-025",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-025/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m025-9",
        "kost_id": "kost-jkt-025",
        "tipe": "video",
        "storage_key": "kost-jkt-025/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m025-10",
        "kost_id": "kost-jkt-025",
        "tipe": "video",
        "storage_key": "kost-jkt-025/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-026",
    "slug": "kost-putri-koja-studio-koja-jakarta-utara",
    "nama": "Kost Putri Koja Studio",
    "alamat": "Jl. Dahlia No. 14, Koja, Jakarta Utara",
    "area": "Koja",
    "kota": "Jakarta",
    "harga": 1950000,
    "tipe": "putri",
    "latitude": -6.1189,
    "longitude": 106.907,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kasur Springbed",
      "Kulkas",
      "Bebas Banjir",
      "Lemari Pakaian",
      "Housekeeping 1x/Minggu",
      "Smart TV"
    ],
    "deskripsi": "Kost putri nyaman di Koja, Jakarta Utara, dekat Terminal Tanjung Priok dan RSUD Koja. Kamar bersih dengan sirkulasi udara baik, 20 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000026",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m026-1",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-026/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Gedung modern 4 lantai Kost Setiabudi Skyline"
      },
      {
        "id": "m026-2",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-026/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m026-3",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-026/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m026-4",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-026/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m026-5",
        "kost_id": "kost-jkt-026",
        "tipe": "video",
        "storage_key": "kost-jkt-026/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m026-6",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-026/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m026-7",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-026/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m026-8",
        "kost_id": "kost-jkt-026",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-026/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m026-9",
        "kost_id": "kost-jkt-026",
        "tipe": "video",
        "storage_key": "kost-jkt-026/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m026-10",
        "kost_id": "kost-jkt-026",
        "tipe": "video",
        "storage_key": "kost-jkt-026/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-027",
    "slug": "kost-cilincing-prima-cilincing-jakarta-utara",
    "nama": "Kost Cilincing Prima",
    "alamat": "Jl. Sakura No. 6, Cilincing, Jakarta Utara",
    "area": "Cilincing",
    "kota": "Jakarta",
    "harga": 1200000,
    "tipe": "campur",
    "latitude": -6.1063,
    "longitude": 106.9418,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Housekeeping 1x/Minggu",
      "CCTV 24 Jam",
      "Rooftop Lounge",
      "Lemari Pakaian"
    ],
    "deskripsi": "Kost campur nyaman di Cilincing, Jakarta Utara, dekat Pelabuhan Marunda dan Rusun Cilincing. Kamar bersih dengan sirkulasi udara baik, 12 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000027",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m027-1",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-027/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Tanjung Duren Asri"
      },
      {
        "id": "m027-2",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-027/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m027-3",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-027/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m027-4",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-027/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m027-5",
        "kost_id": "kost-jkt-027",
        "tipe": "video",
        "storage_key": "kost-jkt-027/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m027-6",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-027/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m027-7",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-027/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m027-8",
        "kost_id": "kost-jkt-027",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-027/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m027-9",
        "kost_id": "kost-jkt-027",
        "tipe": "video",
        "storage_key": "kost-jkt-027/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m027-10",
        "kost_id": "kost-jkt-027",
        "tipe": "video",
        "storage_key": "kost-jkt-027/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-028",
    "slug": "kost-tanjung-priok-cozy-tanjung-priok-jakarta-utara",
    "nama": "Kost Tanjung Priok Cozy",
    "alamat": "Jl. Kamboja No. 8, Tanjung Priok, Jakarta Utara",
    "area": "Tanjung Priok",
    "kota": "Jakarta",
    "harga": 3000000,
    "tipe": "putra",
    "latitude": -6.1065,
    "longitude": 106.8802,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Dapur Bersama",
      "Rooftop Lounge",
      "Akses Card 24 Jam",
      "Laundry Kiloan Dekat",
      "Parkir Motor"
    ],
    "deskripsi": "Kost putra nyaman di Tanjung Priok, Jakarta Utara, dekat Stasiun Tanjung Priok dan Pelabuhan. Kamar bersih dengan sirkulasi udara baik, 15 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000028",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m028-1",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-028/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80&crop=right",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Kelapa Gading Boulevard"
      },
      {
        "id": "m028-2",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-028/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m028-3",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-028/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m028-4",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-028/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m028-5",
        "kost_id": "kost-jkt-028",
        "tipe": "video",
        "storage_key": "kost-jkt-028/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m028-6",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-028/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m028-7",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-028/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m028-8",
        "kost_id": "kost-jkt-028",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-028/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m028-9",
        "kost_id": "kost-jkt-028",
        "tipe": "video",
        "storage_key": "kost-jkt-028/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m028-10",
        "kost_id": "kost-jkt-028",
        "tipe": "video",
        "storage_key": "kost-jkt-028/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-029",
    "slug": "kost-boulevard-gading-putri-asri-kelapa-gading-jakarta-utara",
    "nama": "Kost Boulevard Gading Putri Asri",
    "alamat": "Jl. Mawar No. 46, Kelapa Gading, Jakarta Utara",
    "area": "Boulevard Gading",
    "kota": "Jakarta",
    "harga": 1200000,
    "tipe": "putri",
    "latitude": -6.1557,
    "longitude": 106.911,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Rooftop Lounge",
      "Laundry Kiloan Dekat",
      "Balkon Pribadi",
      "Water Heater",
      "Housekeeping 1x/Minggu",
      "Kulkas"
    ],
    "deskripsi": "Kost putri nyaman di Boulevard Gading, Jakarta Utara, dekat Gading Serpong Boulevard dan kuliner Gading. Kamar bersih dengan sirkulasi udara baik, 20 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000029",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m029-1",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-029/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80&crop=top",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Bangunan minimalis tropis Kost Cilandak Fatmawati"
      },
      {
        "id": "m029-2",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-029/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m029-3",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-029/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m029-4",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-029/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m029-5",
        "kost_id": "kost-jkt-029",
        "tipe": "video",
        "storage_key": "kost-jkt-029/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m029-6",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-029/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m029-7",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-029/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m029-8",
        "kost_id": "kost-jkt-029",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-029/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m029-9",
        "kost_id": "kost-jkt-029",
        "tipe": "video",
        "storage_key": "kost-jkt-029/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m029-10",
        "kost_id": "kost-jkt-029",
        "tipe": "video",
        "storage_key": "kost-jkt-029/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-030",
    "slug": "kost-muara-karang-mahasiswa-penjaringan-jakarta-utara",
    "nama": "Kost Muara Karang Mahasiswa",
    "alamat": "Jl. Cempaka No. 40, Penjaringan, Jakarta Utara",
    "area": "Muara Karang",
    "kota": "Jakarta",
    "harga": 1500000,
    "tipe": "campur",
    "latitude": -6.1151,
    "longitude": 106.7723,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Parkir Motor",
      "Parkir Mobil & Motor",
      "Kulkas"
    ],
    "deskripsi": "Kost campur nyaman di Muara Karang, Jakarta Utara, dekat Pluit Junction dan Muara Karang. Kamar bersih dengan sirkulasi udara baik, 21 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000030",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m030-1",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-030/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan gedung Kost Kuningan Executive Residence"
      },
      {
        "id": "m030-2",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-030/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m030-3",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-030/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m030-4",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-030/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m030-5",
        "kost_id": "kost-jkt-030",
        "tipe": "video",
        "storage_key": "kost-jkt-030/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m030-6",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-030/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m030-7",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-030/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m030-8",
        "kost_id": "kost-jkt-030",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-030/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m030-9",
        "kost_id": "kost-jkt-030",
        "tipe": "video",
        "storage_key": "kost-jkt-030/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m030-10",
        "kost_id": "kost-jkt-030",
        "tipe": "video",
        "storage_key": "kost-jkt-030/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-031",
    "slug": "kost-putri-blok-m-studio-kebayoran-baru-jakarta-selatan",
    "nama": "Kost Putri Blok M Studio",
    "alamat": "Jl. Dahlia No. 44, Kebayoran Baru, Jakarta Selatan",
    "area": "Blok M",
    "kota": "Jakarta",
    "harga": 2750000,
    "tipe": "putri",
    "latitude": -6.2405,
    "longitude": 106.7949,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Housekeeping 1x/Minggu",
      "Penjaga 24 Jam",
      "Balkon Pribadi",
      "Kasur Springbed",
      "Parkir Motor"
    ],
    "deskripsi": "Kost putri nyaman di Blok M, Jakarta Selatan, dekat MRT Blok M dan Plaza Blok M. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000031",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m031-1",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-031/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan asri Kost Putri Tebet"
      },
      {
        "id": "m031-2",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-031/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m031-3",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-031/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m031-4",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-031/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m031-5",
        "kost_id": "kost-jkt-031",
        "tipe": "video",
        "storage_key": "kost-jkt-031/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m031-6",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-031/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m031-7",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-031/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m031-8",
        "kost_id": "kost-jkt-031",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-031/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m031-9",
        "kost_id": "kost-jkt-031",
        "tipe": "video",
        "storage_key": "kost-jkt-031/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m031-10",
        "kost_id": "kost-jkt-031",
        "tipe": "video",
        "storage_key": "kost-jkt-031/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-032",
    "slug": "kost-senopati-prima-kebayoran-baru-jakarta-selatan",
    "nama": "Kost Senopati Prima",
    "alamat": "Jl. Sakura No. 45, Kebayoran Baru, Jakarta Selatan",
    "area": "Senopati",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "campur",
    "latitude": -6.2332,
    "longitude": 106.8071,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Laundry Kiloan Dekat",
      "Meja Kursi",
      "Rooftop Lounge",
      "Bebas Banjir"
    ],
    "deskripsi": "Kost campur nyaman di Senopati, Jakarta Selatan, dekat SCBD dan MRT Senayan. Kamar bersih dengan sirkulasi udara baik, 29 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "penuh",
    "owner_whatsapp": "628120000032",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m032-1",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-032/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Benhil Residence"
      },
      {
        "id": "m032-2",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-032/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m032-3",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-032/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m032-4",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-032/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m032-5",
        "kost_id": "kost-jkt-032",
        "tipe": "video",
        "storage_key": "kost-jkt-032/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m032-6",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-032/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m032-7",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-032/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m032-8",
        "kost_id": "kost-jkt-032",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-032/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m032-9",
        "kost_id": "kost-jkt-032",
        "tipe": "video",
        "storage_key": "kost-jkt-032/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m032-10",
        "kost_id": "kost-jkt-032",
        "tipe": "video",
        "storage_key": "kost-jkt-032/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-033",
    "slug": "kost-mampang-cozy-mampang-prapatan-jakarta-selatan",
    "nama": "Kost Mampang Cozy",
    "alamat": "Jl. Kamboja No. 34, Mampang Prapatan, Jakarta Selatan",
    "area": "Mampang",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "putra",
    "latitude": -6.2518,
    "longitude": 106.819,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Bebas Banjir",
      "Rooftop Lounge",
      "Meja Kursi",
      "Kasur Springbed"
    ],
    "deskripsi": "Kost putra nyaman di Mampang, Jakarta Selatan, dekat Mampang Prapatan dan akses tol dalam kota. Kamar bersih dengan sirkulasi udara baik, 11 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000033",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m033-1",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-033/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan kost Palmerah Binus"
      },
      {
        "id": "m033-2",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-033/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m033-3",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-033/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m033-4",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-033/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m033-5",
        "kost_id": "kost-jkt-033",
        "tipe": "video",
        "storage_key": "kost-jkt-033/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m033-6",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-033/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m033-7",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-033/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m033-8",
        "kost_id": "kost-jkt-033",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-033/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m033-9",
        "kost_id": "kost-jkt-033",
        "tipe": "video",
        "storage_key": "kost-jkt-033/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m033-10",
        "kost_id": "kost-jkt-033",
        "tipe": "video",
        "storage_key": "kost-jkt-033/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-034",
    "slug": "kost-pancoran-putri-asri-pancoran-jakarta-selatan",
    "nama": "Kost Pancoran Putri Asri",
    "alamat": "Jl. Mawar No. 36, Pancoran, Jakarta Selatan",
    "area": "Pancoran",
    "kota": "Jakarta",
    "harga": 2100000,
    "tipe": "putri",
    "latitude": -6.2417,
    "longitude": 106.8446,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Meja Kursi",
      "Akses Card 24 Jam",
      "Smart TV",
      "Bebas Banjir",
      "Kasur Springbed"
    ],
    "deskripsi": "Kost putri nyaman di Pancoran, Jakarta Selatan, dekat Stasiun Cawang dan Gatot Subroto. Kamar bersih dengan sirkulasi udara baik, 25 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000034",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m034-1",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-034/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Grogol Suite"
      },
      {
        "id": "m034-2",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-034/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m034-3",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-034/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m034-4",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-034/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m034-5",
        "kost_id": "kost-jkt-034",
        "tipe": "video",
        "storage_key": "kost-jkt-034/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m034-6",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-034/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m034-7",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-034/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m034-8",
        "kost_id": "kost-jkt-034",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-034/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m034-9",
        "kost_id": "kost-jkt-034",
        "tipe": "video",
        "storage_key": "kost-jkt-034/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m034-10",
        "kost_id": "kost-jkt-034",
        "tipe": "video",
        "storage_key": "kost-jkt-034/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-035",
    "slug": "kost-pasar-minggu-mahasiswa-pasar-minggu-jakarta-selatan",
    "nama": "Kost Pasar Minggu Mahasiswa",
    "alamat": "Jl. Cempaka No. 10, Pasar Minggu, Jakarta Selatan",
    "area": "Pasar Minggu",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "campur",
    "latitude": -6.2862,
    "longitude": 106.8438,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Akses Card 24 Jam",
      "Parkir Mobil & Motor",
      "Balkon Pribadi"
    ],
    "deskripsi": "Kost campur nyaman di Pasar Minggu, Jakarta Selatan, dekat Stasiun Pasar Minggu dan Kampus UNAS. Kamar bersih dengan sirkulasi udara baik, 23 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000035",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m035-1",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-035/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Salemba Cendana"
      },
      {
        "id": "m035-2",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-035/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m035-3",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-035/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m035-4",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-035/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m035-5",
        "kost_id": "kost-jkt-035",
        "tipe": "video",
        "storage_key": "kost-jkt-035/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m035-6",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-035/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m035-7",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-035/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m035-8",
        "kost_id": "kost-jkt-035",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-035/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m035-9",
        "kost_id": "kost-jkt-035",
        "tipe": "video",
        "storage_key": "kost-jkt-035/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m035-10",
        "kost_id": "kost-jkt-035",
        "tipe": "video",
        "storage_key": "kost-jkt-035/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-036",
    "slug": "kost-lenteng-agung-homey-jagakarsa-jakarta-selatan",
    "nama": "Kost Lenteng Agung Homey",
    "alamat": "Jl. Kemuning No. 32, Jagakarsa, Jakarta Selatan",
    "area": "Lenteng Agung",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "putra",
    "latitude": -6.3273,
    "longitude": 106.8355,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Meja Kursi",
      "CCTV 24 Jam",
      "Parkir Mobil & Motor",
      "Akses Card 24 Jam",
      "Kulkas"
    ],
    "deskripsi": "Kost putra nyaman di Lenteng Agung, Jakarta Selatan, dekat Stasiun Lenteng Agung dan Kampus UI Depok. Kamar bersih dengan sirkulasi udara baik, 26 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000036",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m036-1",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-036/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Gedung modern 4 lantai Kost Setiabudi Skyline"
      },
      {
        "id": "m036-2",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-036/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m036-3",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-036/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m036-4",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-036/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m036-5",
        "kost_id": "kost-jkt-036",
        "tipe": "video",
        "storage_key": "kost-jkt-036/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m036-6",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-036/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m036-7",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-036/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m036-8",
        "kost_id": "kost-jkt-036",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-036/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m036-9",
        "kost_id": "kost-jkt-036",
        "tipe": "video",
        "storage_key": "kost-jkt-036/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m036-10",
        "kost_id": "kost-jkt-036",
        "tipe": "video",
        "storage_key": "kost-jkt-036/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-037",
    "slug": "kost-putri-bintaro-studio-pesanggrahan-jakarta-selatan",
    "nama": "Kost Putri Bintaro Studio",
    "alamat": "Jl. Dahlia No. 43, Pesanggrahan, Jakarta Selatan",
    "area": "Bintaro",
    "kota": "Jakarta",
    "harga": 2100000,
    "tipe": "putri",
    "latitude": -6.2675,
    "longitude": 106.7615,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kasur Springbed",
      "Rooftop Lounge",
      "Kulkas"
    ],
    "deskripsi": "Kost putri nyaman di Bintaro, Jakarta Selatan, dekat Bintaro Plaza dan Stasiun Pondok Ranji. Kamar bersih dengan sirkulasi udara baik, 27 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000037",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m037-1",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-037/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Tanjung Duren Asri"
      },
      {
        "id": "m037-2",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-037/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m037-3",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-037/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m037-4",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-037/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m037-5",
        "kost_id": "kost-jkt-037",
        "tipe": "video",
        "storage_key": "kost-jkt-037/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m037-6",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-037/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m037-7",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-037/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m037-8",
        "kost_id": "kost-jkt-037",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-037/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m037-9",
        "kost_id": "kost-jkt-037",
        "tipe": "video",
        "storage_key": "kost-jkt-037/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m037-10",
        "kost_id": "kost-jkt-037",
        "tipe": "video",
        "storage_key": "kost-jkt-037/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-038",
    "slug": "kost-pondok-indah-prima-kebayoran-lama-jakarta-selatan",
    "nama": "Kost Pondok Indah Prima",
    "alamat": "Jl. Sakura No. 25, Kebayoran Lama, Jakarta Selatan",
    "area": "Pondok Indah",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "campur",
    "latitude": -6.2686,
    "longitude": 106.7812,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Akses Card 24 Jam",
      "Balkon Pribadi",
      "CCTV 24 Jam",
      "Water Heater"
    ],
    "deskripsi": "Kost campur nyaman di Pondok Indah, Jakarta Selatan, dekat Pondok Indah Mall dan MRT Lebak Bulus. Kamar bersih dengan sirkulasi udara baik, 23 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000038",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m038-1",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-038/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80&crop=right",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Kelapa Gading Boulevard"
      },
      {
        "id": "m038-2",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-038/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m038-3",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-038/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m038-4",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-038/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m038-5",
        "kost_id": "kost-jkt-038",
        "tipe": "video",
        "storage_key": "kost-jkt-038/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m038-6",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-038/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m038-7",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-038/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m038-8",
        "kost_id": "kost-jkt-038",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-038/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m038-9",
        "kost_id": "kost-jkt-038",
        "tipe": "video",
        "storage_key": "kost-jkt-038/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m038-10",
        "kost_id": "kost-jkt-038",
        "tipe": "video",
        "storage_key": "kost-jkt-038/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-039",
    "slug": "kost-tebet-timur-cozy-tebet-jakarta-selatan",
    "nama": "Kost Tebet Timur Cozy",
    "alamat": "Jl. Kamboja No. 37, Tebet, Jakarta Selatan",
    "area": "Tebet Timur",
    "kota": "Jakarta",
    "harga": 1800000,
    "tipe": "putra",
    "latitude": -6.2359,
    "longitude": 106.8593,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kulkas",
      "Laundry Kiloan Dekat",
      "Kasur Springbed",
      "Bebas Banjir"
    ],
    "deskripsi": "Kost putra nyaman di Tebet Timur, Jakarta Selatan, dekat Stasiun Tebet dan Kota Kasablanka. Kamar bersih dengan sirkulasi udara baik, 30 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000039",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m039-1",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-039/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80&crop=top",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Bangunan minimalis tropis Kost Cilandak Fatmawati"
      },
      {
        "id": "m039-2",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-039/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m039-3",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-039/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m039-4",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-039/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m039-5",
        "kost_id": "kost-jkt-039",
        "tipe": "video",
        "storage_key": "kost-jkt-039/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m039-6",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-039/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m039-7",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-039/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m039-8",
        "kost_id": "kost-jkt-039",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-039/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m039-9",
        "kost_id": "kost-jkt-039",
        "tipe": "video",
        "storage_key": "kost-jkt-039/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m039-10",
        "kost_id": "kost-jkt-039",
        "tipe": "video",
        "storage_key": "kost-jkt-039/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-040",
    "slug": "kost-cilandak-barat-putri-asri-cilandak-jakarta-selatan",
    "nama": "Kost Cilandak Barat Putri Asri",
    "alamat": "Jl. Mawar No. 41, Cilandak, Jakarta Selatan",
    "area": "Cilandak Barat",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "putri",
    "latitude": -6.2897,
    "longitude": 106.7933,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Laundry Kiloan Dekat",
      "Parkir Motor",
      "Smart TV",
      "Kulkas",
      "Lemari Pakaian",
      "Penjaga 24 Jam"
    ],
    "deskripsi": "Kost putri nyaman di Cilandak Barat, Jakarta Selatan, dekat MRT Fatmawati dan Cilandak Town Square. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000040",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m040-1",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-040/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan gedung Kost Kuningan Executive Residence"
      },
      {
        "id": "m040-2",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-040/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m040-3",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-040/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m040-4",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-040/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m040-5",
        "kost_id": "kost-jkt-040",
        "tipe": "video",
        "storage_key": "kost-jkt-040/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m040-6",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-040/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m040-7",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-040/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m040-8",
        "kost_id": "kost-jkt-040",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-040/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m040-9",
        "kost_id": "kost-jkt-040",
        "tipe": "video",
        "storage_key": "kost-jkt-040/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m040-10",
        "kost_id": "kost-jkt-040",
        "tipe": "video",
        "storage_key": "kost-jkt-040/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-041",
    "slug": "kost-jatinegara-homey-jatinegara-jakarta-timur",
    "nama": "Kost Jatinegara Homey",
    "alamat": "Jl. Kemuning No. 45, Jatinegara, Jakarta Timur",
    "area": "Jatinegara",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "putra",
    "latitude": -6.2136,
    "longitude": 106.872,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Dapur Bersama",
      "Parkir Mobil & Motor",
      "CCTV 24 Jam"
    ],
    "deskripsi": "Kost putra nyaman di Jatinegara, Jakarta Timur, dekat Stasiun Jatinegara dan Pasar Mester. Kamar bersih dengan sirkulasi udara baik, 12 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000041",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m041-1",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-041/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan asri Kost Putri Tebet"
      },
      {
        "id": "m041-2",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-041/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m041-3",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-041/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m041-4",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-041/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m041-5",
        "kost_id": "kost-jkt-041",
        "tipe": "video",
        "storage_key": "kost-jkt-041/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m041-6",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-041/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m041-7",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-041/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m041-8",
        "kost_id": "kost-jkt-041",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-041/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m041-9",
        "kost_id": "kost-jkt-041",
        "tipe": "video",
        "storage_key": "kost-jkt-041/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m041-10",
        "kost_id": "kost-jkt-041",
        "tipe": "video",
        "storage_key": "kost-jkt-041/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-042",
    "slug": "kost-putri-matraman-studio-matraman-jakarta-timur",
    "nama": "Kost Putri Matraman Studio",
    "alamat": "Jl. Dahlia No. 24, Matraman, Jakarta Timur",
    "area": "Matraman",
    "kota": "Jakarta",
    "harga": 1350000,
    "tipe": "putri",
    "latitude": -6.2013,
    "longitude": 106.8577,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kasur Springbed",
      "Kulkas",
      "CCTV 24 Jam",
      "Penjaga 24 Jam"
    ],
    "deskripsi": "Kost putri nyaman di Matraman, Jakarta Timur, dekat Stasiun Matraman dan Kampus UNJ Rawamangun. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "penuh",
    "owner_whatsapp": "628120000042",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m042-1",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-042/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Benhil Residence"
      },
      {
        "id": "m042-2",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-042/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m042-3",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-042/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m042-4",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-042/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m042-5",
        "kost_id": "kost-jkt-042",
        "tipe": "video",
        "storage_key": "kost-jkt-042/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m042-6",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-042/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m042-7",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-042/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m042-8",
        "kost_id": "kost-jkt-042",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-042/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m042-9",
        "kost_id": "kost-jkt-042",
        "tipe": "video",
        "storage_key": "kost-jkt-042/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m042-10",
        "kost_id": "kost-jkt-042",
        "tipe": "video",
        "storage_key": "kost-jkt-042/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-043",
    "slug": "kost-pulomas-prima-pulo-gadung-jakarta-timur",
    "nama": "Kost Pulomas Prima",
    "alamat": "Jl. Sakura No. 12, Pulo Gadung, Jakarta Timur",
    "area": "Pulomas",
    "kota": "Jakarta",
    "harga": 1800000,
    "tipe": "campur",
    "latitude": -6.1851,
    "longitude": 106.8756,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Penjaga 24 Jam",
      "Akses Card 24 Jam",
      "Housekeeping 1x/Minggu",
      "Laundry Kiloan Dekat"
    ],
    "deskripsi": "Kost campur nyaman di Pulomas, Jakarta Timur, dekat Kampus UNJ dan Kawasan Industri Pulogadung. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000043",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m043-1",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-043/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan kost Palmerah Binus"
      },
      {
        "id": "m043-2",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-043/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m043-3",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-043/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m043-4",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-043/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m043-5",
        "kost_id": "kost-jkt-043",
        "tipe": "video",
        "storage_key": "kost-jkt-043/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m043-6",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-043/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m043-7",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-043/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m043-8",
        "kost_id": "kost-jkt-043",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-043/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m043-9",
        "kost_id": "kost-jkt-043",
        "tipe": "video",
        "storage_key": "kost-jkt-043/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m043-10",
        "kost_id": "kost-jkt-043",
        "tipe": "video",
        "storage_key": "kost-jkt-043/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-044",
    "slug": "kost-duren-sawit-cozy-duren-sawit-jakarta-timur",
    "nama": "Kost Duren Sawit Cozy",
    "alamat": "Jl. Kamboja No. 31, Duren Sawit, Jakarta Timur",
    "area": "Duren Sawit",
    "kota": "Jakarta",
    "harga": 1350000,
    "tipe": "putra",
    "latitude": -6.2303,
    "longitude": 106.8985,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Balkon Pribadi",
      "Parkir Mobil & Motor",
      "Meja Kursi",
      "Water Heater",
      "CCTV 24 Jam"
    ],
    "deskripsi": "Kost putra nyaman di Duren Sawit, Jakarta Timur, dekat Jakarta Garden City dan Stasiun Klender. Kamar bersih dengan sirkulasi udara baik, 13 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "penuh",
    "owner_whatsapp": "628120000044",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m044-1",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-044/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Grogol Suite"
      },
      {
        "id": "m044-2",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-044/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m044-3",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-044/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m044-4",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-044/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m044-5",
        "kost_id": "kost-jkt-044",
        "tipe": "video",
        "storage_key": "kost-jkt-044/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m044-6",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-044/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m044-7",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-044/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m044-8",
        "kost_id": "kost-jkt-044",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-044/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m044-9",
        "kost_id": "kost-jkt-044",
        "tipe": "video",
        "storage_key": "kost-jkt-044/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m044-10",
        "kost_id": "kost-jkt-044",
        "tipe": "video",
        "storage_key": "kost-jkt-044/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-045",
    "slug": "kost-cakung-putri-asri-cakung-jakarta-timur",
    "nama": "Kost Cakung Putri Asri",
    "alamat": "Jl. Mawar No. 17, Cakung, Jakarta Timur",
    "area": "Cakung",
    "kota": "Jakarta",
    "harga": 3000000,
    "tipe": "putri",
    "latitude": -6.1777,
    "longitude": 106.9489,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Meja Kursi",
      "Laundry Kiloan Dekat",
      "Lemari Pakaian",
      "Water Heater",
      "Rooftop Lounge",
      "Bebas Banjir"
    ],
    "deskripsi": "Kost putri nyaman di Cakung, Jakarta Timur, dekat Kawasan Industri Pulogadung dan Stasiun Cakung. Kamar bersih dengan sirkulasi udara baik, 20 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000045",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m045-1",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-045/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Salemba Cendana"
      },
      {
        "id": "m045-2",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-045/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m045-3",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-045/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m045-4",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-045/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m045-5",
        "kost_id": "kost-jkt-045",
        "tipe": "video",
        "storage_key": "kost-jkt-045/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m045-6",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-045/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m045-7",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-045/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m045-8",
        "kost_id": "kost-jkt-045",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-045/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m045-9",
        "kost_id": "kost-jkt-045",
        "tipe": "video",
        "storage_key": "kost-jkt-045/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m045-10",
        "kost_id": "kost-jkt-045",
        "tipe": "video",
        "storage_key": "kost-jkt-045/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-046",
    "slug": "kost-halim-mahasiswa-makasar-jakarta-timur",
    "nama": "Kost Halim Mahasiswa",
    "alamat": "Jl. Cempaka No. 25, Makasar, Jakarta Timur",
    "area": "Halim",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "campur",
    "latitude": -6.2685,
    "longitude": 106.8805,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Balkon Pribadi",
      "CCTV 24 Jam",
      "Kasur Springbed",
      "Lemari Pakaian"
    ],
    "deskripsi": "Kost campur nyaman di Halim, Jakarta Timur, dekat Bandara Halim Perdanakusuma dan Stasiun LRT Halim. Kamar bersih dengan sirkulasi udara baik, 26 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000046",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m046-1",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-046/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Gedung modern 4 lantai Kost Setiabudi Skyline"
      },
      {
        "id": "m046-2",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-046/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m046-3",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-046/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m046-4",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-046/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m046-5",
        "kost_id": "kost-jkt-046",
        "tipe": "video",
        "storage_key": "kost-jkt-046/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m046-6",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-046/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m046-7",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-046/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m046-8",
        "kost_id": "kost-jkt-046",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-046/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m046-9",
        "kost_id": "kost-jkt-046",
        "tipe": "video",
        "storage_key": "kost-jkt-046/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m046-10",
        "kost_id": "kost-jkt-046",
        "tipe": "video",
        "storage_key": "kost-jkt-046/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-047",
    "slug": "kost-kramat-jati-homey-kramat-jati-jakarta-timur",
    "nama": "Kost Kramat Jati Homey",
    "alamat": "Jl. Kemuning No. 21, Kramat Jati, Jakarta Timur",
    "area": "Kramat Jati",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "putra",
    "latitude": -6.2793,
    "longitude": 106.8704,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kulkas",
      "Meja Kursi",
      "Kasur Springbed",
      "Laundry Kiloan Dekat"
    ],
    "deskripsi": "Kost putra nyaman di Kramat Jati, Jakarta Timur, dekat Stasiun Cawang dan Pusat Grosir Cililitan. Kamar bersih dengan sirkulasi udara baik, 30 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000047",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m047-1",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-047/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Tanjung Duren Asri"
      },
      {
        "id": "m047-2",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-047/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m047-3",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-047/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m047-4",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-047/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m047-5",
        "kost_id": "kost-jkt-047",
        "tipe": "video",
        "storage_key": "kost-jkt-047/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m047-6",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-047/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m047-7",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-047/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m047-8",
        "kost_id": "kost-jkt-047",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-047/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m047-9",
        "kost_id": "kost-jkt-047",
        "tipe": "video",
        "storage_key": "kost-jkt-047/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m047-10",
        "kost_id": "kost-jkt-047",
        "tipe": "video",
        "storage_key": "kost-jkt-047/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-048",
    "slug": "kost-putri-ciracas-studio-ciracas-jakarta-timur",
    "nama": "Kost Putri Ciracas Studio",
    "alamat": "Jl. Dahlia No. 36, Ciracas, Jakarta Timur",
    "area": "Ciracas",
    "kota": "Jakarta",
    "harga": 1800000,
    "tipe": "putri",
    "latitude": -6.32,
    "longitude": 106.8696,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Penjaga 24 Jam",
      "Kasur Springbed",
      "Parkir Motor"
    ],
    "deskripsi": "Kost putri nyaman di Ciracas, Jakarta Timur, dekat Kampus UKI dan Pasar Pondok Gede. Kamar bersih dengan sirkulasi udara baik, 8 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000048",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m048-1",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-048/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80&crop=right",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Kelapa Gading Boulevard"
      },
      {
        "id": "m048-2",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-048/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m048-3",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-048/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m048-4",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-048/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m048-5",
        "kost_id": "kost-jkt-048",
        "tipe": "video",
        "storage_key": "kost-jkt-048/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m048-6",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-048/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m048-7",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-048/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m048-8",
        "kost_id": "kost-jkt-048",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-048/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m048-9",
        "kost_id": "kost-jkt-048",
        "tipe": "video",
        "storage_key": "kost-jkt-048/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m048-10",
        "kost_id": "kost-jkt-048",
        "tipe": "video",
        "storage_key": "kost-jkt-048/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-049",
    "slug": "kost-pasar-rebo-prima-pasar-rebo-jakarta-timur",
    "nama": "Kost Pasar Rebo Prima",
    "alamat": "Jl. Sakura No. 15, Pasar Rebo, Jakarta Timur",
    "area": "Pasar Rebo",
    "kota": "Jakarta",
    "harga": 2750000,
    "tipe": "campur",
    "latitude": -6.3478,
    "longitude": 106.867,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Smart TV",
      "Balkon Pribadi",
      "Lemari Pakaian",
      "Housekeeping 1x/Minggu"
    ],
    "deskripsi": "Kost campur nyaman di Pasar Rebo, Jakarta Timur, dekat Stasiun Pasar Rebo dan RS Harapan Bunda. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000049",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m049-1",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-049/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80&crop=top",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Bangunan minimalis tropis Kost Cilandak Fatmawati"
      },
      {
        "id": "m049-2",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-049/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m049-3",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-049/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m049-4",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-049/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m049-5",
        "kost_id": "kost-jkt-049",
        "tipe": "video",
        "storage_key": "kost-jkt-049/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m049-6",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-049/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m049-7",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-049/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m049-8",
        "kost_id": "kost-jkt-049",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-049/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m049-9",
        "kost_id": "kost-jkt-049",
        "tipe": "video",
        "storage_key": "kost-jkt-049/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m049-10",
        "kost_id": "kost-jkt-049",
        "tipe": "video",
        "storage_key": "kost-jkt-049/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-050",
    "slug": "kost-cipayung-cozy-cipayung-jakarta-timur",
    "nama": "Kost Cipayung Cozy",
    "alamat": "Jl. Kamboja No. 26, Cipayung, Jakarta Timur",
    "area": "Cipayung",
    "kota": "Jakarta",
    "harga": 1500000,
    "tipe": "putra",
    "latitude": -6.336,
    "longitude": 106.9021,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Laundry Kiloan Dekat",
      "Dapur Bersama",
      "Parkir Motor",
      "Water Heater"
    ],
    "deskripsi": "Kost putra nyaman di Cipayung, Jakarta Timur, dekat Taman Mini Indonesia Indah dan akses tol Jagorawi. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000050",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m050-1",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-050/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan gedung Kost Kuningan Executive Residence"
      },
      {
        "id": "m050-2",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-050/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m050-3",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-050/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m050-4",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-050/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m050-5",
        "kost_id": "kost-jkt-050",
        "tipe": "video",
        "storage_key": "kost-jkt-050/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m050-6",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-050/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m050-7",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-050/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m050-8",
        "kost_id": "kost-jkt-050",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-050/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m050-9",
        "kost_id": "kost-jkt-050",
        "tipe": "video",
        "storage_key": "kost-jkt-050/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m050-10",
        "kost_id": "kost-jkt-050",
        "tipe": "video",
        "storage_key": "kost-jkt-050/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-051",
    "slug": "kost-menteng-mahasiswa-menteng-jakarta-pusat",
    "nama": "Kost Menteng Mahasiswa",
    "alamat": "Jl. Cempaka No. 21, Menteng, Jakarta Pusat",
    "area": "Menteng",
    "kota": "Jakarta",
    "harga": 1200000,
    "tipe": "campur",
    "latitude": -6.1974,
    "longitude": 106.8317,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Housekeeping 1x/Minggu",
      "Bebas Banjir",
      "Water Heater",
      "Lemari Pakaian",
      "Kasur Springbed",
      "Balkon Pribadi"
    ],
    "deskripsi": "Kost campur nyaman di Menteng, Jakarta Pusat, dekat Stasiun Gondangdia dan Taman Suropati. Kamar bersih dengan sirkulasi udara baik, 13 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000051",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m051-1",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-051/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan asri Kost Putri Tebet"
      },
      {
        "id": "m051-2",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-051/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m051-3",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-051/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m051-4",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-051/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m051-5",
        "kost_id": "kost-jkt-051",
        "tipe": "video",
        "storage_key": "kost-jkt-051/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m051-6",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-051/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m051-7",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-051/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m051-8",
        "kost_id": "kost-jkt-051",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-051/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m051-9",
        "kost_id": "kost-jkt-051",
        "tipe": "video",
        "storage_key": "kost-jkt-051/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m051-10",
        "kost_id": "kost-jkt-051",
        "tipe": "video",
        "storage_key": "kost-jkt-051/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-052",
    "slug": "kost-gambir-homey-gambir-jakarta-pusat",
    "nama": "Kost Gambir Homey",
    "alamat": "Jl. Kemuning No. 22, Gambir, Jakarta Pusat",
    "area": "Gambir",
    "kota": "Jakarta",
    "harga": 1500000,
    "tipe": "putra",
    "latitude": -6.1805,
    "longitude": 106.8314,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Water Heater",
      "CCTV 24 Jam",
      "Housekeeping 1x/Minggu"
    ],
    "deskripsi": "Kost putra nyaman di Gambir, Jakarta Pusat, dekat Stasiun Gambir dan Monas. Kamar bersih dengan sirkulasi udara baik, 23 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000052",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m052-1",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-052/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Benhil Residence"
      },
      {
        "id": "m052-2",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-052/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m052-3",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-052/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m052-4",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-052/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m052-5",
        "kost_id": "kost-jkt-052",
        "tipe": "video",
        "storage_key": "kost-jkt-052/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m052-6",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-052/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m052-7",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-052/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m052-8",
        "kost_id": "kost-jkt-052",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-052/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m052-9",
        "kost_id": "kost-jkt-052",
        "tipe": "video",
        "storage_key": "kost-jkt-052/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m052-10",
        "kost_id": "kost-jkt-052",
        "tipe": "video",
        "storage_key": "kost-jkt-052/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-053",
    "slug": "kost-putri-tanah-abang-studio-tanah-abang-jakarta-pusat",
    "nama": "Kost Putri Tanah Abang Studio",
    "alamat": "Jl. Dahlia No. 23, Tanah Abang, Jakarta Pusat",
    "area": "Tanah Abang",
    "kota": "Jakarta",
    "harga": 1350000,
    "tipe": "putri",
    "latitude": -6.1868,
    "longitude": 106.8107,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "CCTV 24 Jam",
      "Water Heater",
      "Bebas Banjir",
      "Lemari Pakaian",
      "Smart TV"
    ],
    "deskripsi": "Kost putri nyaman di Tanah Abang, Jakarta Pusat, dekat Stasiun Tanah Abang dan Pasar Tanah Abang. Kamar bersih dengan sirkulasi udara baik, 28 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000053",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m053-1",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-053/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Fasad bangunan kost Palmerah Binus"
      },
      {
        "id": "m053-2",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-053/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m053-3",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-053/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m053-4",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-053/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m053-5",
        "kost_id": "kost-jkt-053",
        "tipe": "video",
        "storage_key": "kost-jkt-053/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m053-6",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-053/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m053-7",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-053/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m053-8",
        "kost_id": "kost-jkt-053",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-053/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m053-9",
        "kost_id": "kost-jkt-053",
        "tipe": "video",
        "storage_key": "kost-jkt-053/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m053-10",
        "kost_id": "kost-jkt-053",
        "tipe": "video",
        "storage_key": "kost-jkt-053/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-054",
    "slug": "kost-bendungan-hilir-prima-tanah-abang-jakarta-pusat",
    "nama": "Kost Bendungan Hilir Prima",
    "alamat": "Jl. Sakura No. 9, Tanah Abang, Jakarta Pusat",
    "area": "Bendungan Hilir",
    "kota": "Jakarta",
    "harga": 1350000,
    "tipe": "campur",
    "latitude": -6.2209,
    "longitude": 106.8152,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kulkas",
      "Water Heater",
      "Balkon Pribadi",
      "Laundry Kiloan Dekat",
      "CCTV 24 Jam"
    ],
    "deskripsi": "Kost campur nyaman di Bendungan Hilir, Jakarta Pusat, dekat MRT Bendungan Hilir dan Plaza Senayan. Kamar bersih dengan sirkulasi udara baik, 16 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000054",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m054-1",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-054/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Grogol Suite"
      },
      {
        "id": "m054-2",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-054/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m054-3",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-054/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m054-4",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-054/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m054-5",
        "kost_id": "kost-jkt-054",
        "tipe": "video",
        "storage_key": "kost-jkt-054/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m054-6",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-054/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m054-7",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-054/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m054-8",
        "kost_id": "kost-jkt-054",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-054/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m054-9",
        "kost_id": "kost-jkt-054",
        "tipe": "video",
        "storage_key": "kost-jkt-054/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m054-10",
        "kost_id": "kost-jkt-054",
        "tipe": "video",
        "storage_key": "kost-jkt-054/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-055",
    "slug": "kost-sawah-besar-cozy-sawah-besar-jakarta-pusat",
    "nama": "Kost Sawah Besar Cozy",
    "alamat": "Jl. Kamboja No. 42, Sawah Besar, Jakarta Pusat",
    "area": "Sawah Besar",
    "kota": "Jakarta",
    "harga": 3400000,
    "tipe": "putra",
    "latitude": -6.1569,
    "longitude": 106.8278,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Kulkas",
      "Dapur Bersama",
      "Parkir Mobil & Motor",
      "Bebas Banjir",
      "Kasur Springbed",
      "Laundry Kiloan Dekat"
    ],
    "deskripsi": "Kost putra nyaman di Sawah Besar, Jakarta Pusat, dekat Stasiun Juanda dan Pasar Baru. Kamar bersih dengan sirkulasi udara baik, 28 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000055",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m055-1",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-055/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Salemba Cendana"
      },
      {
        "id": "m055-2",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-055/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m055-3",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-055/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m055-4",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-055/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m055-5",
        "kost_id": "kost-jkt-055",
        "tipe": "video",
        "storage_key": "kost-jkt-055/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m055-6",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-055/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m055-7",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-055/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m055-8",
        "kost_id": "kost-jkt-055",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-055/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m055-9",
        "kost_id": "kost-jkt-055",
        "tipe": "video",
        "storage_key": "kost-jkt-055/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m055-10",
        "kost_id": "kost-jkt-055",
        "tipe": "video",
        "storage_key": "kost-jkt-055/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-056",
    "slug": "kost-kemayoran-putri-asri-kemayoran-jakarta-pusat",
    "nama": "Kost Kemayoran Putri Asri",
    "alamat": "Jl. Mawar No. 26, Kemayoran, Jakarta Pusat",
    "area": "Kemayoran",
    "kota": "Jakarta",
    "harga": 2100000,
    "tipe": "putri",
    "latitude": -6.1671,
    "longitude": 106.8417,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Akses Card 24 Jam",
      "Housekeeping 1x/Minggu",
      "Kulkas",
      "Rooftop Lounge"
    ],
    "deskripsi": "Kost putri nyaman di Kemayoran, Jakarta Pusat, dekat JIEXPO Kemayoran dan Mal Gunung Sahari. Kamar bersih dengan sirkulasi udara baik, 30 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000056",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m056-1",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-056/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Gedung modern 4 lantai Kost Setiabudi Skyline"
      },
      {
        "id": "m056-2",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-056/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar tidur luas kasur queen size dengan jendela sirkulasi udara luar"
      },
      {
        "id": "m056-3",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-056/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja nyaman WFH dengan colokan stopkontak berlimpah"
      },
      {
        "id": "m056-4",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-056/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m056-5",
        "kost_id": "kost-jkt-056",
        "tipe": "video",
        "storage_key": "kost-jkt-056/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m056-6",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-056/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m056-7",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-056/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m056-8",
        "kost_id": "kost-jkt-056",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-056/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m056-9",
        "kost_id": "kost-jkt-056",
        "tipe": "video",
        "storage_key": "kost-jkt-056/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m056-10",
        "kost_id": "kost-jkt-056",
        "tipe": "video",
        "storage_key": "kost-jkt-056/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-057",
    "slug": "kost-cempaka-putih-mahasiswa-cempaka-putih-jakarta-pusat",
    "nama": "Kost Cempaka Putih Mahasiswa",
    "alamat": "Jl. Cempaka No. 29, Cempaka Putih, Jakarta Pusat",
    "area": "Cempaka Putih",
    "kota": "Jakarta",
    "harga": 1650000,
    "tipe": "campur",
    "latitude": -6.1751,
    "longitude": 106.872,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Parkir Motor",
      "Lemari Pakaian",
      "Balkon Pribadi",
      "Laundry Kiloan Dekat"
    ],
    "deskripsi": "Kost campur nyaman di Cempaka Putih, Jakarta Pusat, dekat RS Islam Cempaka Putih dan Pasar Cempaka Putih. Kamar bersih dengan sirkulasi udara baik, 23 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000057",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m057-1",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-057/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Tanjung Duren Asri"
      },
      {
        "id": "m057-2",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-057/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam keramik granit bersih water heater"
      },
      {
        "id": "m057-3",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-057/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Lemari pakaian 3 pintu built-in dengan cermin full body"
      },
      {
        "id": "m057-4",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-057/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m057-5",
        "kost_id": "kost-jkt-057",
        "tipe": "video",
        "storage_key": "kost-jkt-057/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m057-6",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-057/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m057-7",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-057/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m057-8",
        "kost_id": "kost-jkt-057",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-057/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m057-9",
        "kost_id": "kost-jkt-057",
        "tipe": "video",
        "storage_key": "kost-jkt-057/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m057-10",
        "kost_id": "kost-jkt-057",
        "tipe": "video",
        "storage_key": "kost-jkt-057/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  },
  {
    "id": "kost-jkt-058",
    "slug": "kost-johar-baru-homey-johar-baru-jakarta-pusat",
    "nama": "Kost Johar Baru Homey",
    "alamat": "Jl. Kemuning No. 7, Johar Baru, Jakarta Pusat",
    "area": "Johar Baru",
    "kota": "Jakarta",
    "harga": 2750000,
    "tipe": "putra",
    "latitude": -6.1865,
    "longitude": 106.8536,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Penjaga 24 Jam",
      "CCTV 24 Jam",
      "Rooftop Lounge",
      "Parkir Motor",
      "Kasur Springbed"
    ],
    "deskripsi": "Kost putra nyaman di Johar Baru, Jakarta Pusat, dekat Pasar Johar Baru dan Stasiun Senen. Kamar bersih dengan sirkulasi udara baik, 24 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Wajib menjaga kebersihan area bersama",
      "Tamu wajib lapor pengelola",
      "Dilarang membawa alat masak listrik berdaya besar"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000058",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m058-1",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-058/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1200&q=80&crop=right",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan Kost Kelapa Gading Boulevard"
      },
      {
        "id": "m058-2",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-058/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Pantry bersama microwave kulkas besar dan dispenser"
      },
      {
        "id": "m058-3",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-058/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Basement parkir mobil dan motor berpaving dengan CCTV"
      },
      {
        "id": "m058-4",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-058/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m058-5",
        "kost_id": "kost-jkt-058",
        "tipe": "video",
        "storage_key": "kost-jkt-058/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m058-6",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-058/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m058-7",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-058/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m058-8",
        "kost_id": "kost-jkt-058",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-058/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m058-9",
        "kost_id": "kost-jkt-058",
        "tipe": "video",
        "storage_key": "kost-jkt-058/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m058-10",
        "kost_id": "kost-jkt-058",
        "tipe": "video",
        "storage_key": "kost-jkt-058/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      }
    ]
  },
  {
    "id": "kost-jkt-059",
    "slug": "kost-putri-senen-studio-senen-jakarta-pusat",
    "nama": "Kost Putri Senen Studio",
    "alamat": "Jl. Dahlia No. 18, Senen, Jakarta Pusat",
    "area": "Senen",
    "kota": "Jakarta",
    "harga": 2100000,
    "tipe": "putri",
    "latitude": -6.176,
    "longitude": 106.8471,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Balkon Pribadi",
      "Dapur Bersama",
      "Meja Kursi",
      "Bebas Banjir",
      "Kasur Springbed"
    ],
    "deskripsi": "Kost putri nyaman di Senen, Jakarta Pusat, dekat Stasiun Pasar Senen dan Atrium Senen. Kamar bersih dengan sirkulasi udara baik, 30 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tamu lawan jenis tidak boleh masuk kamar",
      "Jam malam pukul 23:00",
      "Dilarang membawa hewan peliharaan"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000059",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m059-1",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-059/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80&crop=top",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Bangunan minimalis tropis Kost Cilandak Fatmawati"
      },
      {
        "id": "m059-2",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-059/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar putri bersih sprei lembut dan pendingin AC dingin"
      },
      {
        "id": "m059-3",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-059/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Meja kerja dan rak buku"
      },
      {
        "id": "m059-4",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-059/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m059-5",
        "kost_id": "kost-jkt-059",
        "tipe": "video",
        "storage_key": "kost-jkt-059/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      },
      {
        "id": "m059-6",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-059/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m059-7",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-059/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m059-8",
        "kost_id": "kost-jkt-059",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-059/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m059-9",
        "kost_id": "kost-jkt-059",
        "tipe": "video",
        "storage_key": "kost-jkt-059/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m059-10",
        "kost_id": "kost-jkt-059",
        "tipe": "video",
        "storage_key": "kost-jkt-059/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      }
    ]
  },
  {
    "id": "kost-jkt-060",
    "slug": "kost-cikini-prima-menteng-jakarta-pusat",
    "nama": "Kost Cikini Prima",
    "alamat": "Jl. Sakura No. 23, Menteng, Jakarta Pusat",
    "area": "Cikini",
    "kota": "Jakarta",
    "harga": 2500000,
    "tipe": "campur",
    "latitude": -6.1887,
    "longitude": 106.8385,
    "fasilitas": [
      "AC",
      "WiFi Cepat",
      "Kamar Mandi Dalam",
      "Lemari Pakaian",
      "Kasur Springbed",
      "Akses Card 24 Jam",
      "Smart TV",
      "Housekeeping 1x/Minggu",
      "Dapur Bersama"
    ],
    "deskripsi": "Kost campur nyaman di Cikini, Jakarta Pusat, dekat Stasiun Cikini dan Taman Ismail Marzuki. Kamar bersih dengan sirkulasi udara baik, 28 kamar tersedia, lingkungan aman dan akses mudah ke transportasi umum serta tempat makan.",
    "peraturan": [
      "Tidak boleh merokok di dalam kamar",
      "Tamu menginap wajib konfirmasi pengelola",
      "Jam tenang pukul 23:00 - 06:00"
    ],
    "status": "tersedia",
    "owner_whatsapp": "628120000060",
    "created_at": "2026-04-01T08:00:00Z",
    "updated_at": "2026-04-18T10:00:00Z",
    "media": [
      {
        "id": "m060-1",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_gedung",
        "storage_key": "kost-jkt-060/gedung-depan.webp",
        "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "urutan": 1,
        "is_preview": true,
        "alt_text": "Tampak depan gedung Kost Kuningan Executive Residence"
      },
      {
        "id": "m060-2",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-060/kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
        "urutan": 2,
        "is_preview": true,
        "alt_text": "Kamar mandi dalam shower dan kloset duduk"
      },
      {
        "id": "m060-3",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-060/kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
        "urutan": 3,
        "is_preview": true,
        "alt_text": "Dapur bersama bersih dispenser air galon gratis"
      },
      {
        "id": "m060-4",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-060/kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "urutan": 4,
        "is_preview": true,
        "alt_text": "Kamar studio modern dengan pencahayaan hangat"
      },
      {
        "id": "m060-5",
        "kost_id": "kost-jkt-060",
        "tipe": "video",
        "storage_key": "kost-jkt-060/video-preview-walkthrough.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39744-large.mp4",
        "urutan": 5,
        "is_preview": true,
        "alt_text": "Video preview walkthrough kamar dan koridor lantai 2"
      },
      {
        "id": "m060-6",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-060/premium-kamar-1.webp",
        "url": "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80",
        "urutan": 6,
        "is_preview": false,
        "alt_text": "Kamar nyaman kasur singlebed empuk"
      },
      {
        "id": "m060-7",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-060/premium-kamar-2.webp",
        "url": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 7,
        "is_preview": false,
        "alt_text": "Lounge coworking space bersama di lantai mezanin"
      },
      {
        "id": "m060-8",
        "kost_id": "kost-jkt-060",
        "tipe": "foto_kamar",
        "storage_key": "kost-jkt-060/premium-kamar-3.webp",
        "url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        "urutan": 8,
        "is_preview": false,
        "alt_text": "Fasilitas gym mini dan rooftop view city lights"
      },
      {
        "id": "m060-9",
        "kost_id": "kost-jkt-060",
        "tipe": "video",
        "storage_key": "kost-jkt-060/premium-video-360.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
        "urutan": 9,
        "is_preview": false,
        "alt_text": "Video detail 360 derajat sudut kamar dan tes shower"
      },
      {
        "id": "m060-10",
        "kost_id": "kost-jkt-060",
        "tipe": "video",
        "storage_key": "kost-jkt-060/premium-video-rute.mp4",
        "url": "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-over-a-foggy-pine-forest-40409-large.mp4",
        "urutan": 10,
        "is_preview": false,
        "alt_text": "Video rute jalan pintas tembus ke jalan Prof Dr Satrio"
      }
    ]
  }
];
