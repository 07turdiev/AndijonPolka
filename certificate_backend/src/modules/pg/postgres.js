const {Sequelize} = require("sequelize")
const {DATABASE_URL} = require("../config")
const relations = require("./relation")
const adminModel = require("../../models/admin")
const participantModel = require("../../models/participant")
const regionModel = require("../../models/regions")
const districtModel = require("../../models/district")

const sequelize = new Sequelize(DATABASE_URL, {
    logging: false
})

module.exports.postgres = async function postgres(){
    try{
         await sequelize.authenticate()
         let db = {}
         db.admins = await adminModel(sequelize, Sequelize)
         db.participants = await participantModel(sequelize, Sequelize)
         db.regions = await regionModel(sequelize, Sequelize)
         db.districts = await districtModel(sequelize, Sequelize)

         db.sequelize = sequelize
         db.Sequelize = Sequelize
         await relations(db);
         await sequelize.sync({ force: false, alter: true })

         return db;
    }catch(error){
        console.error("Unable to connect to the database ", error)
    }
}
