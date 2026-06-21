const path = require('path')
const { Op } = require('sequelize');
const { createIdForApplication, createIdForBadgeAndCertificate } = require("./createId")
const { NAMEOFISSUER, BADGEDURATIONYEAR } = require("../modules/config")
const { createLangAndReg } = require("../helpers/serviceForLangAndReg")
const nanoId = require("nanoid/async")
const { sendToEmail } = require("./sendEmail")

module.exports.translator = async (req) => {
    try{
        const activeApplication =  await checkActiveApplication(req,req.body.pin)

        if(activeApplication) return { error: 117, result: null }
        let defaultApplicationNumber = 19256
        let badge_img
        if(req.file){
            badge_img = req.file.filename 
        }
    
        let application =  await req.db.applications.create({
            pin: req.body.pin,
            first_name: req.body.first_name,
            sur_name: req.body.sur_name,
            middle_name: req.body.middle_name,
            tin: req.body.tin,
            pport_num: req.body.pport_num,
            phone_number: req.body.phone_number,
            application_type: req.body.application_type,
            region_id: req.body.region_id,
            organization_id: req.body.organization,
            gd: req.body.gd,
            badge_img,
            user_id:req.body.user_id,
            quarter_id: req.body.quarter_id
        })
     
        await  application.update({
            application_number: defaultApplicationNumber + application.application_id 
        })
    
        return { error: null, result: "Succesfull created" }
    }catch(err){
        console.log(err)
        return { error: 117, result: null }
    }
}



async function checkActiveApplication(req,pin){

    const application = await req.db.applications.findOne({
        where:{
            pin:pin,
            application_type:"certificate",
            status:{ [Op.or]: ["new", "accepted","done"] }
        }
    })
    const activeCertificate = await req.db.certificates.findOne({
        where:{
            pin:pin,
            status:"active"
        }
    })
    return application || activeCertificate
}

module.exports.createCertificate = async (req,application) => {
      try{
    
        let given_date, expr_date;
        
        // If application has quarter_id, get the quarter date
        if (application.quarter_id) {
            const quarter = await req.db.quarters.findByPk(application.quarter_id);
            if (quarter) {
                given_date = new Date(quarter.date);
            } else {
                // Fallback to static date if quarter not found
                given_date = new Date('2025-06-20');
            }
        } else {
            // Fallback to static date if no quarter_id
            given_date = new Date('2025-06-20');
        }
        
        expr_date = new Date(given_date);
        expr_date.setFullYear(given_date.getFullYear() + 2);
        
        let defaultCertificateNumber = 15780 //random magic number

        const certificate = await req.db.certificates.create({
              first_name:application.first_name,
              sur_name:application.sur_name,
              middle_name:application.middle_name,
              pin:application.pin,
              given_date:given_date,
              expr_date,
              badge_img:application.badge_img,
              organization_id:application.organization_id,
              region_id:application.region_id,
              user_id:application.user_id,
              application_id:application.application_id,
              quarter_id:application.quarter_id
        })
        await req.db.applications.update({
            status:"done"
        },{
            where:{
                application_id:req.params.id
            }
        })
        await certificate.update({
             reg_num:defaultCertificateNumber + certificate.certificate_id
        })
        return {error:null,result:certificate}
      }catch(err){
        console.log(err)
        return { error: 117, result: null }      }
}


// module.exports.media = async (req) => {
//     try{
     
//         return { error: null, result: "Succesfull created" }
//     }catch(err){
//         console.log(err)
//         return { error: 117, result: null }
//     }
// }

// module.exports.technology = async (req) => {
//     try{
     
//         return { error: null, result: "Succesfull created" }
//     }catch(err){
//         console.log(err)
//         return { error: 117, result: null }
//     }
// }

// module.exports.culture = async (req) => {
//     try{
     
//         return { error: null, result: "Succesfull created" }
//     }catch(err){
//         console.log(err)
//         return { error: 117, result: null }
//     }
// }

