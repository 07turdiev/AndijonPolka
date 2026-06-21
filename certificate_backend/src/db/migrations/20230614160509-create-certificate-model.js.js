'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("certificates", {
     first_name: {
        type: Sequelize.STRING,
     },
     last_name: {
        type: Sequelize.STRING,
     },
     middle_name: {
        type: Sequelize.STRING
     },
      given_date: {
        type: Sequelize.DATE
      },
      expr_date: {
        type: Sequelize.DATE
      },
      category: {
        type: Sequelize.ENUM, 
        values:["0","1","2","10"]
     },
      reg_num: {
        type: Sequelize.STRING,
        unique:true
      },
      status:{
        type:Sequelize.ENUM,
        values:["active","canceled","expired"]
      },
      certificate_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      guide_id: {
         references: {
             model: "guides",
             key: "guide_id"
         },
        type: Sequelize.INTEGER
      }
    })
  },

  async down(queryInterface, Sequelize) {
  
     await queryInterface.dropTable('certificates');
     
  }
};
