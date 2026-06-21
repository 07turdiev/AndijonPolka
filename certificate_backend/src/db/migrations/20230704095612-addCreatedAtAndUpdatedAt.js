'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("badges","createdAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("badges","updatedAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("certificates","createdAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("certificates","updatedAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("guides","createdAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("guides","updatedAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("users","createdAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })
    await queryInterface.addColumn("users","updatedAt",{
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue:Date.now()
    })

  },

  async down (queryInterface, Sequelize) {
   
    await queryInterface.removeColumn("badges","createdAt")
    await queryInterface.removeColumn("badges","updatedAt")
    await queryInterface.removeColumn("certificates","createdAt")
    await queryInterface.removeColumn("certificates","updatedAt")
    await queryInterface.removeColumn("guides","createdAt")
    await queryInterface.removeColumn("guides","updatedAt")
    await queryInterface.removeColumn("users","createdAt")
    await queryInterface.removeColumn("users","updatedAt")
  }
};
