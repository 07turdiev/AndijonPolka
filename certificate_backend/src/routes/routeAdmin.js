const Router = require("express").Router()
const { verifyToken, createToken } = require("../middlewares/authAdmin")
const { postLogin, getMe } = require("../controllers/admin/auth")
const {
    getParticipants,
    getStats,
    deleteParticipant,
    exportParticipants
} = require("../controllers/admin/participants")

// Auth
Router.post("/login", createToken, postLogin)
Router.get("/me", verifyToken, getMe)

// Participants
Router.get("/participants", verifyToken, getParticipants)
Router.get("/participants/stats", verifyToken, getStats)
Router.get("/participants/export", verifyToken, exportParticipants)
Router.delete("/participants/:id", verifyToken, deleteParticipant)

module.exports = Router
