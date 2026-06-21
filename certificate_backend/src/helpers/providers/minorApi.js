const axios = require("axios")
const config = require("../../modules/config")
const { mockPerson, normalize } = require("../passportShared")

/**
 * Minor (under-18) lookup — separate API (e.g. birth-certificate based).
 * Inputs assumed to be JSHSHIR (PINFL) + birth date; adjust when the real
 * minor API contract is provided.
 * @param {{pinfl:string, birth_date:string}} params
 * @returns {Promise<{found:boolean, code:string, person:Object|null, message:string}>}
 */
module.exports.search = async function ({ pinfl, birth_date }) {
    if (config.PASSPORT_MOCK || !config.MINOR_API_URL) {
        return mockPerson({ pinfl, birth_date, minor: true })
    }

    // === REAL MINOR API — wire when the endpoint is provided ===
    const { data } = await axios.post(
        config.MINOR_API_URL,
        { pinfl, birth_date },
        {
            headers: config.MINOR_API_TOKEN
                ? { Authorization: `Bearer ${config.MINOR_API_TOKEN}` }
                : {}
        }
    )

    const item = Array.isArray(data.data) ? data.data[0] : (data.data || data)
    const person = normalize(item)
    if (!person || !person.pinfl) {
        return { found: false, code: String(data.result || "4"), person: null, message: data.comments || "Ma'lumot topilmadi" }
    }
    return { found: true, code: "1", person, message: "" }
}
