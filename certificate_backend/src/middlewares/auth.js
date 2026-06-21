const jwt = require("jsonwebtoken")
const reply = require("../helpers/reply")
const config = require("../modules/config")
const { v4: uuidv4 } = require("uuid");

const { getAccessToken, getUserDataByAccessToken } = require("../helpers/oneId")
const createToken = async (req, res, next) => {
    try {
        if (!req.query.code || req.query.code === "") {
            return reply(res, 500, false, 103, null)
        }

        const accessTokenResult = await getAccessToken(req.query.code)
        
        if (accessTokenResult.error && !accessTokenResult.result) {
            return reply(res, 500, false, 104, null)
        }

        const getUserDataResult = await getUserDataByAccessToken(accessTokenResult.result.access_token)

        if (getUserDataResult.error && !getUserDataResult.result) {
            return reply(res, 500, false, 105, null)
        }

        let user = await req.db.users.findOne({
            where: {
                pin: getUserDataResult.result.pin
            },
            raw:true
        })
        if (!user) {
            user = await req.db.users.create({
                first_name: getUserDataResult.result.first_name,
                sur_name: getUserDataResult.result.sur_name,
                mid_name: getUserDataResult.result.mid_name,
                birth_place: getUserDataResult.result.birth_place,
                birth_date: getUserDataResult.result.birth_date,
                ctzn: getUserDataResult.result.ctzn,
                per_adr: getUserDataResult.result.per_adr,
                pport_issue_place: getUserDataResult.result.pport_issue_place,
                pport_issue_date: getUserDataResult.result.pport_issue_date,
                pport_expr_date: getUserDataResult.result.pport_expr_date,
                pport_num: getUserDataResult.result.pport_no,
                pin: getUserDataResult.result.pin,
                gd: getUserDataResult.result.gd === "1" ? "M" : "F",
                email: getUserDataResult.result.email,
                phone_number: getUserDataResult.result.mob_phone_no,
                role: "user",
                data_token:uuidv4()
            })
        }else{
          await  req.db.users.update({
                first_name: getUserDataResult.result.first_name,
                sur_name: getUserDataResult.result.sur_name,
                mid_name: getUserDataResult.result.mid_name,
                birth_place: getUserDataResult.result.birth_place,
                birth_date: getUserDataResult.result.birth_date,
                ctzn: getUserDataResult.result.ctzn,
                per_adr: getUserDataResult.result.per_adr,
                pport_issue_place: getUserDataResult.result.pport_issue_place,
                pport_issue_date: getUserDataResult.result.pport_issue_date,
                pport_expr_date: getUserDataResult.result.pport_expr_date,
                pport_num: getUserDataResult.result.pport_no,
                gd: getUserDataResult.result.gd === "1" ? "M" : "F",
                email: getUserDataResult.result.email,
                phone_number: getUserDataResult.result.phone_number
            },{
                where:{
                    pin: getUserDataResult.result.pin 
                }
            })
        }

        let session = await req.db.sessions.findOne({
            where: {
                user_id: user.user_id
            },
            raw:true
        })

        if (!session) {
            await req.db.sessions.create({
                access_token: accessTokenResult.result.access_token,
                refresh_token: accessTokenResult.result.refresh_token,
                expires_in: accessTokenResult.result.expires_in,
                user_id: user.user_id
            })
        } else {
            await req.db.sessions.update({
                access_token: accessTokenResult.result.access_token,
                refresh_token: accessTokenResult.result.refresh_token,
                expires_in: accessTokenResult.result.expires_in
            }, {
                where: {
                    user_id: user.user_id
                }
            })
        }

        const token = jwt.sign(
            { user_id: user.user_id },
            config.TOKEN_KEY,
            {
                expiresIn: "10h",
            }
        );
        req.user = user
        // save user token
        req.token = token;
        // user
        next()

    } catch (err) {
        console.log(err);
        return reply(res, 500, false, 107, null);
    }
}

const isAllowed = function(permissions){

        return (req, res, next) => {
            if(permissions.includes(req.user.role) && req.user.status === "active"){
                 return next()
            }else{
                return next()
               // return reply(res, 403, false, 114, null)
            }
        } 
}

// const isUserAuth = async (req, res, next) => {
//     if (req.user && req.user.role === "user") {
//         return next()
//     } else {
//         return reply(res, 403, false, 114, null)
//     }
// }


// const isSuperAdmin = async (req, res, next) => {
//     if (req.user && req.user.role === "super") {
//         return next()
//     } else {
//         return reply(res, 403, false, 114, null)
//     }
// }

const verifyToken = async (req, res, next) => {
    let cookies = {};
    if(!req.headers["cookie"]){
        return reply(res, 403, false, 109)
    }
    const cookiesArray = req.headers.cookie.split(';');

    cookiesArray.forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        cookies[key] = value;
    });
    const token = cookies["access_token"];

    if (!token) {
        console.log(token)
        return reply(res, 403, false, 109);
    } else {
        try {
            const tokenData = jwt.verify(token, config.TOKEN_KEY);
            const user = await req.db.users.findOne({
                where: {
                    user_id: tokenData.user_id
                },
                raw:true
            })
            if(!user){
                return reply(res, 403, false, 109);
            }
            await req.db.users.update({
                lastSeen:new Date()
            },{
                where:{
                user_id: user.user_id 
            }
            })
            req.user = user
            return next();
        } catch (err) {
            console.log(err)
            return reply(res, 403, false, 109);
        }
    }
};
// const isAdmin = async (req, res, next) => {
//     if (req.user.role === "admin") {
//         return next()
//     } else {
//         return reply(res, 403, false, "User is not allowed to this api");
//     }
// }

module.exports.verifyToken = verifyToken;
module.exports.createToken = createToken;
// module.exports.isAdmin = isAdmin
// module.exports.isUserAuth = isUserAuth
// module.exports.isSuperAdmin = isSuperAdmin
module.exports.isAllowed = isAllowed

