'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("applications", {
      first_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.DataTypes.STRING,
        allowNull:false 
      },
      middle_name: {
        type: Sequelize.DataTypes.STRING
      },
      pin:{
          type:Sequelize.DataTypes.STRING,
          allowNull:false,
          unique:true
      },
      email:{
        type:Sequelize.DataTypes.STRING
      },
      phone_number:{
        type:Sequelize.DataTypes.STRING
      },
      application_type: {
        type: Sequelize.DataTypes.ENUM,
        values:["registration","update","expansion"],
        allowNull:false  
      },
      languages: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false
      },
      regions: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: false
      },
      experience_doc: {
        type: Sequelize.STRING
      },
      certificate_doc: {
        type: Sequelize.STRING
      },
      medical_cer_doc: {
        type: Sequelize.STRING
      },
      proxy_doc: {
        type: Sequelize.STRING
      },
      badge_img: {
        type: Sequelize.STRING
      },
      isThirdParty:{
        type:Sequelize.DataTypes.BOOLEAN,
        defaultValue:false
      },
      application_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:Date.now()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue:Date.now()
      },
      user_id: {
        references: {
          model: "users",
          key: "user_id"
        },
        type: Sequelize.INTEGER
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('applications');
  }
};
