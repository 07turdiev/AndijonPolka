const {Sequelize} = require("sequelize")
const {DATABASE_URL} = require("../config")
const relations = require("./relation")
const applicationModel = require("../../models/application")
const certificateModel = require("../../models/certificate")
const userModel = require("../../models/user")
const adminModel = require("../../models/admin")
const sessionModel = require("../../models/session")
const regionModel = require("../../models/regions")
const organizationModel = require("../../models/organization")
const testTopicModel = require("../../models/testTopic")
const testQuestionModel = require("../../models/testQuestion")
const testAnswerModel = require("../../models/testAnswer")
const quarterModel = require("../../models/quarter")

const sequelize = new Sequelize(DATABASE_URL,{
    logging:false
})

module.exports.postgres = async function postgres(){
    try{
         await sequelize.authenticate()
         let db = {}
         db.admins = await adminModel(sequelize,Sequelize)
         db.applications = await applicationModel(sequelize,Sequelize)
         db.certificates = await certificateModel(sequelize,Sequelize)
         db.users = await userModel(sequelize,Sequelize)
         db.sessions = await sessionModel(sequelize,Sequelize)
         db.regions = await regionModel(sequelize,Sequelize)       
         db.organizations = await organizationModel(sequelize,Sequelize)
         db.testTopics = await testTopicModel(sequelize,Sequelize)
         db.testQuestions = await testQuestionModel(sequelize,Sequelize)
         db.testAnswers = await testAnswerModel(sequelize,Sequelize)    
         db.quarters = await quarterModel(sequelize,Sequelize)

         db.sequelize = sequelize
         await relations(db);
         await sequelize.sync({force:false,alter:true})
         
         return db;
    }catch(error){
        console.error("Unable to connect to the database ",error)
    }
}
