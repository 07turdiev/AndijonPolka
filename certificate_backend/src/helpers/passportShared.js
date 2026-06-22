// Shared helpers for both passport providers (adult / minor).
const config = require("../modules/config")

// Build the Authorization header for the itg.madaniyat.uz MV endpoints:
// prefer the full PASSPORT_API_AUTH value, otherwise "Basic base64(login:password)".
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

// 1x1 transparent PNG (placeholder photo for mock mode)
const MOCK_PHOTO =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

// Map a sex code (1=male) to "M"/"F"
function mapSex(sex) {
    return Number(sex) === 1 ? "M" : "F"
}

// Pick the most relevant identity document (prefer an active one, status 2)
function pickDocument(item) {
    const docs = Array.isArray(item.documents) ? item.documents : []
    const active = docs.find(d => Number(d.status) === 2)
    const chosen = active || docs[0] || {}
    return {
        document: chosen.document || item.current_document || item.document || null,
        document_type: chosen.type || item.document_type || null
    }
}

/**
 * Normalize a raw upstream response item into our participant shape.
 * Defaults to the GSP "Паспортные данные" response format. When the real
 * adult/minor APIs are wired, adjust this (or pass an already-normalized object).
 */
function normalize(item) {
    if (!item) return null
    const doc = pickDocument(item)
    return {
        pinfl: item.current_pinpp || item.pinfl || item.pinpp || null,
        last_name: item.surnamelat || item.surnamecyr || item.last_name || "",
        first_name: item.namelat || item.namecyr || item.first_name || "",
        middle_name: item.patronymlat || item.patronymcyr || item.middle_name || "",
        birth_date: item.birth_date || null,
        birth_place: item.birthplace || item.birth_place || null,
        nationality: item.nationality || null,
        citizenship: item.citizenship || null,
        gender: item.gender || mapSex(item.sex),
        document: doc.document,
        document_type: doc.document_type,
        photo: item.photo || null // base64
    }
}

// Deterministic fake person for mock mode (same input -> same person)
function mockPerson({ pinfl, document, birth_date, minor, documentTypeId }) {
    const seed = ((pinfl || document || "0000").replace(/\D/g, "").slice(-2)) || "07"
    const n = parseInt(seed, 10) || 7
    const FIRST = minor
        ? ["JAVOHIR", "MADINA", "OZODBEK", "SEVINCH", "BEKZOD", "ROBIYA"]
        : ["DILSHOD", "MUHABBAT", "AZIZBEK", "GULNORA", "JAHONGIR", "NODIRA"]
    const LAST = ["TURDIYEV", "ISMATULLAYEV", "RAXIMOV", "YULDASHEV", "QODIROV", "USMONOV"]
    const MID = ["AKMAL O'G'LI", "BAXTIYOR QIZI", "ZAFAR O'G'LI", "OYBEK QIZI"]
    const isFemale = n % 2 === 0

    const person = {
        pinfl: pinfl || `3${String(10000000000000 + n).slice(0, 13)}`,
        last_name: LAST[n % LAST.length] + (isFemale ? "A" : ""),
        first_name: FIRST[n % FIRST.length],
        middle_name: MID[n % MID.length],
        birth_date: birth_date || (minor ? "2012-04-1" + (n % 9) : "1995-05-1" + (n % 9)),
        birth_place: "ANDIJON VILOYATI",
        nationality: "O'ZBEK",
        citizenship: "O'ZBEKISTON",
        gender: isFemale ? "F" : "M",
        document: document || (minor ? `BCN${2000000 + n}` : `AA${1000000 + n}`),
        document_type: documentTypeId != null ? String(documentTypeId) : (minor ? "2" : "7"),
        photo: MOCK_PHOTO
    }
    return { found: true, code: "1", person, message: "MOCK" }
}

module.exports = { normalize, mockPerson, MOCK_PHOTO, mapSex, authHeader }
