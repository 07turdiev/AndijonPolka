const config = require("../modules/config")
const passportApi = require("./providers/passportApi")

// Whole years between birth_date (YYYY-MM-DD) and now. Returns null if unparsable.
function ageFrom(birth_date) {
    if (!birth_date) return null
    const d = new Date(birth_date)
    if (isNaN(d.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - d.getFullYear()
    const m = now.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
    return age
}

/**
 * Look up a person via the single passport API by document type.
 * For documentTypeId 7 (Passport/PINFL) the lookup uses `pinfl`; for other
 * types it uses `seria` + `number`. Always with `birth_date`.
 * `isMinor` (age < MINOR_AGE) is computed for the "under 18" display tag.
 * @param {{documentTypeId:number, pinfl?:string, seria?:string, number?:string, birth_date:string}} params
 * @returns {Promise<{found:boolean, code:string, person:Object|null, message:string, isMinor:boolean}>}
 */
async function searchPerson({ documentTypeId, pinfl, seria, number, birth_date }) {
    const age = ageFrom(birth_date)
    const isMinor = age !== null && age < config.MINOR_AGE
    const result = await passportApi.search({ documentTypeId, pinfl, seria, number, birth_date, isMinor })
    return { ...result, isMinor }
}

module.exports = { searchPerson, ageFrom }
