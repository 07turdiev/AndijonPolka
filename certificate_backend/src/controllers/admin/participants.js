const reply = require("../../helpers/reply")
const { Op } = require("sequelize")

// Bugundan `years` yil oldingi sana -> "YYYY-MM-DD" (mahalliy vaqt bo'yicha).
// birth_date string ISO formatda saqlangani uchun leksikografik solishtirish =
// xronologik solishtirish.
function isoYearsAgo(years) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setFullYear(d.getFullYear() - years)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

// "YYYY-MM-DD" dan to'liq yoshni hisoblash (yaroqsiz bo'lsa "")
function ageFromIso(s) {
    if (!s) return ""
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return ""
    const now = new Date()
    let a = now.getFullYear() - d.getFullYear()
    const m = now.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--
    return a >= 0 ? a : ""
}

// So'rovdan butun yosh qiymatini o'qish (bo'sh/yaroqsiz bo'lsa null)
function readAge(v) {
    if (v === undefined || v === null || v === "") return null
    const n = Math.floor(Number(v))
    return Number.isNaN(n) || n < 0 ? null : n
}

// Build the shared where-clause from query filters
function buildWhere(req) {
    const where = {}
    if (req.query.searchWord && req.query.searchWord.trim() !== "") {
        const w = `%${req.query.searchWord.trim()}%`
        where[Op.or] = [
            { first_name: { [Op.iLike]: w } },
            { last_name: { [Op.iLike]: w } },
            { middle_name: { [Op.iLike]: w } },
            { pinfl: { [Op.iLike]: w } },
            { phone_number: { [Op.iLike]: w } }
        ]
    }
    if (req.query.region_id) where.region_id = Number(req.query.region_id)
    if (req.query.district_id) where.district_id = Number(req.query.district_id)

    // Yosh filtri (to'liq yillarda). min_age <= yosh <= max_age.
    //   yosh >= min_age  ->  birth_date <= (bugun - min_age yil)
    //   yosh <= max_age  ->  birth_date  >  (bugun - (max_age+1) yil)
    const minAge = readAge(req.query.min_age)
    const maxAge = readAge(req.query.max_age)
    if (minAge !== null || maxAge !== null) {
        const cond = {}
        if (minAge !== null) cond[Op.lte] = isoYearsAgo(minAge)
        if (maxAge !== null) cond[Op.gt] = isoYearsAgo(maxAge + 1)
        // birth_date bo'sh (null) yozuvlar yosh filtri ostida chiqmaydi
        where.birth_date = { ...cond, [Op.ne]: null }
    }
    if (req.query.start_date || req.query.end_date) {
        where.createdAt = {}
        if (req.query.start_date) where.createdAt[Op.gte] = new Date(req.query.start_date)
        if (req.query.end_date) {
            const end = new Date(req.query.end_date)
            end.setHours(23, 59, 59, 999)
            where.createdAt[Op.lte] = end
        }
    }
    return where
}

const includeRefs = (db) => ([
    { model: db.regions, attributes: ["region_id", "name_uz", "name_ru"] },
    { model: db.districts, attributes: ["district_id", "name_uz", "name_ru"] }
])

// GET /api/admin/participants
module.exports.getParticipants = async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 20
        const offset = req.query.offset ? Number(req.query.offset) : 0

        const { rows, count } = await req.db.participants.findAndCountAll({
            where: buildWhere(req),
            include: includeRefs(req.db),
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true
        })

        return reply(res, 200, true, null, { rows, count })
    } catch (err) {
        console.log("getParticipants error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}

// GET /api/admin/participants/stats
module.exports.getStats = async (req, res) => {
    try {
        const total = await req.db.participants.count()

        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)
        const today = await req.db.participants.count({
            where: { createdAt: { [Op.gte]: startOfToday } }
        })

        return reply(res, 200, true, null, { total, today })
    } catch (err) {
        console.log("getStats error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}

// DELETE /api/admin/participants/:id
module.exports.deleteParticipant = async (req, res) => {
    try {
        const deleted = await req.db.participants.destroy({
            where: { participant_id: req.params.id }
        })
        if (!deleted) return reply(res, 404, false, "Topilmadi", null)
        return reply(res, 200, true, null, null)
    } catch (err) {
        console.log("deleteParticipant error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}

// GET /api/admin/participants/export — CSV (UTF-8 BOM, opens in Excel)
module.exports.exportParticipants = async (req, res) => {
    try {
        const rows = await req.db.participants.findAll({
            where: buildWhere(req),
            include: includeRefs(req.db),
            order: [["createdAt", "DESC"]]
        })

        const headers = [
            "№", "Familiya", "Ism", "Otasining ismi", "JSHSHIR", "Tug'ilgan sana",
            "Yosh", "Jinsi", "Hujjat", "Viloyat", "Tuman", "Telefon", "Ro'yxatdan o'tgan vaqt"
        ]
        const esc = (v) => {
            const s = (v === null || v === undefined) ? "" : String(v)
            return `"${s.replace(/"/g, '""')}"`
        }
        const lines = [headers.map(esc).join(",")]
        rows.forEach((r, i) => {
            const p = r.toJSON()
            lines.push([
                i + 1,
                p.last_name, p.first_name, p.middle_name, p.pinfl, p.birth_date,
                ageFromIso(p.birth_date), p.gender, p.document,
                p.region ? p.region.name_uz : "",
                p.district ? p.district.name_uz : "",
                p.phone_number,
                p.createdAt ? new Date(p.createdAt).toLocaleString("ru-RU") : ""
            ].map(esc).join(","))
        })

        const csv = "﻿" + lines.join("\r\n")
        res.setHeader("Content-Type", "text/csv; charset=utf-8")
        res.setHeader("Content-Disposition", 'attachment; filename="participants.csv"')
        return res.send(csv)
    } catch (err) {
        console.log("exportParticipants error:", err.message)
        return reply(res, 500, false, "Xatolik", null)
    }
}
