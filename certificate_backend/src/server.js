const express = require("express")
const app = express()
const { postgres } = require("./modules/pg/postgres")
const expressConfiguration = require("./middlewares/expressConfiguration")
const { expressErrorHandler } = require("./middlewares/expressErrorHandler")
const databaseMiddleware = require("./middlewares/database")
const routes = require("./routes/route")
const config = require("./modules/config")
const { PORT } = config
const { seedReference } = require("./helpers/seedReference")

async function server() {
    try {
        const db = await postgres();
        await seedReference(db);
        await databaseMiddleware(db, app);
        await expressConfiguration(app)
        routes(app);
        app.use(expressErrorHandler)

        // Passport API mode warning
        if (config.PASSPORT_MOCK) {
            console.log("PASSPORT API: MOCK rejimi (test ma'lumotlari). Real API uchun .env da PASSPORT_MOCK=false qiling.")
        } else if (!config.PASSPORT_API_AUTH && !(config.PASSPORT_API_LOGIN && config.PASSPORT_API_PASSWORD)) {
            console.log("⚠️  PASSPORT API: login/parol kiritilmagan! .env da PASSPORT_API_LOGIN va PASSPORT_API_PASSWORD ni to'ldiring.")
        } else {
            console.log("PASSPORT API: real rejim (itg.madaniyat.uz) ulandi.")
        }

        app.listen(PORT, () => {
            console.log(`server ready on ${PORT}`)
        })
    } catch (err) {
        console.log("Server error : ", err)
    }
}

module.exports.server = server
