const bcrypt =  require("bcryptjs")
const {HASHNUMBER} = require("../modules/config")
module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("admins", {
        name: {
            type: Sequelize.TEXT
        },
        login: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role:{
             type:Sequelize.ENUM,
             values:["staff","admin"],
             defaultValue:"staff"
        },
        admin_id:{
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        }
    }, {
      timestamps:false,  
       hooks: {
            beforeCreate:async(user) => {
                if (user.password) {
                  const salt = await  bcrypt.genSalt(Number(HASHNUMBER))
                  user.password  = await bcrypt.hash(user.password, salt)
                }
            },
            beforeUpdate: async(user) => {
                if (user.password) {
                    const salt = await  bcrypt.genSalt(Number(HASHNUMBER))
                    user.password  = await bcrypt.hash(user.password, salt)
                  }
            }
        },
        instanceMethods: {
            validPassword:async (password) => {
               const isMatch = await bcrypt.compare(password, this.password);
               return isMatch
            }
        }
    })
}
