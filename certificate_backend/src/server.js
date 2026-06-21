const express = require("express")
const app = express()
const {postgres} = require("./modules/pg/postgres")
const expressConfiguration = require("./middlewares/expressConfiguration")
const {expressErrorHandler} = require("./middlewares/expressErrorHandler")
const databaseMiddleware = require("./middlewares/database")
const {checkGuideActivityCroneJob} = require("./crone-jobs/checkActivity")
const routes = require("../src/routes/route")
const {PORT} = require("./modules/config")
const {insertLangsToDatabase,insertRegionsToDatabase} = require("./temporary/insertLangsRegs")
const {insertOrganizations} = require("./temporary/insertOrganizations")
async function server(){
    try{
        app.listen(PORT,()=>{
            console.log(`server ready ${PORT}`)
        })

        db = await postgres();
      //  checkGuideActivityCroneJob(db);
        await databaseMiddleware(db,app);
        await expressConfiguration(app)
     //      await insertOrganizations(db)
    //    await insertRegionsToDatabase(db)
   //    await insertLangsToDatabase(db)
    }catch(err){
         console.log("Server error : " ,err)
    }
    finally{
       routes(app);
       app.use(expressErrorHandler)
    }
}

module.exports.server = server
