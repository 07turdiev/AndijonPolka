const reply = require("../helpers/reply")

module.exports.expressErrorHandler = async(error,req,res,next) =>{
    if (error && error.code === "LIMIT_FILE_SIZE"){
       return reply(res,500,false,112,null)
    }else if(error && error.code === "LIMIT_FILE_TYPES"){
        return reply(res,500,false,106,null)
    }else{
        console.log(error)
        return reply(res,500,false,111,null) 
    }
}