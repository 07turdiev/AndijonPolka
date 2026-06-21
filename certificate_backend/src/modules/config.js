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

      // Passport lookup
      // Keep MOCK=true until the real APIs are provided.
      PASSPORT_MOCK: (process.env.PASSPORT_MOCK || "true") === "true",
      // Participants younger than this are routed to the minor (under-18) API.
      MINOR_AGE: Number(process.env.MINOR_AGE || 18),

      // Adult API (JSHSHIR + birth date)
      ADULT_API_URL: process.env.ADULT_API_URL,
      ADULT_API_TOKEN: process.env.ADULT_API_TOKEN,

      // Minor API (under 18)
      MINOR_API_URL: process.env.MINOR_API_URL,
      MINOR_API_TOKEN: process.env.MINOR_API_TOKEN,
}
