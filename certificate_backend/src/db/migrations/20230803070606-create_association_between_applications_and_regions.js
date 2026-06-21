'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await  queryInterface.addColumn("applications","region_id",{
         references: {
             model: "regions",
             key: "region_id"
         },
         type: Sequelize.INTEGER
     })
  },

  async down (queryInterface, Sequelize) {
       await queryInterface.removeColumn("applications","region_id")
  }
};
