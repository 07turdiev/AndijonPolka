const fs = require("fs")
const path = require("path")

const PHOTO_DIR = path.join(__dirname, "../../public/photos")

// Save a base64 photo to /public/photos/<name>.jpg and return its public path
// (served via /api/cdn). Returns null when there is no photo.
function savePhoto(base64, name) {
    if (!base64) return null
    if (!fs.existsSync(PHOTO_DIR)) {
        fs.mkdirSync(PHOTO_DIR, { recursive: true })
    }
    const clean = base64.replace(/^data:image\/\w+;base64,/, "")
    const fileName = `${name}.jpg`
    fs.writeFileSync(path.join(PHOTO_DIR, fileName), Buffer.from(clean, "base64"))
    return `photos/${fileName}`
}

module.exports = { savePhoto }
