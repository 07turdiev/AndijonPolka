'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing foreign key columns to certificates
    const table = 'certificates'
    await queryInterface.addColumn(table, 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn(table, 'region_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn(table, 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn(table, 'application_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    const table = 'certificates'
    await queryInterface.removeColumn(table, 'organization_id')
    await queryInterface.removeColumn(table, 'region_id')
    await queryInterface.removeColumn(table, 'user_id')
    await queryInterface.removeColumn(table, 'application_id')
  }
};



