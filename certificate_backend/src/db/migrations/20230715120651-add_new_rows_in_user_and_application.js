'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.changeColumn("applications", "stage", {
       type:Sequelize.ENUM,
       values:["1","2","3"],
       defaultValue:"1",
       allowNull:false 
    })
    await queryInterface.addColumn("applications", "application_number", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    })
    await queryInterface.addColumn("applications", "status", {
      type: Sequelize.ENUM,
      values: ["new", "checking", "accepted", "cancelled"],
      defaultValue: "new",
      allowNull: false
    })
   
    await queryInterface.addColumn("users", "lastSeen", {
      type: Sequelize.DATE
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("applications", "stage", {
      type:Sequelize.ENUM,
      values:["1","2","3","0"],
      allowNull:false 
   })
    await queryInterface.removeColumn("applications", "application_number")
    await queryInterface.removeColumn("applications", "status")

    await queryInterface.removeColumn("users", "lastSeen")

  }
};

