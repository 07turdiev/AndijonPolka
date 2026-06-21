module.exports = function reply(res,statusNumber,success,error,result=null){
    return res.status(statusNumber).json({success,error,result})
 }