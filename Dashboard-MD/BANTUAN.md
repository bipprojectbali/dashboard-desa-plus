Design Contract – Halaman Bantuan / Support Center

Dokumen ini adalah kontrak desain UI/UX untuk halaman Bantuan / Support Center.
Implementasi tidak dapat dilanjutkan tanpa mengikuti spesifikasi ini secara konsisten.

1. Tujuan Halaman

Halaman Bantuan bertujuan untuk:

Memberikan akses cepat ke panduan & dokumentasi

Menyediakan video tutorial

Menjawab pertanyaan umum (FAQ)

Menyediakan kontak support

Menyediakan virtual assistant (chat)

Menampilkan statistik kredibilitas platform

2. Struktur Layout Keseluruhan
Layout Grid

Menggunakan 3-column responsive grid.

Desktop (≥ 1200px)

Grid: 3 columns

Gap: 32px

Container max-width: 1200px – 1320px

Center aligned

Tablet (768px – 1199px)

Grid: 2 columns

Gap: 24px

Mobile (< 768px)

Grid: 1 column

Gap: 16px

Card full width

3. Struktur Komponen UI
3.1 Card Utama (Reusable Component)

Semua section menggunakan komponen dasar:

Card
 ├── Icon Container
 ├── Title
 ├── List / Content

Spesifikasi Card

Border radius: 16px

Padding: 24px

Shadow:

Light: soft shadow

Dark: subtle glow / low-opacity shadow

Transition hover: 0.2s ease

Hover effect:

Slight lift (translateY(-2px))

Elevation shadow increase

4. Daftar Komponen
4.1 Panduan Memulai

Isi:

Cara Login

Navigasi Dashboard

Fitur Dasar

Tips & Trik

Interaksi:

Klik item → navigasi ke halaman detail

Cursor pointer

Hover underline atau highlight

4.2 Video Tutorial

Isi:

Dashboard Overview

Analisis Data

Membuat Laporan

Export Data

Interaksi:

Klik → buka modal video atau halaman video

Bisa tambahkan icon play kecil di tiap item

4.3 FAQ

Isi:

Masalah Login

Reset Password

Akses Data

Laporan Error

Interaksi:

Accordion expand/collapse

Animasi height smooth (200–300ms)

4.4 Hubungi Support

Isi:

Email

WhatsApp

Jam Kerja

Waktu Respon

Interaksi:

Email → mailto link

WhatsApp → wa.me link

Jam kerja non-clickable

4.5 Dokumentasi

Isi:

API Reference

Integrasi Sistem

Format Data

Best Practices

Interaksi:

Klik → navigasi dokumentasi

4.6 Jenna – Virtual Assistant

Komponen:

Chat Container
 ├── Header Title
 ├── Chat Message Area
 ├── Input Field
 └── Send Button


Spesifikasi:

Tinggi tetap (±300–350px)

Scrollable message container

Input rounded

Send button icon (arrow)

Interaksi:

Enter → kirim pesan

Klik send → kirim pesan

Auto-scroll ke pesan terakhir

Disabled state saat loading

4.7 Statistik Section

3 Card horizontal:

150+ Artikel Panduan

50+ Video Tutorial

24/7 Support Aktif

Spesifikasi:

Center aligned text

Angka besar (font-size 32–40px)

Subtext kecil opacity 70%

5. Design System
5.1 Light Mode
Background

Page background: #F5F7FA

Card background: #FFFFFF

Primary Color

Blue: #3B82F6

Hover: #2563EB

Text

Primary: #111827

Secondary: #6B7280

Border

#E5E7EB

Shadow
0 4px 12px rgba(0,0,0,0.05)

Icon Container

Background: #EFF6FF

Icon color: #2563EB

5.2 Dark Mode
Background

Page background: #0F172A

Card background: #1E293B

Primary Color

Blue: #3B82F6

Hover: #60A5FA

Text

Primary: #F8FAFC

Secondary: #94A3B8

Border

#334155

Shadow
0 4px 20px rgba(0,0,0,0.4)

Icon Container

Background: #1D4ED8

Icon color: #FFFFFF

6. Typography

Font Family:

Inter / Poppins / System UI

Hierarchy:

Element	Size	Weight
Section Title	18–20px	600
Card Title	16–18px	600
List Item	14–16px	400
Statistik Number	32–40px	700

Line height:

1.5 standard

1.2 for large numbers

7. Spacing System

Gunakan sistem 8pt grid:

8px

16px

24px

32px

48px

Padding Card: 24px
Gap Grid Desktop: 32px

8. Responsivitas
Desktop

3 kolom utama

Statistik 3 sejajar

Tablet

2 kolom

Statistik 2 + 1

Mobile

1 kolom

Statistik stacked vertical

Chat full width

9. State & Interactivity Requirements

Harus tersedia:

Hover state

Active state

Focus state (accessibility)

Disabled state

Loading state (chat)

Keyboard support:

Tab navigable

Enter kirim pesan

Esc tutup modal (jika ada)

10. Accessibility

Minimum contrast ratio 4.5:1

Focus ring visible

Button min-height 40px

Click area minimal 44x44px

11. Animasi

Durasi standar: 200ms – 300ms
Easing: ease-in-out

Digunakan untuk:

Hover card

Accordion FAQ

Chat message appear

Button press

12. Toggle Dark / Light Mode

Harus tersedia:

Theme switcher

Persist ke localStorage

Default mengikuti system preference

13. Data Dinamis

Data yang harus bisa dinamis:

Jumlah artikel

Jumlah video

Status support 24/7

Chat message list

FAQ content

Dokumentasi link

14. Non-Functional Requirements

Clean modular component

Reusable Card component

Maintainable theme config

Dark & Light share same structure

15. Kesimpulan

Halaman ini menggunakan:

Card-based layout

Grid responsive

Dual theme (Light & Dark)

High clarity & readability

Modern SaaS style

Virtual assistant as engagement point

Implementasi wajib mengikuti spesifikasi ini agar:

Konsistensi visual terjaga

User experience optimal

Maintainability tinggi

Skalabilitas mudah