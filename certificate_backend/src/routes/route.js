const AdminRouter = require("./routeAdmin")
const SiteRouter = require("./routeWebsite")
module.exports = (app) => {
    app.use("/api/admin", AdminRouter)
    app.use("/api/site", SiteRouter)
}
