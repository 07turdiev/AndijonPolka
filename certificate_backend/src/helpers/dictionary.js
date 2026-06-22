// Millat va davlat nomlari API'dan ruscha keladi (millat "Узбекская нация"
// ko'rinishida + nationalityId). Bu yerda o'zbekcha (lotin) ko'rinishga o'giriladi.
//
// Millat uchun ASOSIY yo'l — nationalityId (NationalitySelectList'dagi "value").
// Id barqaror, matn esa "...ская нация" ko'rinishida o'zgaruvchan. Id topilmasa
// matn lug'atiga, u ham bo'lmasa transliteratsiyaga qaytadi.
const { cyrlToLatin } = require("./translit")
const COUNTRY_BY_ID = require("./citizenship")

// nationalityId (value) -> o'zbekcha lotin. NationalitySelectList asosida.
const NATIONALITY_BY_ID = {
    24: "O'zbek", 33: "Qoraqalpoq", 34: "Rus", 35: "Tojik", 36: "Turkman",
    37: "Qozoq", 38: "Qirg'iz", 39: "Ukrain", 40: "Belarus", 41: "Gruzin",
    42: "Ozarbayjon", 43: "Moldovan", 44: "Arman", 45: "Eston", 46: "Abxaz",
    47: "Boshqird", 48: "Buryat", 49: "Tatar", 50: "Yahudiy", 51: "Lo'li",
    52: "Arab", 53: "Afg'on", 54: "Avstriyalik", 55: "Alban", 56: "Amerikalik",
    57: "Ingliz", 58: "Vyetnam", 59: "Golland", 60: "Grek", 61: "Ispan",
    62: "Italyan", 63: "Xitoy", 64: "Koreys", 65: "Nemis", 66: "Polyak",
    67: "Rumin", 68: "Fransuz", 69: "Turk", 70: "Xorvat", 71: "Chex",
    72: "Yapon", 73: "Mo'g'ul", 74: "Uyg'ur", 75: "Kurd", 76: "Serb",
    77: "Latish", 78: "Litvalik", 79: "Qalmoq", 80: "Chechen", 81: "Pokistonlik",
    82: "Hind", 83: "Fors", 84: "Xazora", 85: "Shved", 86: "Nigeriyalik",
    87: "Suriyalik", 88: "Qrimchak", 89: "Angolalik", 90: "Qurama", 91: "Laz",
    92: "Manika", 93: "Falastinlik", 94: "Lak", 95: "Fijilik", 96: "Adigey",
    97: "Oltoy", 98: "Bolqar", 99: "Belgiyalik", 100: "Dargin", 101: "Yazid",
    102: "Ingush", 103: "Kabardin", 104: "Qorachoy", 105: "Karel", 106: "Komi",
    107: "Komi-permyak", 108: "Mariy", 109: "Mordva", 110: "Osetin",
    111: "Tabasaran", 112: "Tuva", 113: "Udmurt", 114: "Xakas", 115: "Cherkes",
    116: "Chuvash", 117: "Yoqut", 118: "Tat", 119: "Gagauz", 120: "Lezgin",
    121: "Somalilik", 122: "Venger", 123: "Dungan", 124: "Makedon",
    125: "Finikiy", 126: "Eron", 127: "Qumiq", 128: "Bolgar", 129: "Koryak",
    130: "Nenes", 131: "Chukcha", 132: "Ossuriy", 133: "Qashqar",
    134: "Dog'iston", 135: "Avar", 136: "Finn", 137: "Kubalik", 138: "Udin",
    139: "Shor", 140: "Jazoirlik", 141: "Achar", 142: "Abazin",
    143: "Bessarab", 144: "No'g'ay", 145: "Paragvaylik", 146: "Agul",
    147: "Xemshil", 148: "Kumandin", 149: "Xant", 150: "Efiop", 151: "Sahur",
    152: "Slovak", 153: "Qaroim", 154: "Iordaniyalik", 155: "Nanay",
    156: "Even", 157: "Berber", 158: "Madyar", 159: "Nikaragualik",
    160: "Gonduraslik", 161: "Indoneziyalik", 162: "Hindi", 163: "Keniyalik",
    164: "Kolumbiyalik", 165: "Talish", 166: "Urdu", 167: "Pushtun",
    168: "Togolik", 169: "Gvineyalik", 170: "Rutul", 171: "Nepallik",
    172: "Ijor", 173: "Livanlik", 174: "Shveysar", 175: "Dominikalik",
    187: "Argentinalik", 188: "Bali", 189: "Beluj", 190: "Bengal",
    191: "Braziliyalik", 192: "Venesuelalik", 193: "Veps", 194: "Gavaylik",
    195: "Gaitilik", 196: "Daniyalik", 197: "Irland", 198: "Islandiyalik",
    199: "Kanadalik", 200: "Kashmir", 201: "Ulchi", 202: "Malay",
    203: "Maltalik", 204: "Meksikalik", 205: "Norvegiyalik", 206: "Panjob",
    207: "Portugal", 208: "Salvadorlik", 209: "Marakan", 225: "Mo'g'ul"
}

