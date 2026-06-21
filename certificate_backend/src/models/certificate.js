module.exports = async (sequelize, Sequelize) => {
   return sequelize.define("certificates", {
      first_name: {
         type: Sequelize.STRING,
      },
      sur_name: {
         type: Sequelize.STRING,
      },
      middle_name: {
         type: Sequelize.STRING
      },
      pin:{
         type:Sequelize.STRING,
         allowNull:false
     },
      given_date: {
         type: Sequelize.DATE
      },
      expr_date: {
         type: Sequelize.DATE
      },
      organization_id: {
         type: Sequelize.INTEGER,
         allowNull: true
      },
      region_id: {
         type: Sequelize.INTEGER,
         allowNull: true
      },
      user_id: {
         type: Sequelize.INTEGER,
         allowNull: true
      },
      application_id: {
         type: Sequelize.INTEGER,
         allowNull: true
      },
      category: {
         type: Sequelize.ENUM, 
         values:["akt"],
         defaultValue:"akt"
      },
      status:{
         type:Sequelize.ENUM,
         values:["active","cancelled","expired","inactive"],
         defaultValue:"active"
      },
      badge_img:{
         type:Sequelize.JSON
      }, 
      reg_num: {
         type: Sequelize.STRING,
         unique:true
      },
      quarter_id: {
         type: Sequelize.INTEGER,
         allowNull: true
      },
      certificate_id: {
         type: Sequelize.INTEGER,
         autoIncrement: true,
         primaryKey: true
      }
   })

}

