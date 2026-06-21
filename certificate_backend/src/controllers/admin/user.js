const reply = require("../../helpers/reply")
const { Op, QueryTypes, literal, fn } = require("sequelize");
const {getSignOut}  = require("../../helpers/oneId")


module.exports.postLogin = async(req,res) =>{
    reply(res,200,true,null,{token:req.token})
}


module.exports.postAuthorizeAdmin = async (req, res) => {
    try {
        res.cookie("access_token", req.token, {
            httpOnly: true,
            domain:".gidlar.uz"
        })
        if (req.user && (req.user.role === "moderator" || req.user.role === "admin" || req.user.role === "super")) {
            return reply(res, 200, true, null, { user: req.user })
        } else {
            return reply(res, 403, false, 114, { app_status: req.user.app_status })
        }
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)
    }
}


module.exports.postApplyForAdmin = async (req, res) => {
    try {
        console.log(req.user)
        if (req.user.app_status && (req.user.app_status === "checking" || req.user.app_status === "accepted")) {
            return reply(res, 403, false, 114, null)
        } else {
            await req.db.users.update({ app_status: "checking" }, {
                where: {
                    user_id: req.user.user_id
                }
            })

            return reply(res, 200, true, null, "applied succesfully")
        }
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}


module.exports.getAdminApplicants = async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0

        const { rows, counts } = await req.db.users.findAndCountAll({
            where: {
                app_status: "checking",
                role: "user"
            },
            offset,
            limit
        })

        return reply(res, 200, false, null, { users: rows, counts })

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.putAcceptApplicant = async (req, res) => {
    try {
       
        if (req.body.app_status === "accepted") {
            if (!req.body.role) {
                return reply(res, 500, false, 113, null)
            }
            await req.db.users.update({
                app_status: req.body.app_status,
                role: req.body.role
            }, {
                where: {
                    user_id: req.params.id
                }
            })

            return reply(res, 200, true, null, "permission was given succesfully!")
        } else {
            await req.db.users.update({
                app_status: req.body.app_status
            }, {
                where: {
                    user_id: req.params.id
                }
            })
        }
        return reply(res, 200, true, null, "application was cancelled succesfully!")

    } catch(err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.getAdminProfiles = async (req, res) => {
    try {
        const searchQuery = { role: ["admin", "moderator"] }
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0
        if (req.query.searchWord && req.query.searchWord !== "") {
            const word = req.query.searchWord.trim().split(" ")
            Object.assign(searchQuery, {
                [Op.or]: [
                    {
                        first_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        }
                    }, {
                        middle_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        }
                    }, {
                        sur_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        },
                    }, {
                        first_name: {
                            [Op.in]: word
                        }
                    }, {
                        middle_name: {
                            [Op.in]: word
                        }
                    }, {
                        sur_name: {
                            [Op.in]: word
                        }
                    }
                ]
            })
        }
        if (req.query.status && req.query.status !== "") {
            searchQuery.status = req.query.status
        }

        if (req.query.role && typeof (req.query.role) === "object") {
            searchQuery.role = req.query.status
        }

        if (req.query.lastSeen) {
            const today = new Date();
            const todayFormatted = today.toISOString().split('T')[0];
            Object.assign(searchQuery, literal(`DATE(${fn('DATE', literal('createdAt'))}) = '${todayFormatted}'`))
        }

        const { rows, count } = await req.db.users.findAndCountAll({
            where: searchQuery,
            order: [
                ["first_name", "ASC"],
                ["sur_name", "ASC"]
            ],
            offset: offset,
            limit: limit,
        })

        return reply(res, 200, true, null, { rows, count })
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.putEditAdminProfile = async (req, res) => {
    try {
        const { role, status } = req.body
        const user = await req.db.users.update({
            role,
            status
        }, {
            where: {
                user_id: req.params.id
            }
        })

        return reply(res, 200, true, null, "Successful updated")

    } catch (err) {
        console.log(err)
        return  reply(res, 500, false, 108, null)
    }
}


module.exports.getMyAdminProfile = async(req,res) =>{
    try{
      
       const user = await req.db.users.findOne({
            where:{
                user_id:req.user.user_id
            },
            attributes:["role","phone_number","first_name","sur_name","mid_name","birth_date","pport_num","pin","gd","email","user_id","lastSeen"] ,
            raw:true
        })
        if(!user){
            return reply(res,404,false,404,null)
        }
        return reply(res,200,true,null,{user})
    }catch(err){
        console.log(err)
        reply(res, 500, false,108,null)
    }
}

module.exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await req.db.users.findOne({
            where: { user_id: id }
        })

        if (!user) {
            return reply(res, 404, false, 114, null)
        }

        // Remove related data that may depend on the user
        await req.db.certificates.destroy({ where: { user_id: id } })
        await req.db.sessions.destroy({ where: { user_id: id } })
        await req.db.applications.destroy({ where: { user_id: id } })
        await req.db.testAnswers.destroy({ where: { user_id: id } })

        await req.db.users.destroy({ where: { user_id: id } })

        return reply(res, 200, true, null, null)
    } catch (err) {
        console.log(err)
        return reply(res, 500, false, 108, null)
    }
}

module.exports.postSignOutAdmin = async (req,res) =>{
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
