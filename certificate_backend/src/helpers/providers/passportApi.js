const axios = require("axios")
const config = require("../../modules/config")
const { mockPerson, authHeader } = require("../passportShared")
const { cyrlToLatin } = require("../translit")

// documentTypeId for the "Passport (PINFL)" type — searched by PINFL, not series+number
const PINFL_DOC_TYPE = 7

// "DD.MM.YYYY" or ISO "YYYY-MM-DD[THH:mm:ss]" -> "YYYY-MM-DD"
function toIso(d) {
    if (!d) return null
    let m = /^(\d{2})\.(\d{2})\.(\d{4})/.exec(d)
    if (m) return `${m[3]}-${m[2]}-${m[1]}`
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
    return d
}

// Map the itg.madaniyat.uz response object into our participant shape
function mapPerson(d) {
    const middle = d.middleName && d.middleName !== "XXX" ? d.middleName : ""
    // Guvohnoma ma'lumotlari krillcha keladi — bazaga lotinchada yoziladi.
    // (Lotincha kelgan ma'lumot cyrlToLatin'dan o'zgarmay o'tadi.)
    return {
        pinfl: d.pinfl || null,
        last_name: cyrlToLatin(d.lastName || ""),
        first_name: cyrlToLatin(d.firstName || ""),
        middle_name: cyrlToLatin(middle),
        birth_date: toIso(d.birthOn),
        birth_place: cyrlToLatin(d.birthPlace || null),
        nationality: cyrlToLatin(d.nationality || null),
        citizenship: cyrlToLatin(d.citizenship || null),
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