// Matn (UPPER) -> o'zbekcha lotin. Id bo'lmaganda ("...ская нация" formasi uchun).
const NATIONALITY_BY_TEXT = {
    "УЗБЕКСКАЯ НАЦИЯ": "O'zbek", "УЗБЕК": "O'zbek",
    "КАРАКАЛПАКСКАЯ НАЦИЯ": "Qoraqalpoq", "КАРАКАЛПАК": "Qoraqalpoq",
    "РУССКАЯ НАЦИЯ": "Rus", "РУССКИЙ": "Rus",
    "ТАДЖИКСКАЯ НАЦИЯ": "Tojik", "ТАДЖИК": "Tojik",
    "ТУРКМЕНСКАЯ НАЦИЯ": "Turkman", "ТУРКМЕН": "Turkman",
    "КАЗАХСКАЯ НАЦИЯ": "Qozoq", "КАЗАХ": "Qozoq",
    "КЫРГЫЗСКАЯ НАЦИЯ": "Qirg'iz", "КИРГИЗ": "Qirg'iz", "КЫРГЫЗ": "Qirg'iz",
    "УКРАИНСКАЯ НАЦИЯ": "Ukrain", "УКРАИНЕЦ": "Ukrain",
    "ТАТАРСКАЯ НАЦИЯ": "Tatar", "ТАТАРИН": "Tatar",
    "КОРЕЙСКАЯ НАЦИЯ": "Koreys", "КОРЕЕЦ": "Koreys",
    "АЗЕРБАЙДЖАНСКАЯ НАЦИЯ": "Ozarbayjon", "АЗЕРБАЙДЖАНЕЦ": "Ozarbayjon",
    "АРМЯНСКАЯ НАЦИЯ": "Arman", "АРМЯНИН": "Arman",
    "УЙГУРСКАЯ НАЦИЯ": "Uyg'ur", "УЙГУР": "Uyg'ur",
    "ТУРЕЦКАЯ НАЦИЯ": "Turk", "ТУРОК": "Turk",
    "НЕМЕЦКАЯ НАЦИЯ": "Nemis", "НЕМЕЦ": "Nemis"
}

// Ruscha davlat nomi (UPPER) -> o'zbekcha lotin (citizenship / birthCountry uchun)
const COUNTRY = {
    "УЗБЕКИСТАН": "O'zbekiston", "РЕСПУБЛИКА УЗБЕКИСТАН": "O'zbekiston",
    "РОССИЯ": "Rossiya", "РОССИЙСКАЯ ФЕДЕРАЦИЯ": "Rossiya",
    "КАЗАХСТАН": "Qozog'iston",
    "ТАДЖИКИСТАН": "Tojikiston",
    "КИРГИЗИЯ": "Qirg'iziston", "КЫРГЫЗСТАН": "Qirg'iziston",
    "ТУРКМЕНИСТАН": "Turkmaniston", "ТУРКМЕНИЯ": "Turkmaniston",
    "УКРАИНА": "Ukraina",
    "БЕЛАРУСЬ": "Belarus", "БЕЛОРУССИЯ": "Belarus",
    "АФГАНИСТАН": "Afg'oniston",
    "ТУРЦИЯ": "Turkiya",
    "ИРАН": "Eron",
    "КИТАЙ": "Xitoy",
    "США": "AQSH",
    "ГЕРМАНИЯ": "Germaniya",
    "КОРЕЯ": "Koreya", "ЮЖНАЯ КОРЕЯ": "Janubiy Koreya",
    "АЗЕРБАЙДЖАН": "Ozarbayjon",
    "АРМЕНИЯ": "Armaniston",
    "ГРУЗИЯ": "Gruziya",
    "МОЛДОВА": "Moldova", "МОЛДАВИЯ": "Moldova"
}

// Normallashtirish: trim + ko'p bo'sh joyni bittaga + UPPER
function norm(v) {
    return (v || "").toString().trim().replace(/\s+/g, " ").toUpperCase()
}

// Millat: avval id bo'yicha, keyin matn lug'ati, oxirida "нация"ni olib tashlab translit.
function translateNationality(text, id) {
    if (id != null && NATIONALITY_BY_ID[Number(id)]) return NATIONALITY_BY_ID[Number(id)]
    if (!text) return text || null
    const key = norm(text)
    if (NATIONALITY_BY_TEXT[key]) return NATIONALITY_BY_TEXT[key]
    return cyrlToLatin(text.replace(/\s*нация\s*/iu, "").trim()) || cyrlToLatin(text)
}

// Davlat: avval id bo'yicha (CitizenshipSelectList), keyin matn lug'ati,
// oxirida transliteratsiya. citizenshipId / birthCountryId uchun.
function translateCountry(text, id) {
    if (id != null && COUNTRY_BY_ID[Number(id)]) return COUNTRY_BY_ID[Number(id)]
    if (!text) return text || null
    return COUNTRY[norm(text)] || cyrlToLatin(text)
}

module.exports = { translateNationality, translateCountry }
