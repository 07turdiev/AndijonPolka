require("dotenv").config()
module.exports = {
      // Server
      PORT: process.env.PORT || 5000,
      DATABASE_URL: process.env.DATABASE_URL,
      IMAGE_ADDRESS: process.env.IMAGE_ADDRESS,

      // Auth
      HASHNUMBER: process.env.HASHNUMBER || 10,
      TOKEN_KEY: process.env.TOKEN_KEY || "andijon_polka_secret",

      // Default admin (seeded on first run)
      ADMIN_LOGIN: process.env.ADMIN_LOGIN || "admin",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",

      // Passport lookup — single API (itg.madaniyat.uz MV/PersonGetByPassportData).
      // Handles all document types (PINFL passport, ID card, birth certificate, passport).
      PASSPORT_MOCK: (process.env.PASSPORT_MOCK || "true") === "true",
      // Used only to show the "under 18" tag (age < MINOR_AGE).
      MINOR_AGE: Number(process.env.MINOR_AGE || 18),

      PASSPORT_API_URL: process.env.PASSPORT_API_URL ||
            "https://itg.madaniyat.uz/api/web/MV/PersonGetByPassportData",
      // Birth-certificate series select-list (public GET, no auth required)
      PASSPORT_SERIES_URL: process.env.PASSPORT_SERIES_URL ||
            "https://itg.madaniyat.uz/api/web/MV/IdentityDocSeriesSelectList",
      // EITHER provide login + password (Basic header is built automatically) ...
      PASSPORT_API_LOGIN: process.env.PASSPORT_API_LOGIN,
      PASSPORT_API_PASSWORD: process.env.PASSPORT_API_PASSWORD,
      // ... OR provide the full Authorization header value directly, e.g. "Basic xxx"
      PASSPORT_API_AUTH: process.env.PASSPORT_API_AUTH,
}
