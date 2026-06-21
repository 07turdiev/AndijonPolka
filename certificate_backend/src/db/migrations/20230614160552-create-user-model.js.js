'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      phone_number: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sur_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mid_name: {
        type: Sequelize.STRING
      },
      birth_place: {
        type: Sequelize.STRING,
        allowNull: false
      },
      birth_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ctzn: {
        type: Sequelize.STRING,
        allowNull: false
      },
      per_adr: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pport_issue_place: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pport_issue_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pport_expr_date: {
        type: Sequelize.STRING
      },
      pport_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      pin: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      gd: {
        type: Sequelize.ENUM,
        values: ["F", "M"]
      },
      email: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }
    })
  },

  async down(queryInterface, Sequelize) {   
    await queryInterface.dropTable("users")
  }
};
