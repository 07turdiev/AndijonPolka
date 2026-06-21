const axios = require("axios")
const config = require("../../modules/config")
const { mockPerson, normalize } = require("../passportShared")

/**
 * Adult passport lookup — JSHSHIR (PINFL) + birth date.
 * @param {{pinfl:string, birth_date:string}} params
 * @returns {Promise<{found:boolean, code:string, person:Object|null, message:string}>}
 */
module.exports.search = async function ({ pinfl, birth_date }) {
    if (config.PASSPORT_MOCK || !config.ADULT_API_URL) {
        return mockPerson({ pinfl, birth_date, minor: false })
    }

    // === REAL API — wire when the endpoint is provided ===
    // Adjust the request body/headers and the response mapping below to match
    // the real adult API contract. Keep the normalized return shape intact.
    const { data } = await axios.post(
        config.ADULT_API_URL,
        { pinfl, birth_date },
        {
            headers: config.ADULT_API_TOKEN
                ? { Authorization: `Bearer ${config.ADULT_API_TOKEN}` }
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
