const reply = require("../../helpers/reply")

module.exports.getOrganizationsList = async (req,res) => {
     try{

         const search = {}
         if(req.query.region){
             Object.assign(search,{
                region_id:req.query.region
             })
         }
   
         const organizations = await req.db.organizations.findAll({
             where:search
         })

         return reply(res,200,true,null,organizations)
     }catch(err){
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
     }
}

module.exports.getRegionsList = async (req,res) => {
    try{
        const regions = await req.db.regions.findAll({
        })
        return reply(res,200,true,null,regions)

    }catch(err){
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
     }
}