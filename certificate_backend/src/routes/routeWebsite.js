const Router = require("express").Router()
const { searchParticipant, registerParticipant } = require("../controllers/website/participants")
const { getRegions, getDistricts, getCount, getBirthCertSeries } = require("../controllers/website/reference")

// Reference data
Router.get("/regions", getRegions)
Router.get("/districts", getDistricts)
Router.get("/birth-cert-series", getBirthCertSeries)
Router.get("/count", getCount)

// Registration flow
Router.post("/search", searchParticipant)
Router.post("/register", registerParticipant)

module.exports = Router
