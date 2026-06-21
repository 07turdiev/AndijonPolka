const config = require("../modules/config")
const adultApi = require("./providers/adultApi")
const minorApi = require("./providers/minorApi")

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
 * Look up a person, auto-routing by age:
 *   age < MINOR_AGE  -> minor (under-18) API
 *   otherwise        -> adult API
 * @param {{pinfl:string, birth_date:string}} params
 * @returns {Promise<{found:boolean, code:string, person:Object|null, message:string, isMinor:boolean}>}
 */
async function searchPerson({ pinfl, birth_date }) {
    const age = ageFrom(birth_date)
    const isMinor = age !== null && age < config.MINOR_AGE
    const provider = isMinor ? minorApi : adultApi
    const result = await provider.search({ pinfl, birth_date })
    return { ...result, isMinor }
}

module.exports = { searchPerson, ageFrom }
