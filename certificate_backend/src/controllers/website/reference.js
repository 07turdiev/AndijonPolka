const reply = require("../../helpers/reply")

// GET /api/site/regions
module.exports.getRegions = async (req, res) => {
    try {
        const regions = await req.db.regions.findAll({
            where: { status: "active" },
            order: [["name_uz", "ASC"]],
            raw: true
        })
        return reply(res, 200, true, null, { regions })
    } catch (err) {
        console.log("getRegions error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}

// GET /api/site/districts?region_id=17
module.exports.getDistricts = async (req, res) => {
    try {
        const where = { status: "active" }
        if (req.query.region_id) where.region_id = Number(req.query.region_id)
        const districts = await req.db.districts.findAll({
            where,
            order: [["name_uz", "ASC"]],
            raw: true
        })
        return reply(res, 200, true, null, { districts })
    } catch (err) {
        console.log("getDistricts error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}

// GET /api/site/count — public registered participant counter
module.exports.getCount = async (req, res) => {
    try {
        const count = await req.db.participants.count()
        return reply(res, 200, true, null, { count })
    } catch (err) {
        console.log("getCount error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}
