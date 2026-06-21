const Router = require("express").Router()

const {getGuidesByPnfl} = require("../controllers/website/staticData")

Router.get("/guide",getGuidesByPnfl)
module.exports = Router
