const multer = require("multer")

module.exports.upload = function (address) {
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            if(address[1] && address[1].fieldname === file.fieldname){
                return cb(null,address[1].path)
            }else{
               return  cb(null, address[0]);
            }   
        },
         
         filename: function (req, file, cb) {
            const randomNumber = Math.floor(Math.random() * 100000)
            file.originalname = Buffer.from(file.originalname, "utf8").toString("utf8")
            cb(null, `${new Date().getTime()}_${randomNumber}_${file.originalname}`);
        }
    });

    return multer(
        {
            storage: storage,
            limits: {
                fileSize: 5000000, // max file size 5MB = 5000000 bytes
            },
            fileFilter(req, file, cb) {
                try {
                    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|JPG)$/)) {            
                        return cb({code:"LIMIT_FILE_TYPES"}, false)
                    } else {
                        cb(undefined, true); // continue with upload
                    }
                }
                catch (err) {
                    return cb({code:"LIMIT_FILE_TYPES"}, false)
                    
                }
              }
            })
}
