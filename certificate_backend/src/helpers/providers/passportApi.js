const axios = require("axios")
const config = require("../../modules/config")
const { mockPerson } = require("../passportShared")

// documentTypeId for the "Passport (PINFL)" type — searched by PINFL, not series+number
const PINFL_DOC_TYPE = 7

// Build the Authorization header: prefer the full PASSPORT_API_AUTH value,
// otherwise construct "Basic base64(login:password)" from login + password.
function authHeader() {
    if (config.PASSPORT_API_AUTH) return config.PASSPORT_API_AUTH
    if (config.PASSPORT_API_LOGIN && config.PASSPORT_API_PASSWORD) {
        const token = Buffer
            .from(`${config.PASSPORT_API_LOGIN}:${config.PASSPORT_API_PASSWORD}`)
            .toString("base64")
        return `Basic ${token}`
    }
    return null
}

// "DD.MM.YYYY" -> "YYYY-MM-DD"
function toIso(d) {
    if (!d) return null
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d)
    return m ? `${m[3]}-${m[2]}-${m[1]}` : d
}

// Map the itg.madaniyat.uz response object into our participant shape
function mapPerson(d) {
    const middle = d.middleName && d.middleName !== "XXX" ? d.middleName : ""
    return {
        pinfl: d.pinfl || null,
        last_name: d.lastName || "",
        first_name: d.firstName || "",
        middle_name: middle,
        birth_date: toIso(d.birthOn),
        birth_place: d.birthPlace || null,
        nationality: d.nationality || null,
        citizenship: d.citizenship || null,
        gender: Number(d.genderId) === 1 ? "M" : "F",
        document: [d.docSeria, d.docNumber].filter(Boolean).join(""),
        document_type: d.documentTypeId != null ? String(d.documentTypeId) : null,
        photo: d.photo || null // base64 when includePhoto and available
    }
}

/**
 * Single passport lookup. Searches by PINFL (documentTypeId 7) or by
 * series + number (other types), always with date of birth.
 * @param {{documentTypeId:number, pinfl?:string, seria?:string, number?:string, birth_date:string, isMinor?:boolean}} params
 * @returns {Promise<{found:boolean, code:string, person:Object|null, message:string}>}
 */
module.exports.search = async function ({ documentTypeId, pinfl, seria, number, birth_date, isMinor = false }) {
    // Explicit mock mode -> always return test data
    if (config.PASSPORT_MOCK) {
        return mockPerson({
            pinfl,
            document: (seria || "") + (number || ""),
            birth_date,
            minor: isMinor,
            documentTypeId
        })
    }

    // Real mode but no credentials -> clear error instead of silent fake data
    const auth = authHeader()
    if (!auth) {
        console.log("PASSPORT API: credentials missing — set PASSPORT_API_LOGIN/PASSWORD (or PASSPORT_API_AUTH) in .env")
        return {
            found: false,
            code: "0",
            person: null,
            message: "Pasport API sozlanmagan (login/parol kiritilmagan)"
        }
    }

    const isPinfl = Number(documentTypeId) === PINFL_DOC_TYPE
    const body = {
        seria: isPinfl ? "" : (seria || ""),
        number: isPinfl ? "" : (number || ""),
        dateOfBirth: birth_date,
        documentTypeId: Number(documentTypeId),
        pinfl: isPinfl ? (pinfl || "") : "",
        includePhoto: true
    }

    try {
        const { data } = await axios.post(config.PASSPORT_API_URL, body, {
            headers: {
                Authorization: auth,
                "Content-Type": "application/json",
                accept: "text/plain"
            }
        })
        if (!data || !data.pinfl) {
            return { found: false, code: "4", person: null, message: "Ma'lumot topilmadi" }
        }
        return { found: true, code: "1", person: mapPerson(data), message: "" }
    } catch (err) {
        const resp = err.response && err.response.data
        const status = err.response && err.response.status
        // Not found -> API returns HTTP 400 with errors.persoN_NOT_FOUND
        if (status === 400) {
            const notFound = resp && resp.errors && resp.errors.persoN_NOT_FOUND
            return {
                found: false,
                code: "4",
                person: null,
                message: notFound ? "Ma'lumot topilmadi" : ((resp && resp.message) || "Ma'lumot topilmadi")
            }
        }
        console.log("passportApi error:", status, (resp && resp.message) || err.message)
        throw err
    }
}
