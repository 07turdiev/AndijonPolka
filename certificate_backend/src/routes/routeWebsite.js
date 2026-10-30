const Router = require("express").Router()
const { searchParticipant, registerParticipant } = require("../controllers/website/participants")
const { getRegions, getDistricts, getCount } = require("../controllers/website/reference")
const { REGISTRATION_CLOSED } = require("../modules/config")
const reply = require("../helpers/reply")

// Blocks the registration flow once the competition is closed
function registrationOpen(req, res, next) {
    if (REGISTRATION_CLOSED) return reply(res, 403, false, "Tanlov yopildi. Ro'yxatga olish yakunlangan")
    next()
}

// Reference data
Router.get("/regions", getRegions)
Router.get("/districts", getDistricts)
Router.get("/count", getCount)

// Registration flow
Router.post("/search", registrationOpen, searchParticipant)
Router.post("/register", registrationOpen, registerParticipant)

module.exports = Router
