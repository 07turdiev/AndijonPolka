const reply = require("../../helpers/reply")

// POST /api/admin/login — createToken middleware already validated and set req.token
module.exports.postLogin = async (req, res) => {
    return reply(res, 200, true, null, { token: req.token })
}

// GET /api/admin/me — verifyToken middleware set req.user
module.exports.getMe = async (req, res) => {
    if (!req.user) return reply(res, 404, false, "Topilmadi", null)
    const { admin_id, name, login, role } = req.user
    return reply(res, 200, true, null, { user: { admin_id, name, login, role } })
}
