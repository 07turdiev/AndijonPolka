const reply = require("../../helpers/reply")
const {getSignOut}  = require("../../helpers/oneId")
const generateQRCode = require("../../helpers/qrcode")

module.exports.postAuthorizeUser = async (req, res) => {
    try {
       res.cookie("access_token",req.token,{
          httpOnly:true,
          sameSite: "none",
          secure: true
       })
       delete req.user.per_adr
       delete req.user.pport_issue_place
       delete req.user.ctzn
       delete req.user.pport_issue_date
       delete req.user.pport_expr_date
       delete req.user.app_status
       delete req.user.status
       const qrcode = await generateQRCode(req.user.data_token?req.user.data_token:req.user.user_id)
       req.user.certificates = await req.db.certificates.findAll({
        where:{
            user_id:req.user.user_id
        },
        include:[
            {
                model: req.db.organizations
            }
        ]
       })

       return reply(res,200,true,null,{user:req.user, qrcode:qrcode})
    } catch (err) {
        console.log(err)
        reply(res, 500, false,108,null)
    }
}

module.exports.getUserProfile = async(req,res) =>{
    try{
      
       const user = await req.db.users.findOne({
            where:{
                user_id:req.user.user_id
            },
            include:[
                {
                    model: req.db.certificates,
                    include:[
                        {
                            model: req.db.organizations
                        }
                    ]
                }
              ],
            attributes:["phone_number","first_name","sur_name","mid_name","birth_date","pport_num","pin","gd","email","user_id","lastSeen"] ,
            // raw:true
        })
        if(!user){
            return reply(res,404,false,404,null)
        }
        const qrcode = await generateQRCode(user.data_token?user.data_token:user.user_id)
        return reply(res, 200, true, null, { user, qrcode })
        // return reply(res,200,true,null,{user})
    }catch(err){
        console.log(err)
        reply(res, 500, false,108,null)
    }
}

module.exports.postSignOutUser = async (req,res) =>{
    try{
        const session = await req.db.sessions.findOne({
            where:{
                user_id:req.user.user_id
            }
        })
        if(!session){
            return reply(res,404,false,404,null)
        }else{
            const {err,result}  = getSignOut(session,req.db.sessions)
            if(err){
                return reply(res,500,false,err,null)
            }else{
                res.clearCookie("access_token")
                return reply(res,200,true,null,"succesful signed out")
            }
        }
    }catch(err){
        console.log(err)
        reply(res, 500, false,108,null)
    }
}