// module.exports.createMemberAndBadge = async (req,application) => {
//     try {
        
//         let member = await req.db.guides.findOne({
//             where: {
//                 pin: application.pin
//             }
//         })

//         if(!member){
//             const data_token = await nanoId.nanoid()

//             const newGuide = await req.db.guides.create({
//                 first_name: application.first_name,
//                 sur_name: application.sur_name,
//                 middle_name: application.middle_name,
//                 member_type: application.application_type,
//                 phone_number: application.phone_number,
//                 member_photo: application.badge_img.path,
//                 address: application.address,
//                 pin: application.pin,
//                 pport_num: application.pport_num,
//                 email: application.email,
//                 tin: application.tin,
//                 data_token,
//                 user_id: application.user_id
//             })
//             await updateLangcerts(req,"guide_id",newGuide.guide_id,application)

//             await updateRegions(req,"guide_id",newGuide.guide_id,application)            
                 
//             const newBadge = await req.db.badges.create({
//                              first_name: application.first_name,
//                              sur_name: application.sur_name,
//                              middle_name: application.middle_name,
//                              application_type: application.application_type,
//                            //  reg_num: reg_num_result.result,
//                              residence_place: application.birth_place,
//                              pin: application.pin,
//                              pport_num: application.pport_num,
//                              badge_img: application.badge_img,
//                              guide_id: newGuide.guide_id,
//                              experience:application.experience,
//                              address:application.address,
//                              tin: application.tin,
//                              email: application.email,
//                              phone_number: application.phone_number,
//                              university: application.university,
//                              application_id: application.application_id
//              })

//              await updateLangcerts(req,"badge_id",newBadge.badge_id,application)

//              await updateRegions(req,"badge_id",newBadge.badge_id,application)            

//             }else{
//                  let badge = await req.db.badges.findOne({
//                     where:{
//                        application_id: application.application_id
//                     }
//                 })
//                 console.log(badge)
//               if(!badge){
                
//                 badge = await req.db.badges.create({
//                     first_name: application.first_name,
//                     sur_name: application.sur_name,
//                     middle_name: application.middle_name,
//                     application_type: application.application_type,
//                 //  reg_num: reg_num_result.result,
//                     residence_place: application.birth_place,
//                     pin: application.pin,
//                     pport_num: application.pport_num,
//                     badge_img: application.badge_img,
//                     guide_id: member.guide_id,
//                     experience:application.experience,
//                     address:application.address,
//                     tin: application.tin,
//                     email: application.email,
//                     phone_number: application.phone_number,
//                     university: application.university,
//                     application_id: application.application_id
//                 })
                
//               await updateLangcerts(req,"badge_id",badge.badge_id,application)
//               await updateRegions(req,"badge_id",badge.badge_id,application)    
//               console.log("badgesss",badge)
//               const updatedGuide = await req.db.guides.update({
//                         first_name: application.first_name,
//                         sur_name: application.sur_name,
//                         middle_name: application.middle_name,
//                         member_type: application.application_type,
//                         phone_number: application.phone_number,
//                         member_photo: application.badge_img.path,
//                         address: application.address,
//                         email: application.email,
//                 },{
//                     where:{
//                         pin: application.pin,
//                         user_id:application.user_id
//                     }
//                 })
//             await updateLangcerts(req,"guide_id",updatedGuide.guide_id,application)

//             await updateRegions(req,"guide_id",updatedGuide.guide_id,application) 
//             }
           
//         }
                     

//     }catch(err){
//         console.log(err)
//     }
// }

// async function updateLangcerts(req,idKey,idValue,application){
//        await req.db.langcerts.update({
//               [idKey]:idValue
//        },{
//         where:{
//             application_id:application.application_id
//         }
//        })
// }

// async function updateRegions(req,idKey,idValue,application){
//     await req.db.appRegs.update({
//            [idKey]:idValue
//     },{
//      where:{
//          application_id:application.application_id
//      }
//     })
// }
