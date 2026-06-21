const express = require("express")
const app = express()
const { postgres } = require("./modules/pg/postgres")
const expressConfiguration = require("./middlewares/expressConfiguration")
const { expressErrorHandler } = require("./middlewares/expressErrorHandler")
const databaseMiddleware = require("./middlewares/database")
const routes = require("./routes/route")
const { PORT } = require("./modules/config")
const { seedReference } = require("./helpers/seedReference")

async function server() {
    try {
        const db = await postgres();
        await seedReference(db);
        await databaseMiddleware(db, app);
        await expressConfiguration(app)
        routes(app);
        app.use(expressErrorHandler)

        app.listen(PORT, () => {
            console.log(`server ready on ${PORT}`)
        })
    } catch (err) {
        console.log("Server error : ", err)
    }
}

module.exports.server = server
