const { v4: uuidv4 } = require("uuid");
module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("users", {
         phone_number:{
            type:Sequelize.STRING
         },
         first_name:{
            type:Sequelize.STRING,
            allowNull:false
         },
         sur_name:{
            type:Sequelize.STRING,
            allowNull:false
         },
         mid_name:{
            type:Sequelize.STRING
         },
         birth_place:{
            type:Sequelize.STRING
         },
         birth_date:{
            type:Sequelize.STRING
         },
         ctzn:{
             type:Sequelize.STRING
         },
         per_adr:{
            type:Sequelize.STRING
         },
         pport_issue_place:{
             type:Sequelize.STRING
         },
         pport_issue_date:{
            type:Sequelize.STRING
         },
         pport_expr_date:{
            type:Sequelize.STRING
         },
         pport_num:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
         },
         pin:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
         },
         tin:{
            type:Sequelize.STRING
         },
         gd:{
           type:Sequelize.ENUM,
           values:["F","M"]
         },
         email:{
            type:Sequelize.STRING
         },
         app_status :{
             type:Sequelize.ENUM,
             values:["checking","cancelled","accepted"]
         },
         role:{
              type:Sequelize.ENUM,
              values:["user","moderator","admin","super"],
              defaultValue:"user"
         },
         status:{
            type:Sequelize.ENUM,
            values:["active","inactive"],
            defaultValue:"active"
         },
         data_token: {
            type: Sequelize.TEXT,
            allowNull: false,
            unique: true
          },
         user_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
         },
         lastSeen:{
            type:Sequelize.DATE
         }
    },{
      timestamps: false
    })
}
