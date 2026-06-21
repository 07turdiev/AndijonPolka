'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
   await queryInterface.createTable("badges", {
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
        type: Sequelize.STRING
      },
      expr_date: {
        type: Sequelize.DATE
      },
      reg_num: {
        type: Sequelize.STRING
      },
      given_place: {
        type: Sequelize.STRING
      },
      residence_place: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.ENUM,
        values: ["0", "1", "2", "10"]
      },
      guide_type: {
        type: Sequelize.ENUM,
        values: ["interpreter", "excursion_guide", "mountain_guide"]
      },
      status: {
        type: Sequelize.ENUM,
        values: ["active", "canceled", "expired"]
      },
      pport_num: {
        type: Sequelize.STRING
      },
      badge_img: {
        type: Sequelize.STRING
      },
      blood_group: {
        type: Sequelize.STRING
      },
      badge_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      languages: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
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
    await queryInterface.dropTable('badges');
  }
};
