const axios = require("axios")
const reply = require("../../helpers/reply")
const config = require("../../modules/config")
const { authHeader } = require("../../helpers/passportShared")

// Used if the upstream series API is unreachable (keeps the dropdown working)
const BIRTH_CERT_SERIES_FALLBACK = [
    "I-AN", "I-BH", "I-FR", "I-GZ", "I-HR", "I-NA", "I-NV", "I-QD", "I-QQ", "I-SM", "I-SR", "I-SU", "I-TN", "I-TV",
    "II-AN", "II-BH", "II-EP", "II-FR", "II-GZ", "II-HR", "II-KS", "II-NA", "II-NV", "II-QD", "II-QQ", "II-SM", "II-SR", "II-SU", "II-TN", "II-TS", "II-TV",
    "III-AN", "III-BH", "III-FR", "III-GZ", "III-HR", "III-KK", "III-NA", "III-NV", "III-QD", "III-QQ", "III-SM", "III-SR", "III-SU", "III-TN", "III-TV",
    "T", "TA"
]

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

// GET /api/site/birth-cert-series — birth-certificate series for the dropdown.
// Proxies the public IdentityDocSeriesSelectList; falls back to a static list.
module.exports.getBirthCertSeries = async (req, res) => {
    try {
        const auth = authHeader()
        const headers = { accept: "*/*" }
        if (auth) headers.Authorization = auth
        const { data } = await axios.get(config.PASSPORT_SERIES_URL, { headers, timeout: 8000 })
        const list = Array.isArray(data) ? data : []
        const seen = new Set()
        const series = []
        for (const it of list) {
            const text = ((it && (it.text || it.orderCode)) || "").toString().trim()
            if (!text || seen.has(text)) continue
            seen.add(text)
            series.push(text)
        }
        series.sort((a, b) => a.localeCompare(b))
        if (!series.length) throw new Error("empty series list")
        return reply(res, 200, true, null, { series })
    } catch (err) {
        console.log("getBirthCertSeries error:", err.message)
        return reply(res, 200, true, null, { series: BIRTH_CERT_SERIES_FALLBACK })
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
