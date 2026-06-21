'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("address", {
      address: {
        type: Sequelize.STRING
      },
      exam_date: {
        type: Sequelize.DATE
      },
      exam_time: {
        type: Sequelize.DATE
      },
      lat: {
        type: Sequelize.STRING
      },
      long: {
        type: Sequelize.STRING
      },
      address_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }
    })

    await queryInterface.addColumn("applications", "test_address_id", {
      type: Sequelize.INTEGER,
      references: {
        model: 'address',
        key: 'address_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })

    await queryInterface.addColumn("applications", "practice_address_id", {
      type: Sequelize.INTEGER,
      references: {
        model: 'address',
        key: 'address_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })

    await queryInterface.createTable("languages", {
      name_uz: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_ru: {
        type: Sequelize.STRING
      },
      name_en: {
        type: Sequelize.STRING
      },
      status:{
        type:Sequelize.ENUM,
        values:["active","inactive"],
        defaultValue:"active"
      },
      lang_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }
    })

    await queryInterface.createTable("regions", {
      name_uz: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_ru: {
        type: Sequelize.STRING
      },
      name_en: {
        type: Sequelize.STRING
      },
      status:{
        type:Sequelize.ENUM,
        values:["active","inactive"],
        defaultValue:"active"
      },
      region_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      }
    })

    await queryInterface.createTable("ApplicationLanguage", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'applications',
          key: 'application_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lang_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'languages',
          key: 'lang_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable("GuideLanguage", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      guide_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'guides',
          key: 'guide_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lang_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'languages',
          key: 'lang_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable("BadgeLanguage", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      badge_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'badges',
          key: 'badge_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lang_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'languages',
          key: 'lang_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable("ApplicationRegion", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      region_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'regions',
          key: 'region_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      application_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'applications',
          key: 'application_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.createTable("GuideRegion", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      region_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'regions',
          key: 'region_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      guide_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'guides',
          key: 'guide_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })


    await queryInterface.createTable("BadgeRegion", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      region_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'regions',
          key: 'region_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      badge_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'badges',
          key: 'badge_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

  },
  async down(queryInterface, Sequelize) {
      await queryInterface.dropTable("address")
      await queryInterface.removeColumn("applications", "test_address_id")
      await queryInterface.removeColumn("applications", "practice_address_id")
      await queryInterface.dropTable("languages")
      await queryInterface.dropTable("regions")
      await queryInterface.dropTable("ApplicationLanguage")
      await queryInterface.dropTable("GuideLanguage")
      await queryInterface.dropTable("BadgeLanguage")
      await queryInterface.dropTable("ApplicationRegion")
      await queryInterface.dropTable("GuideRegion")
      await queryInterface.dropTable("BadgeRegion")
  }
};
