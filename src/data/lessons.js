export const LESSONS = [
  {
    id: 'variabel-let-const',
    module: 'Modul 1: Dasar Sintaks',
    title: '1. Variabel (let dan const)',
    duration: '5 mnt',
    explanation: [
      {
        type: 'text',
        content:
          'Variabel adalah wadah untuk menyimpan data di dalam program. Di JavaScript modern (ES6+), kita menggunakan dua kata kunci utama: let dan const.',
      },
      {
        type: 'list',
        items: [
          'const digunakan untuk nilai yang tetap dan tidak akan diubah lagi (konstanta).',
          'let digunakan untuk nilai yang dapat berubah di kemudian waktu (misalnya skor game atau penghitung).',
        ],
      },
      {
        type: 'code',
        content: `const namaAplikasi = "KodeBelajar";\nlet skor = 10;\n\nskor = 25; // Berhasil karena menggunakan let\nconsole.log(namaAplikasi, skor);`,
      },
    ],
    challenge:
      'Buatlah sebuah variabel konstanta bernama `bahasa` dengan nilai `"JavaScript"`, dan sebuah variabel `level` menggunakan `let` dengan nilai awal `1`. Setelah itu, ubah nilai `level` menjadi `2` dan tampilkan keduanya menggunakan `console.log(bahasa, level)`.',
    starterCode: `// Tulis kodemu di bawah ini\n\n`,
    hints: [
      'Gunakan `const bahasa = "JavaScript";` untuk mendeklarasikan variabel konstan.',
      'Gunakan `let level = 1;` lalu pada baris berikutnya ubah nilainya dengan `level = 2;`.',
      'Gunakan `console.log(bahasa, level);` di baris paling akhir untuk mencetak hasil.',
    ],
    validate: ({ logs, scope }) => [
      {
        label: 'Variabel `bahasa` bernilai "JavaScript"',
        passed: scope.bahasa === 'JavaScript',
      },
      {
        label: 'Variabel `level` berhasil diubah menjadi 2',
        passed: scope.level === 2,
      },
      {
        label: 'Output mencetak "JavaScript" dan 2 di konsol',
        passed: logs.some((l) => l.includes('JavaScript') && l.includes('2')),
      },
    ],
  },
  {
    id: 'tipe-data-dasar',
    module: 'Modul 1: Dasar Sintaks',
    title: '2. Tipe Data Dasar',
    duration: '6 mnt',
    explanation: [
      {
        type: 'text',
        content:
          'Setiap nilai di JavaScript memiliki tipe data tertentu. Tiga tipe data primitif yang paling sering digunakan adalah String, Number, dan Boolean.',
      },
      {
        type: 'list',
        items: [
          'String: Teks yang diapit tanda kutip ("..." atau \'...\').',
          'Number: Angka, baik bilangan bulat maupun desimal (tanpa tanda kutip).',
          'Boolean: Nilai logika kebenaran, hanya memiliki dua nilai: true atau false.',
        ],
      },
      {
        type: 'code',
        content: `const kota = "Bandung";      // String\nconst suhu = 24.5;           // Number\nconst sedangHujan = false;   // Boolean\n\nconsole.log(typeof kota);    // "string"`,
      },
    ],
    challenge:
      'Deklarasikan 3 variabel berikut: `namaProduk` bertipe String (contoh: `"Kopi Susu"`), `harga` bertipe Number bernilai `18000`, dan `tersedia` bertipe Boolean bernilai `true`.',
    starterCode: `// Deklarasikan 3 variabel dengan tipe data yang sesuai\nconst namaProduk = ;\nconst harga = ;\nconst tersedia = ;\n`,
    hints: [
      'Pastikan `namaProduk` diapit tanda kutip, misalnya `const namaProduk = "Kopi Susu";`.',
      'Angka `18000` tidak boleh memakai tanda kutip atau titik pemisah ribuan.',
      'Boolean `true` ditulis dengan huruf kecil semua tanpa tanda kutip.',
    ],
    validate: ({ scope }) => [
      {
        label: '`namaProduk` bertipe String dan tidak kosong',
        passed: typeof scope.namaProduk === 'string' && scope.namaProduk.trim().length > 0,
      },
      {
        label: '`harga` bertipe Number dengan nilai 18000',
        passed: typeof scope.harga === 'number' && scope.harga === 18000,
      },
      {
        label: '`tersedia` bertipe Boolean dengan nilai true',
        passed: typeof scope.tersedia === 'boolean' && scope.tersedia === true,
      },
    ],
  },
  {
    id: 'operator-aritmatika-perbandingan',
    module: 'Modul 1: Dasar Sintaks',
    title: '3. Operator Aritmatika & Perbandingan',
    duration: '7 mnt',
    explanation: [
      {
        type: 'text',
        content:
          'Operator aritmatika (+, -, *, /, %) digunakan untuk melakukan perhitungan matematika, sedangkan operator perbandingan (===, !==, >, <, >=, <=) menghasilkan nilai Boolean (true/false).',
      },
      {
        type: 'code',
        content: `const a = 10;\nconst b = 3;\nconsole.log(a + b);    // 13\nconsole.log(a % b);    // 1 (sisa bagi)\nconsole.log(a === 10); // true (sama persis nilai & tipe)`,
      },
    ],
    challenge:
      'Diketahui `hargaSatuan = 25000` dan `jumlahBeli = 4`. Hitung `totalHarga` dengan mengalikan keduanya, lalu buat variabel `dapatDiskon` yang bernilai `true` jika `totalHarga >= 100000`.',
    starterCode: `const hargaSatuan = 25000;\nconst jumlahBeli = 4;\n\n// Hitung totalHarga dan cek apakah dapatDiskon\nconst totalHarga = ;\nconst dapatDiskon = ;\n\nconsole.log("Total:", totalHarga, "Diskon:", dapatDiskon);`,
    hints: [
      'Gunakan tanda bintang `*` untuk perkalian: `hargaSatuan * jumlahBeli`.',
      'Gunakan operator `>=` untuk memeriksa apakah `totalHarga` lebih besar atau sama dengan `100000`.',
    ],
    validate: ({ scope }) => [
      {
        label: '`totalHarga` bernilai 100000',
        passed: scope.totalHarga === 100000,
      },
      {
        label: '`dapatDiskon` bernilai true (Boolean)',
        passed: scope.dapatDiskon === true,
      },
    ],
  },
  {
    id: 'percabangan-if-else',
    module: 'Modul 2: Alur Kontrol',
    title: '4. Percabangan (if / else)',
    duration: '8 mnt',
    explanation: [
      {
        type: 'text',
        content:
          'Percabangan memungkinkan program mengambil keputusan berdasarkan kondisi tertentu. Jika kondisi di dalam `if` bernilai `true`, blok kode pertama dijalankan; jika tidak, blok `else` yang dijalankan.',
      },
      {
        type: 'code',
        content: `const nilai = 82;\n\nif (nilai >= 75) {\n  console.log("Selamat, Anda Lulus!");\n} else {\n  console.log("Silakan coba lagi.");\n}`,
      },
    ],
    challenge:
      'Diberikan variabel `umur = 19`. Gunakan struktur `if / else` untuk mengisi variabel `statusKTP`: isi dengan `"Boleh buat KTP"` jika `umur >= 17`, selain itu isi dengan `"Belum cukup umur"`.',
    starterCode: `const umur = 19;\nlet statusKTP = "";\n\n// Tulis logika if / else di bawah ini\n\n\nconsole.log(statusKTP);`,
    hints: [
      'Awali dengan `if (umur >= 17) { statusKTP = "Boleh buat KTP"; }`.',
      'Tambahkan `else { statusKTP = "Belum cukup umur"; }` setelah blok `if`.',
      'Perhatikan huruf besar dan kecil pada teks `"Boleh buat KTP"`.',
    ],
    validate: ({ logs, scope }) => [
      {
        label: '`statusKTP` berisi "Boleh buat KTP"',
        passed: scope.statusKTP === 'Boleh buat KTP',
      },
      {
        label: 'Konsol menampilkan "Boleh buat KTP"',
        passed: logs.some((l) => l.includes('Boleh buat KTP')),
      },
    ],
  },
  {
    id: 'perulangan-for-loop',
    module: 'Modul 2: Alur Kontrol',
    title: '5. Perulangan (for loop)',
    duration: '8 mnt',
    explanation: [
      {
        type: 'text',
        content:
          'Perulangan `for` digunakan untuk menjalankan blok kode berulang kali secara otomatis selama kondisi masih terpenuhi.',
      },
      {
        type: 'code',
        content: `let jumlah = 0;\nfor (let i = 1; i <= 3; i++) {\n  jumlah = jumlah + i;\n}\nconsole.log(jumlah); // 6 (1 + 2 + 3)`,
      },
    ],
    challenge:
      'Gunakan `for loop` untuk menjumlahkan semua angka dari `1` sampai `5` ke dalam variabel `totalAngka` (hasil akhirnya harus `15`).',
    starterCode: `let totalAngka = 0;\n\n// Buat perulangan for dari 1 sampai 5 di bawah ini\n\n\nconsole.log("Hasil penjumlahan:", totalAngka);`,
    hints: [
      'Gunakan header loop `for (let i = 1; i <= 5; i++) { ... }`.',
      'Di dalam kurung kurawal loop, tambahkan `totalAngka += i;` atau `totalAngka = totalAngka + i;`.',
    ],
    validate: ({ logs, scope }) => [
      {
        label: '`totalAngka` bernilai 15',
        passed: scope.totalAngka === 15,
      },
      {
        label: 'Hasil penjumlahan ditampilkan di konsol',
        passed: logs.some((l) => l.includes('15')),
      },
    ],
  },
  {
    id: 'fungsi-dan-return',
    module: 'Modul 3: Modularitas',
    title: '6. Fungsi (function dan return)',
    duration: '10 mnt',
    explanation: [
      {
        type: 'text',
        content:
          'Fungsi adalah blok kode yang dapat digunakan kembali. Fungsi dapat menerima input melalui parameter dan mengembalikan output menggunakan kata kunci `return`.',
      },
      {
        type: 'code',
        content: `function sapaPengguna(nama) {\n  return "Halo, " + nama + "!";\n}\n\nconst pesan = sapaPengguna("Rina");\nconsole.log(pesan); // "Halo, Rina!"`,
      },
    ],
    challenge:
      'Buatlah sebuah fungsi bernama `hitungLuasPersegi` yang menerima 1 parameter `sisi` dan mengembalikan (`return`) hasil perkalian `sisi * sisi`. Lalu simpan hasil pemanggilan `hitungLuasPersegi(6)` ke dalam variabel `hasilLuas`.',
    starterCode: `// Buat fungsi hitungLuasPersegi di bawah ini\n\n\nconst hasilLuas = hitungLuasPersegi(6);\nconsole.log("Luas persegi:", hasilLuas);`,
    hints: [
      'Deklarasikan fungsi dengan `function hitungLuasPersegi(sisi) { ... }`.',
      'Di dalam fungsi, tulis `return sisi * sisi;`.',
    ],
    validate: ({ logs, scope }) => [
      {
        label: 'Fungsi `hitungLuasPersegi` terdefinisi',
        passed: typeof scope.hitungLuasPersegi === 'function',
      },
      {
        label: '`hitungLuasPersegi(4)` mengembalikan 16',
        passed:
          typeof scope.hitungLuasPersegi === 'function' &&
          scope.hitungLuasPersegi(4) === 16,
      },
      {
        label: '`hasilLuas` bernilai 36 dan tercetak di konsol',
        passed: scope.hasilLuas === 36 && logs.some((l) => l.includes('36')),
      },
    ],
  },
];