# Skema `projects.json` (v2)

Data proyek yang dibaca halaman `/project/` dan panel CMS `/admin/`.
Dokumen ini acuan untuk mengisi proyek 2–4.

## Di mana datanya hidup

Dua salinan, satu yang dibaca:

1. `data/projects.json` — seed di repo. Ini yang masuk git.
2. `cms/projects.json` di Vercel Blob — hasil simpan dari `/admin/`.

`readProjectsJson()` (`api/admin.js`) **selalu memprioritaskan salinan Blob**. Kalau Blob
sudah pernah ditulis, seed lokal tidak berpengaruh apa pun sampai Blob dihapus/ditimpa.
Artinya: mengedit `data/projects.json` di repo **bukan** cara mengganti isi situs live —
pakai panel CMS, atau siapkan seed untuk deploy pertama.

## Bentuk berkas

```json
{
  "schema": 2,
  "featured": "<slug>",
  "projects": [ /* objek proyek */ ]
}
```

| Field | Tipe | Catatan |
|---|---|---|
| `schema` | number | Penanda versi. v2 = `2`. Dipakai untuk toleransi baca, bukan validasi kaku. |
| `featured` | string | **Slug** proyek yang ditandai Featured. Bukan objek. Boleh kosong. |
| `projects` | array | Daftar proyek, urutan di berkas tidak penting (diurut saat render). |

### Objek proyek

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `slug` | string | ya | Identitas + URL: `/project/?s=<slug>`. Unik, huruf kecil, tanda hubung. |
| `name` | string | ya | Nama tampil proyek. |
| `status` | `"published"` \| `"draft"` | ya | `draft` (dan `archived`) disembunyikan dari index maupun detail. Bawaan `published`. |
| `display_order` | number | ya | Urutan tampil, kecil lebih dulu. Bila sama, diurut nama. |
| `category` | string \| null | tidak | Kategori filter (Interior / Eksterior / Arsitektur). `null` = belum dipastikan → filter memakai `type` sebagai gantinya. |
| `type` | string | ya | Lingkup pekerjaan, mis. `Full Scope — Design & Build`. |
| `location` | objek `{city, province}` | ya | Dua field terpisah. Bentuk v1 (satu string `"Kota, Provinsi"`) masih dibaca; dipisah saat disimpan. |
| `year` | string | ya | Tahun pengerjaan, disimpan sebagai string (`"2024"`) supaya `null`/kosong aman di CMS. |
| `specification` | string | tidak | Spesifikasi singkat. Field v1 bernama `specifics`. |
| `budget_range` | string \| null | tidak | Kisaran budget. `null` = tidak ditampilkan. **Jangan diisi tanpa persetujuan owner** — ini klaim publik. |
| `client_description` | string | tidak | Deskripsi klien, mis. `General Practitioner`. Field v1 bernama `client`. |
| `cover` | string | ya | Path relatif ke root situs: `assets/img/…`. `/project/app.js` me-rebase ke `../` sendiri. |
| `coverAlt` | string | ya | Teks alt deskriptif untuk cover (aksesibilitas, PRD §12.3). |
| `description` | string | ya | Paragraf proyek. Dipakai juga sebagai fallback meta description. |
| `highlights` | string[] | tidak | Poin sorotan, satu per baris di CMS. |
| `gallery` | objek[] | tidak | Lihat di bawah. |
| `seo` | objek `{title, description}` | tidak | `title` ≤ 60 char, `description` 150–160 char. Kosong = fallback otomatis. |

### Item `gallery`

```json
{ "thumb": "assets/img/thumb-1.jpg", "label": "Ruang makan", "alt": "Ruang makan" }
```

| Field | Tipe | Catatan |
|---|---|---|
| `thumb` | string | Path relatif root. Sebuah string polos juga diterima (dibaca sebagai `thumb`). |
| `label` | string | Nama singkat untuk tombol thumbnail. |
| `alt` | string | Alt gambar. **Wajib** (PRD §12.3). Jangan mengarang deskripsi visual — isi dengan `label` apa adanya kalau belum ada yang bisa memastikan isi fotonya. |

## Peta v1 → v2 (dipakai saat migrasi)

| v1 | v2 |
|---|---|
| `featured: { …objek proyek… }` | `featured: "<slug>"` — isi proyeknya tinggal di `projects[]`, tidak diduplikasi |
| `location: "Padang, West Sumatera"` | `location: {city: "Padang", province: "West Sumatera"}` |
| `specifics` | `specification` |
| `client` | `client_description` |
| `seo_title` / `seo_description` | `seo.title` / `seo.description` |
| — | `status`, `display_order`, `category`, `budget_range` |

Menyimpan proyek dari panel CMS selalu menulis bentuk v2; field v1 tidak disalin, jadi
menyimpan satu proyek sekaligus memigrasikannya.

## Aturan render (dipatuhi `/project/app.js`)

- Proyek `draft`/`archived` tidak pernah tampil.
- Index diurut `display_order`, lalu nama.
- Filter kategori/lokasi/tahun digabung dengan AND; satu nilai per dimensi; state di URL
  (`?cat=&loc=&year=`) supaya bisa dibagikan dan tombol back bekerja (AC-2).
- Nilai filter diturunkan dari data yang ada — opsi baru muncul sendiri begitu ada proyek
  dengan nilai itu, tidak ada daftar hardcoded.
- Detail proyek mengisi `document.title`, meta description, canonical (self-referencing:
  `/project/?s=<slug>`, tanpa `src=`), dan JSON-LD `CreativeWork` + `BreadcrumbList` dari
  field di atas. URL absolut sengaja **tidak** dikarang (domain kanonik belum diputuskan
  owner) — semua canonical di repo masih relatif.

## Yang belum diputuskan owner

1. **Domain kanonik**: `trilux-design-page.vercel.app` vs `trilux.plusthe.site`. Canonical
   di repo sekarang relatif (`/`, `/project/`, `/studio/`) supaya tidak menunjuk domain yang
   salah; nanti perlu diganti absolut setelah diputuskan.
2. **Halaman landing**: featured masih hardcoded di `index.html` (4 slot, 3 disabled),
   belum dihidrasi dari CMS — memilih featured di `/admin/` belum mengubah landing.
3. **Kategori & kisaran budget proyek 1**: masih `null`; menunggu data dari owner.
