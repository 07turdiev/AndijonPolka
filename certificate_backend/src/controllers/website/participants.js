const reply = require("../../helpers/reply")
const { searchPerson } = require("../../helpers/passport")
const { savePhoto } = require("../../helpers/savePhoto")

// Normalize/validate the search keys coming from the client
function readSearchInput(body) {
    const pinfl = (body.pinfl || "").toString().trim()
    const birth_date = (body.birth_date || "").toString().trim()
    return { pinfl, birth_date }
}

// Returns an error message string if invalid, otherwise null
function validateInput({ pinfl, birth_date }) {
    if (!pinfl || !birth_date) {
        return "JSHSHIR va tug'ilgan sanani kiriting"
    }
    if (!/^\d{14}$/.test(pinfl)) {
        return "JSHSHIR 14 ta raqamdan iborat bo'lishi kerak"
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
        return "Tug'ilgan sana noto'g'ri (YYYY-MM-DD)"
    }
    return null
}

function notFoundMessage(code, message) {
    if (code === "4") return "Ma'lumot topilmadi. Kiritilgan ma'lumotlarni tekshiring"
    return message || "Ma'lumot topilmadi"
}

// POST /api/site/search — look up a citizen, return data + photo for preview (no save)
module.exports.searchParticipant = async (req, res) => {
    try {
        const input = readSearchInput(req.body)
        const invalid = validateInput(input)
        if (invalid) return reply(res, 400, false, invalid, null)

        const { found, code, person, message, isMinor } = await searchPerson(input)
        if (!found) {
            return reply(res, 404, false, notFoundMessage(code, message), null)
        }

        const exists = await req.db.participants.findOne({
            where: { pinfl: person.pinfl }, raw: true
        })

        return reply(res, 200, true, null, {
            person,
            is_minor: isMinor,
            already_registered: !!exists
        })
    } catch (err) {
        console.log("searchParticipant error:", err.message)
        return reply(res, 500, false, "Servisda xatolik. Birozdan so'ng urinib ko'ring", null)
    }
}

// POST /api/site/register — re-verify via the passport API server-side, then persist
module.exports.registerParticipant = async (req, res) => {
    try {
        const input = readSearchInput(req.body)
        const invalid = validateInput(input)
        if (invalid) return reply(res, 400, false, invalid, null)

        // Re-fetch authoritative data (do not trust client-sent identity)
        const { found, code, person, message } = await searchPerson(input)
        if (!found) {
            return reply(res, 404, false, notFoundMessage(code, message), null)
        }

        // Prevent duplicate registration
        const exists = await req.db.participants.findOne({
            where: { pinfl: person.pinfl }, raw: true
        })
        if (exists) {
            return reply(res, 409, false, "Siz allaqachon ro'yxatdan o'tgansiz", {
                participant_id: exists.participant_id
            })
        }

        const region_id = req.body.region_id ? Number(req.body.region_id) : null
        const district_id = req.body.district_id ? Number(req.body.district_id) : null
        const phone_number = (req.body.phone_number || "").toString().trim() || null

        const photoPath = savePhoto(person.photo, person.pinfl)

        const created = await req.db.participants.create({
            pinfl: person.pinfl,
            last_name: person.last_name,
            first_name: person.first_name,
            middle_name: person.middle_name,
            birth_date: person.birth_date,
            document: person.document,
            document_type: person.document_type,
            gender: person.gender,
            birth_place: person.birth_place,
            nationality: person.nationality,
            citizenship: person.citizenship,
            photo: photoPath,
            phone_number,
            region_id,
            district_id
        })

        return reply(res, 201, true, null, {
            participant_id: created.participant_id,
            full_name: `${person.last_name} ${person.first_name} ${person.middle_name}`.trim()
        })
    } catch (err) {
        console.log("registerParticipant error:", err.message)
        if (err.name === "SequelizeUniqueConstraintError") {
            return reply(res, 409, false, "Siz allaqachon ro'yxatdan o'tgansiz", null)
        }
        return reply(res, 500, false, "Ro'yxatdan o'tishda xatolik. Birozdan so'ng urinib ko'ring", null)
    }
}
