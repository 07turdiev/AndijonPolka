'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("guides", {
      work_phone_number: {
        type: Sequelize.STRING
      },
      regions: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      guide_photo: {
        type: Sequelize.STRING
      },
      languages: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
      },
      univer_graduate_date: {
        type: Sequelize.STRING
      },
      univer_major: {
        type: Sequelize.STRING
      },
      univer_profession: {
        type: Sequelize.STRING
      },
      univer_name: {
        type: Sequelize.STRING
      },
      guide_type: {
        type: Sequelize.ENUM,
        values: ["interpreter", "excursion_guide", "mountain_guide"]
      },
      certificate_file: {
        type: Sequelize.STRING
      },
      data_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      qrcode_data: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'user_id'
        },
        allowNull: false
      },
      guide_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("guides")
  }
};
