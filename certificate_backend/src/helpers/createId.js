const {Op} = require("sequelize")
module.exports.createIdForApplication = (id) => {
    try {
        if(!id || id.length !== 6 ){
            return {err: 115, result: null }
        }
        const listOfLetters = ["A", "B", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"]
        const maxValueOfNumber = 9999

        let idLetter = id.substring(0, 2);
        let idNumber = Number(id.substring(2, 6))
 
        if (idNumber >= maxValueOfNumber) {
            if (listOfLetters.indexOf(idLetter[1]) >= 23) {
                idLetter = listOfLetters[listOfLetters.indexOf(idLetter[0]) + 1] + listOfLetters[0]
                idNumber = 1000
            } else {
                idLetter = idLetter[0] + listOfLetters[listOfLetters.indexOf(idLetter[1]) + 1]
                idNumber = 1000
            }
        }else{
            idNumber++;     
        }
         
        return {err:null,result:idLetter+idNumber}
    } catch (err) {
        console.log(err)
        return { err: 115, result: null }
    }
}

module.exports.createIdForBadgeAndCertificate = async(req,application) =>{
    try {
        if(!application){
            return {err: 115, result: null }
        }
        let guideTypeValues = {interpreter:"I",excursion_guide:"E",mountain_guide:"M"}
        let categoryValues = {0:"A",1:"C",2:"B",10:"D"}

        let idLetter = categoryValues[application.category] + guideTypeValues[application.guide_type]
        let idNumber
        
        const lastCreatedBadge =  await req.db.badges.findOne({
            where:{
                reg_num:{
                    [Op.iLike]: `%${idLetter}%`
                }
            },
            order: [
                ["reg_num", "DESC"]
            ]
        })
        if(!lastCreatedBadge){
             idNumber = 100000
        }else{
              idNumber = Number(lastCreatedBadge.reg_num.substring(2))
              idNumber++; 
        }
      
        return {err:null,result:idLetter+idNumber}
    } catch (err) {
        console.log(err)
        return { err: 115, result: null }
    }
}