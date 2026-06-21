'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  
    await queryInterface.sequelize.query('ALTER TABLE "applications" ALTER COLUMN "experience_doc" TYPE json USING "experience_doc"::json');

    await queryInterface.sequelize.query('ALTER TABLE "applications" ALTER COLUMN "certificate_doc" TYPE json USING "certificate_doc"::json');

    await queryInterface.sequelize.query('ALTER TABLE "applications" ALTER COLUMN "medical_cer_doc" TYPE json USING "medical_cer_doc"::json');

    await queryInterface.sequelize.query('ALTER TABLE "applications" ALTER COLUMN "proxy_doc" TYPE json USING "proxy_doc"::json');

    await queryInterface.sequelize.query('ALTER TABLE "applications" ALTER COLUMN "badge_img" TYPE json USING "badge_img"::json');

    await queryInterface.addColumn("applications", "lang_files", {
      type: Sequelize.ARRAY(Sequelize.JSON),
      defaultValue: []
    })
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.changeColumn("applications", "experience_doc", {
      type: Sequelize.STRING
    })
    await queryInterface.changeColumn("applications", "certificate_doc", {
      type: Sequelize.STRING
    })
    await queryInterface.changeColumn("applications", "medical_cer_doc", {
      type: Sequelize.STRING
    })
    await queryInterface.changeColumn("applications", "proxy_doc", {
      type: Sequelize.STRING
    })
    await queryInterface.changeColumn("applications", "badge_img", {
      type: Sequelize.STRING
    })
    await queryInterface.removeColumn("applications", "lang_files")
  }
};
