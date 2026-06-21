'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {


      await queryInterface.addColumn("applications", "pport_num", {
         type: Sequelize.STRING,
         allowNull: false
      })
      await queryInterface.addColumn("applications", "category", {
         type: Sequelize.ENUM,
         values: ["0", "1", "2", "10"]
      })
      await queryInterface.addColumn("applications", "guide_type", {
         type: Sequelize.ENUM,
         values: ["interpreter", "excursion_guide", "mountain_guide"]
      })
      await queryInterface.changeColumn("applications", "application_type", {
         type: Sequelize.ENUM,
         values: ["registration", "update", "expansion", "badge"],
      })
      await queryInterface.changeColumn("applications", "pin", {
         type:Sequelize.STRING,
         allowNull:false,
         unique:false
      })
      await queryInterface.removeColumn("applications", "languages")
      await queryInterface.removeColumn("applications", "regions")
      await queryInterface.changeColumn("applications", "stage", {
         type: Sequelize.ENUM,
         values: ["1", "2", "3", "4", "10"],
      })
      await queryInterface.changeColumn("applications", "status", {
         type: Sequelize.ENUM,
         values: ["new", "checking", "accepted", "cancelled", "returned"],
      })

      await queryInterface.addColumn("applications", "paymentStatus", {
         type: Sequelize.ENUM,
         values: ["paid", "unpaid"],
         defaultValue: "unpaid"
      })
      await queryInterface.addColumn("applications", "paymentFile", {
         type: Sequelize.STRING
      })

   },

   async down(queryInterface, Sequelize) {

      await queryInterface.removeColumn("applications", "pport_num")
      await queryInterface.addColumn("applications", "category")
      await queryInterface.addColumn("applications", "guide_type")
      await queryInterface.changeColumn("applications", "pin", {
         type:Sequelize.STRING,
         allowNull:false,
         unique:true
      })
      await queryInterface.changeColumn("applications", "application_type", {
         type: Sequelize.ENUM,
         values: ["registration", "update", "expansion"],
      })
      await queryInterface.addColumn("applications", "languages", {
         type: Sequelize.ARRAY(Sequelize.INTEGER),
         allowNull: false
      })
      await queryInterface.addColumn("applications", "regions", {
         type: Sequelize.ARRAY(Sequelize.INTEGER),
         allowNull: false
      })
      await queryInterface.changeColumn("applications", "stage", {
         type: Sequelize.ENUM,
         values: ["1", "2", "3"],
      })
      await queryInterface.changeColumn("applications", "status", {
         type: Sequelize.ENUM,
         values: ["new", "checking", "accepted", "cancelled"],
      })

      await queryInterface.removeColumn("applications", "paymentStatus")
      await queryInterface.removeColumn("applications", "paymentFile")

   }
};
