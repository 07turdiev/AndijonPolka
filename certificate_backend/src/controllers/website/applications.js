const reply = require("../../helpers/reply")
const { translator,media,technology, culture} = require("../../helpers/application")
const path = require("path")
const {generateQRCode, generateBadge} = require("../../helpers/generateBadge")

module.exports.postCreateApplication = async (req, res) => {
    try {

        if (req.body.application_type === "certificate") {
            // Check if user has passed the test for the selected quarter
            const user_id = req.body.user_id
            const quarter_id = req.body.quarter_id
            if (user_id && quarter_id) {
                // Find test topics linked to this quarter
                const topicsForQuarter = await req.db.testTopics.findAll({
                    where: { quarter_id },
                    attributes: ['test_topic_id']
                })
                if (topicsForQuarter.length === 0) {
                    // No test topics linked to this quarter — cannot apply
                    return reply(res, 403, false, null, { message: "Tanlangan chorak uchun test mavjud emas. Admin test qo'shishi kerak." })
                }
                const topicIds = topicsForQuarter.map(t => t.test_topic_id)
                const { Op } = require('sequelize')
                const testResult = await req.db.testAnswers.findOne({
                    where: {
                        user_id,
                        test_topic_id: { [Op.in]: topicIds }
                    }
                })
                if (!testResult) {
                    return reply(res, 403, false, null, { message: "Tanlangan chorak uchun avval testni bajarishingiz kerak" })
                }
            } else if (!quarter_id) {
                return reply(res, 400, false, null, { message: "Chorak tanlanmagan" })
            }
            console.log("before translator")
           const { result, error } = await translator(req)
           let statusCode = error?500:200
           let status = error?false:true
           console.log(status,statusCode,error)
           return  reply(res,statusCode , status, error, result)
        } else if (req.body.application_type === "media") {
            const { result, error } = await media(req)
            return error && !result ? reply(res, 500, false, error, null) : reply(res, 200, true, null, "An application created succesfully!")
        } else if (req.body.application_type === "technology") {
            const { result, error } = await technology(req)
            return error && !result ? reply(res, 500, false, error, null) : reply(res, 200, true, null, "An application created succesfully!")
        } else if (req.body.application_type === "culture") {
            const { result, error } = await culture(req)
            return error && !result ? reply(res, 500, false, error, null) : reply(res, 200, true, null, "An application created succesfully!")
        } else {
            return reply(res, 500, false, 110, null)
        }

    } catch (err) {
        reply(res, 500, false, 108, null)
    }
}

module.exports.getListOfUsersApplication = async (req, res) => {
    try {

        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0
         
        const applications = await req.db.applications.findAll({
            where: {
                user_id: req.query.user_id
            },
            include:[
                {
                 model:req.db.organizations,
                 include:[
                     {
                         model:req.db.regions
                     }
                 ]
                }
             ],
            attributes: {exclude:["pin"]},
            order: [
                ["createdAt", "DESC"]
            ],
            limit: limit,
            offset: offset,
        })
          

        return reply(res, 200, true, null, { applications })
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.getSingleUserApplication = async(req,res) =>{
    try{
          
          const application = await req.db.applications.findOne({
            where:{
                application_id:req.params.id,
                user_id:req.user.user_id
            },
            include:[
                {
                   model:req.db.certificates
                },
                {
                    model:req.db.organizations,
                    where:subSearch,
                    include:[
                        {
                            model:req.db.regions
                        }
                    ]
                   }
            ],
            attributes:{exclude:["pin","pport_num"]}
          })
          
          if(!application){
            return reply(res,404,false,404,null)
          }

          return reply(res,200,true,null,{application})
           
    }catch(err){
        console.log(err)
        reply(res,200,true,108,null)
    }
}

module.exports.getDownloadCertificate = async (req,res) =>{
    try{
          
          const certificate = await req.db.certificates.findOne({
            where:{
               certificate_id:req.params.id
            },
            include:[
                {
                    model:req.db.users
                }
            ]
          })

          const pdfResult = await generateBadge(certificate)
          if(!pdfResult.err && pdfResult.code){
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
            return res.send(pdfResult.code);
         }else{
            return reply(res,500,false,pdfResult.err,null)
         }
    
    }catch(err){
        console.log(err)
        reply(res,200,true,108,null)
    }
}


// module.exports.postAnswerApplication = async(req,res) =>{
//     try{
//     const application = await req.db.applications.findOne({
//         where:{
//             application_id:req.params.id
//         }
//     })
    
//     if(!application || application.stage !== "2" || application.status !== "checking"){
//         return reply(res,500,false,118,null)
//     }
//     await req.db.applications.update({
//             paymentFile:path.posix.join("private", "applications",req.file.filename)
//     },{
//         where:{
//             application_id:req.params.id
//         }
//     })
       
//        return reply(res,200,true,null,"Succesfull uploaded")  
//     }catch(err){
//         console.log(err)
//         reply(res,500,false,108,null)
//     }
// }

