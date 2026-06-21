const path = require("path")
const fs = require("fs")
const { IMAGE_ADDRESS } = require("../modules/config")
module.exports.imageUpdate = async (fileToCreate, address, fileTodelete) => {
  let createdImage = null
  let deletedImage
  if (fileToCreate) {
    createdImage = path.posix.join(address, fileToCreate.filename);
  }
  if (fileTodelete && fileTodelete !== "") {
    const imageName = fileTodelete.split("/")

    fs.unlink(path.join(__dirname, "../../", "files", address, imageName[imageName.length - 1]), (err, result) => {
      if (err) {
        console.log(err)
      } else {
        console.log(result, "result")
      }
    })
  }

  return { createdImage, deletedImage }
}