'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add quarter_id to certificates table
    await queryInterface.addColumn("certificates", "quarter_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "quarters",
        key: "quarter_id"
      }
    })

    // Add quarter_id to applications table
    await queryInterface.addColumn("applications", "quarter_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "quarters",
        key: "quarter_id"
      }
    })

    // Remove the old quarter ENUM column from certificates
    await queryInterface.removeColumn("certificates", "quarter")
  },

  async down (queryInterface, Sequelize) {
    // Remove quarter_id from certificates table
    await queryInterface.removeColumn("certificates", "quarter_id")

    // Remove quarter_id from applications table
    await queryInterface.removeColumn("applications", "quarter_id")

    // Add back the old quarter ENUM column to certificates
    await queryInterface.addColumn("certificates", "quarter", {
      type: Sequelize.ENUM,
      values: ["1", "2", "3", "4"]
    })
  }
};
