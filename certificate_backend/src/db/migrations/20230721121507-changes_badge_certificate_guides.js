'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.changeColumn("applications", "pin", {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false
    })

    await queryInterface.changeColumn("badges", "status", {
      type: Sequelize.ENUM,
      values: ["active", "canceled", "expired", "inactive"],
      defaultValue: "active"
    })
    await queryInterface.changeColumn("badges", "pport_num", {
      type: Sequelize.STRING,
      allowNull: false
    })
    await queryInterface.addColumn("badges", "pin", {
      type: Sequelize.STRING,
      allowNull: false
    })
    await queryInterface.removeColumn("badges", "languages")
    await queryInterface.changeColumn("certificates", "status", {
      type: Sequelize.ENUM,
      values: ["active", "canceled", "expired", "inactive"],
      defaultValue: "active"
    })
    await queryInterface.addColumn("guides", "first_name", {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn("guides", "last_name", {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn("guides", "middle_name", {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn("guides", "category", {
      type: Sequelize.ENUM,
      values: ["0", "1", "2", "10"]
    })
    await queryInterface.renameColumn("guides", "work_phone_number", "phone_number")
    await queryInterface.removeColumn("guides", "regions")
    await queryInterface.removeColumn("guides", "languages")
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.changeColumn("applications", "pin", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    })

    await queryInterface.changeColumn("badges", "status", {
      type: Sequelize.ENUM,
      values: ["active", "canceled", "expired"],
      defaultValue: "active"
    })
    await queryInterface.changeColumn("badges", "pport_num", {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.removeColumn("badges", "pin")
    await queryInterface.addColumn("badges", "languages", {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    })

    await queryInterface.changeColumn("certificates", "status", {
      type: Sequelize.ENUM,
      values: ["active", "canceled", "expired"],
      defaultValue: "active"
    })
    await queryInterface.removeColumn("guides", "first_name")
    await queryInterface.removeColumn("guides", "last_name")
    await queryInterface.removeColumn("guides", "middle_name")
    await queryInterface.removeColumn("guides", "category")
    await queryInterface.renameColumn("guides", "phone_number", "work_phone_number")
    await queryInterface.addColumn("guides", "regions", {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    })
    await queryInterface.addColumn("guides", "languages", {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    })
  }
};
