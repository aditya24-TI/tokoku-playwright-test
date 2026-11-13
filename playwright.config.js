// Nama File: playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Direktori tempat file test berada
  testDir: './tests',

  // Batas waktu maksimal per test case (30 detik)
  timeout: 30 * 1000,

  // Jalankan test secara paralel
  fullyParallel: true,

  // Gagalkan build di CI jika ada test.only yang tertinggal
  forbidOnly: !!process.env.CI,

  // Aktifkan retry 1 kali agar fitur trace 'on-first-retry' dapat terekam saat ada kegagalan
  retries: 1,

  // Jumlah worker paralel
  workers: process.env.CI ? 1 : undefined,

  // Aktifkan HTML Reporter (bisa dibuka dengan npx playwright show-report)
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  // Konfigurasi global untuk semua project browser
  use: {
    // URL dasar web lokal
    baseURL: 'http://localhost:3000',

    // Gunakan atribut data-testid untuk page.getByTestId()
    testIdAttribute: 'data-testid',

    // Ambil screenshot otomatis hanya saat test gagal
    screenshot: 'only-on-failure',

    // Rekam trace secara otomatis saat percobaan ulang (retry) pertama
    trace: 'on-first-retry',
  },

  // Konfigurasi 3 Browser Engine (Cross-Browser Testing)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Menjalankan web server lokal secara otomatis sebelum test dimulai
  webServer: {
    command: 'npx serve . -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});
