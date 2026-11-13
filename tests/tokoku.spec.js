// Nama File: tests/tokoku.spec.js
const { test, expect } = require('@playwright/test');

// Data akun dummy yang valid sesuai spesifikasi aplikasi TokoKu
const VALID_EMAIL = 'user@tokoku.com';
const VALID_PASSWORD = 'Password123';

test.describe('Pengujian Cross-Browser Login & Beranda E-Commerce TokoKu', () => {
  // Buka halaman utama sebelum setiap test case dijalankan
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // TC01: Login valid berhasil masuk beranda
  test('TC01 - Login dengan akun valid berhasil masuk ke halaman beranda', async ({ page }) => {
    await page.getByTestId('input-email').fill(VALID_EMAIL);
    await page.getByTestId('input-password').fill(VALID_PASSWORD);
    await page.getByTestId('btn-login').click();

    // Verifikasi form login disembunyikan dan halaman beranda tampil
    await expect(page.getByTestId('halaman-login')).toBeHidden();
    await expect(page.getByTestId('halaman-beranda')).toBeVisible();
    await expect(page.getByTestId('sapaan-user')).toHaveText(`Selamat datang, ${VALID_EMAIL}`);

    // Verifikasi ke-4 produk tampil di beranda
    await expect(page.getByTestId('produk-item-1')).toBeVisible();
    await expect(page.getByTestId('produk-item-2')).toBeVisible();
    await expect(page.getByTestId('produk-item-3')).toBeVisible();
    await expect(page.getByTestId('produk-item-4')).toBeVisible();
  });

  // TC02: Email salah, muncul pesan gagal
  test('TC02 - Login dengan email salah menampilkan pesan gagal', async ({ page }) => {
    await page.getByTestId('input-email').fill('salah@tokoku.com');
    await page.getByTestId('input-password').fill(VALID_PASSWORD);
    await page.getByTestId('btn-login').click();

    // Verifikasi pesan gagal muncul dan tidak masuk ke beranda
    await expect(page.getByTestId('pesan-gagal')).toBeVisible();
    await expect(page.getByTestId('pesan-gagal')).toContainText('Email atau password salah');
    await expect(page.getByTestId('halaman-beranda')).toBeHidden();
  });

  // TC03: Password salah, muncul pesan gagal
  test('TC03 - Login dengan password salah menampilkan pesan gagal', async ({ page }) => {
    await page.getByTestId('input-email').fill(VALID_EMAIL);
    await page.getByTestId('input-password').fill('PasswordSalah99');
    await page.getByTestId('btn-login').click();

    // Verifikasi pesan gagal muncul dan tidak masuk ke beranda
    await expect(page.getByTestId('pesan-gagal')).toBeVisible();
    await expect(page.getByTestId('pesan-gagal')).toContainText('Email atau password salah');
    await expect(page.getByTestId('halaman-beranda')).toBeHidden();
  });

  // TC04: Email dan password kosong, muncul pesan error kedua field
  test('TC04 - Submit form dengan email dan password kosong menampilkan pesan error di kedua field', async ({ page }) => {
    await page.getByTestId('btn-login').click();

    // Verifikasi pesan error muncul di bawah masing-masing input
    await expect(page.getByTestId('error-email')).toBeVisible();
    await expect(page.getByTestId('error-email')).toHaveText('Email wajib diisi');
    await expect(page.getByTestId('error-password')).toBeVisible();
    await expect(page.getByTestId('error-password')).toHaveText('Password wajib diisi');
  });

  // TC05: Format email tidak valid
  test('TC05 - Input email dengan format tidak valid menampilkan pesan error format email', async ({ page }) => {
    await page.getByTestId('input-email').fill('usertokoku.com');
    await page.getByTestId('input-password').fill(VALID_PASSWORD);
    await page.getByTestId('btn-login').click();

    // Verifikasi pesan error format email muncul
    await expect(page.getByTestId('error-email')).toBeVisible();
    await expect(page.getByTestId('error-email')).toHaveText('Format email tidak valid');
    await expect(page.getByTestId('halaman-beranda')).toBeHidden();
  });

  // TC06: Password kurang dari 8 karakter
  test('TC06 - Input password kurang dari 8 karakter menampilkan pesan error panjang password', async ({ page }) => {
    await page.getByTestId('input-email').fill(VALID_EMAIL);
    await page.getByTestId('input-password').fill('Pass12');
    await page.getByTestId('btn-login').click();

    // Verifikasi pesan error minimal 8 karakter muncul
    await expect(page.getByTestId('error-password')).toBeVisible();
    await expect(page.getByTestId('error-password')).toHaveText('Password minimal 8 karakter');
    await expect(page.getByTestId('halaman-beranda')).toBeHidden();
  });

  // TC07: Tombol show/hide password mengubah tipe input
  test('TC07 - Tombol show/hide password mengubah atribut type antara password dan text', async ({ page }) => {
    const passwordInput = page.getByTestId('input-password');
    const toggleBtn = page.getByTestId('btn-toggle-password');

    await passwordInput.fill(VALID_PASSWORD);

    // Kondisi awal harus bertipe password
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleBtn).toHaveText('Lihat');

    // Klik pertama: ubah menjadi text (terlihat)
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(toggleBtn).toHaveText('Sembunyikan');

    // Klik kedua: kembali menjadi password (tersembunyi)
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(toggleBtn).toHaveText('Lihat');
  });

  // TC08: Akun terkunci setelah 3 kali gagal berturut-turut
  test('TC08 - Gagal login 3 kali berturut-turut menonaktifkan tombol Login dan menampilkan pesan terkunci', async ({ page }) => {
    const emailInput = page.getByTestId('input-email');
    const passwordInput = page.getByTestId('input-password');
    const loginBtn = page.getByTestId('btn-login');

    await emailInput.fill(VALID_EMAIL);
    await passwordInput.fill('PasswordSalah123');

    // Percobaan gagal ke-1
    await loginBtn.click();
    await expect(page.getByTestId('pesan-gagal')).toContainText('1/3');
    await expect(loginBtn).toBeEnabled();

    // Percobaan gagal ke-2
    await loginBtn.click();
    await expect(page.getByTestId('pesan-gagal')).toContainText('2/3');
    await expect(loginBtn).toBeEnabled();

    // Percobaan gagal ke-3 -> akun terkunci
    await loginBtn.click();
    await expect(page.getByTestId('pesan-terkunci')).toBeVisible();
    await expect(page.getByTestId('pesan-terkunci')).toContainText('Akun terkunci sementara');
    await expect(loginBtn).toBeDisabled();
  });

  // TC09: "Ingat saya" menyimpan email di localStorage dan terisi lagi setelah reload
  test('TC09 - Mencetang Ingat saya menyimpan email di localStorage dan mengisi otomatis saat halaman di-reload', async ({ page }) => {
    await page.getByTestId('input-email').fill(VALID_EMAIL);
    await page.getByTestId('input-password').fill(VALID_PASSWORD);
    await page.getByTestId('chk-remember').check();
    await page.getByTestId('btn-login').click();

    await expect(page.getByTestId('halaman-beranda')).toBeVisible();

    // Verifikasi nilai tersimpan di localStorage
    const storedEmail = await page.evaluate(() => localStorage.getItem('tokoku_remembered_email'));
    expect(storedEmail).toBe(VALID_EMAIL);

    // Reload halaman dan pastikan field email otomatis terisi kembali
    await page.reload();
    await expect(page.getByTestId('input-email')).toHaveValue(VALID_EMAIL);
    await expect(page.getByTestId('chk-remember')).toBeChecked();
  });

  // TC10: Tambah produk ke keranjang, counter bertambah
  test('TC10 - Klik tombol Tambah ke Keranjang menambah jumlah counter pada badge keranjang', async ({ page }) => {
    // Login terlebih dahulu
    await page.getByTestId('input-email').fill(VALID_EMAIL);
    await page.getByTestId('input-password').fill(VALID_PASSWORD);
    await page.getByTestId('btn-login').click();

    const badgeKeranjang = page.getByTestId('badge-keranjang');
    await expect(badgeKeranjang).toHaveText('0');

    // Tambah produk ke-1 dan ke-3
    await page.getByTestId('btn-tambah-keranjang-1').click();
    await expect(badgeKeranjang).toHaveText('1');

    await page.getByTestId('btn-tambah-keranjang-3').click();
    await expect(badgeKeranjang).toHaveText('2');
  });

  // TC11: Logout kembali ke form login dan mengosongkan form
  test('TC11 - Klik tombol Logout mengembalikan tampilan ke form login dan mengosongkan input', async ({ page }) => {
    await page.getByTestId('input-email').fill(VALID_EMAIL);
    await page.getByTestId('input-password').fill(VALID_PASSWORD);
    await page.getByTestId('btn-login').click();

    await expect(page.getByTestId('halaman-beranda')).toBeVisible();

    // Klik tombol Logout
    await page.getByTestId('btn-logout').click();

    // Pastikan beranda disembunyikan, form login tampil kembali, dan field kosong
    await expect(page.getByTestId('halaman-beranda')).toBeHidden();
    await expect(page.getByTestId('halaman-login')).toBeVisible();
    await expect(page.getByTestId('input-email')).toHaveValue('');
    await expect(page.getByTestId('input-password')).toHaveValue('');
  });

  // TC12: Tampilan mobile (viewport 375x667), form tetap terlihat dan login berhasil
  test('TC12 - Tampilan responsif mobile (375x667) menampilkan form dengan baik dan dapat login', async ({ page }) => {
    // Ubah ukuran viewport ke ukuran layar smartphone (iPhone SE: 375x667)
    await page.setViewportSize({ width: 375, height: 667 });

    const emailInput = page.getByTestId('input-email');
    const passwordInput = page.getByTestId('input-password');
    const loginBtn = page.getByTestId('btn-login');

    // Pastikan elemen form terlihat di layar mobile
    await expect(page.getByTestId('form-login')).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginBtn).toBeVisible();

    // Lakukan proses login di layar mobile
    await emailInput.fill(VALID_EMAIL);
    await passwordInput.fill(VALID_PASSWORD);
    await loginBtn.click();

    // Pastikan halaman beranda tampil responsif
    await expect(page.getByTestId('halaman-beranda')).toBeVisible();
    await expect(page.getByTestId('sapaan-user')).toHaveText(`Selamat datang, ${VALID_EMAIL}`);
  });
});