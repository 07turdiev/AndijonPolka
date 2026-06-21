const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const reply = require("../helpers/reply")
const config = require("../modules/config")
const createToken = async (req, res, next) => {
    try {
        // Get user input
        const { login, password } = req.body;
        // Validate user input
        if (!(login && password)) {
            return reply(res,500,false,"All inputs are required");
        }
        // Validate if user exist in our database
        const user = await req.db.admins.findOne({ where: { login: login }, raw: true });
    
        if (user) {
            // Create token
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) { return reply(res,500,false,(err.message || "Something went wrong")); }
                if (!isMatch) { return reply(res,403,false,"password is wrong");}
                else {
                    const token = jwt.sign(
                        { user: user.admin_id,role:user.role},
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
                }
            })

        } else {
            return reply(res,404,false,"User not found");
        }
    } catch (err) {
        console.log(err);
        return reply(res,500,false,(err.message || "Something went wrong"));
    }
}

const verifyToken = async (req, res, next) => {

    const token =
        req.body.token || req.query.token || req.headers["authorization"];

    if (!token) {
        return reply(res,403,false,"A token is required for authentication");
    } else {
        try {
            console.log(token,"config",config.TOKEN_KEY)
            const user = jwt.verify(token, config.TOKEN_KEY);
            const newUser = await req.db.admins.findOne({where:{admin_id:user.user}})
            req.user = newUser
        } catch (err) {
            console.log(err)
            return reply(res,403,false,"A token is required for authentication");
        }
        return next();
    }
};

const isAdmin = function(permissions){

    return (req, res, next) => {
        if(req.user && permissions.includes(req.user.role)){
             return next()
        }else{
            return reply(res, 403, false, "User is not allowed to this api", null)
        }
    } 
}

module.exports.verifyToken = verifyToken;
module.exports.createToken = createToken;
module.exports.isAdmin = isAdmin