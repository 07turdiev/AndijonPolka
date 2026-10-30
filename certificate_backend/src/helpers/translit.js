// O'zbek krill yozuvidan lotin yozuviga transliteratsiya.
// Guvohnoma (18 yoshgacha) ma'lumotlari krillcha kelgani uchun bazaga
// lotinchada yozish maqsadida ishlatiladi. Lotincha matn o'zgarmay o'tadi.

// Krill (kichik) -> lotin. Ko'p harfli natijalar (yo, sh, o', ...) registr
// avtomatik moslanadi.
const cyrlMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ғ': "g'", 'д': 'd', 'е': 'e',
    'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'қ': 'q',
    'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
    'т': 't', 'у': 'u', 'ў': "o'", 'ф': 'f', 'х': 'x', 'ҳ': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'ъ': "'", 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ы': 'i', 'щ': 'sh', 'ё': 'yo'
}

// Berilgan belgi lotin/krill katta harfmi?
function isUpperLetter(ch) {
    return !!ch && /\p{L}/u.test(ch) && ch === ch.toUpperCase() && ch !== ch.toLowerCase()
}

// Krill matnni lotinga o'giradi. Krill bo'lmagan belgilar (lotin, raqam,
// bo'sh joy, tinish) o'zgarmaydi.
function cyrlToLatin(text) {
    if (!text) return text
    const chars = [...text]
    let result = ''
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]
        const lat = cyrlMap[ch.toLowerCase()]
        if (lat === undefined) { result += ch; continue }      // krill emas — o'zgarmaydi
        if (ch === ch.toLowerCase()) { result += lat; continue } // manba kichik harf

        // Manba katta harf — natija registrini moslaymiz
        if (lat.length <= 1) { result += lat.toUpperCase(); continue }
        const neighbourUpper = isUpperLetter(chars[i - 1]) || isUpperLetter(chars[i + 1])
        result += neighbourUpper
            ? lat.toUpperCase()                       // ABRORЁ -> ...YO (to'liq katta)
            : lat[0].toUpperCase() + lat.slice(1)     // Ёзодбек -> Yozodbek (faqat bosh harf)
    }
    return result
}

module.exports = { cyrlToLatin }
