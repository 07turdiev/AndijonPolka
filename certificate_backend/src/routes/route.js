const AdminRouter = require("./routeAdmin")
const SiteRouter = require("./routeWebsite")
const integrateRouter = require("./integration")
module.exports = (app) =>{
    app.use("/api/admin",AdminRouter)
    app.use("/api/site",SiteRouter)
    app.use("/api/integrate",integrateRouter)
}