const reply = require("../../helpers/reply")

module.exports.getLangsAndRegs = async(req,res) =>{
    try{
        const languages = await req.db.languages.findAll({
            where:{
                status:"active"
            }
        })
        const regions = await req.db.regions.findAll({
            where:{
                status:"active"
            }
        })

        return reply(res,200,true,null,{regions,languages})
    }catch(err){
       console.log(err)
       return reply(res,500,false,108,null)
    }
}

module.exports.getErrors = async(req,res) =>{
    try{
        
    }catch(err){
        console.log(err)
        return reply(res,500,false,108,null) 
    }
}

module.exports.getGuidesByPnfl = async(req,res)=>{
    try{

            const guides = await req.db.applications.findOne({
                where:{
                    pin:req.query.pinfl
                },
                include:[
                    {
                        model:req.db.regions
                    },
                    {
                        model:req.db.languages
                    }
                ]
            })  

           if(!guides){
              return reply(res,404,false,"NOT FOUND",null)
           }

            return reply(res,200,true,null,{
                first_name:guides.first_name,
                last_name:guides.sur_name,
                middle_name:guides.middle_name,
                category:guides.category,
                guide_type:guides.guide_type,
                regions:guides.regions,
                languages:guides.languages,
                cert_num:"GD-100010",
                badge_num:"GD-100010",
                cert_given_date:"2022-01-01 05:00:00+05",
                cert_expr_date:"2025-01-01 05:00:00+05",
                badge_given_date:"2022-01-01 05:00:00+05",
                badge_expr_date:"2025-01-01 05:00:00+05",
                pinfl:guides.pin,
                status:guides.status
            })
    }catch(err){
        console.log(err)
        return reply(res,500,false,108,null) 
    }
}