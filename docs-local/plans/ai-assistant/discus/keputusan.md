1. Kunci LLM: pakai akun OpenRouter yang sama dengan desa-platform, atau akun terpisah?

Akun yang sama , btw saya menggunakan claude dan custom proxy saja agar mudah jadi nanti perfitur ( 3 fitur yang saya request ) bisa menginputkan masing masing API key nya. 

![](orca-paste-1790750686756-fe714f57-7b1c-499c-b478-fab4d70241b7.png)



2. Pengguna: semua user yang login, atau admin saja dulu? Perlu fitur izin baru use-ai-assistant di FEATURES?

Semua user yang sudah login dan sudah acc . Artinya bisa masuk ke dashboard, karena nantinya akan saya letakan disini 

![](orca-paste-1790750814740-6f95d8f3-2ffa-4755-a0de-0e5958df742a.png)



3. Cakupan MVP: baca-saja (disarankan), atau langsung ada aksi tulis?

Baca saja disini maksud gimna dan aksi tulis seperti apa ?



4. Riwayat chat: per sesi browser (tanpa migrasi), atau disimpan di DB (perlu migrasi)?

Simpan saja agar ada riwayatnya, saya rasa desa-platform juga menerapkan ini bukan?



5. Acuan suara: mode Voice ChatGPT atau Project Astra? Pengguna biasanya pakai browser apa?

Ini bisa di bahas lebih lanjut karena ini kali pertama saya menyentuh konteks  mode Voice ChatGPT,



6. Nama asisten: tetap "Jenna" atau nama lain? Apa pun pilihannya, nama akan dibuat bisa diubah lewat config.

Bisa di set lewat config tapi deafult Jenna



7. docs-local/: dimasukkan ke .gitignore atau di-commit?

Tidak perlu, biarkan dulu



NOTE:

Fitur AI menunjuk elemen di halaman dan Suara saya ingin di bahas 1 persatu , agar bisa fokus. Sama hal nya dengan fitur Tombol melayang + panel "Tanya AI", mungkin ini di awal dulu.