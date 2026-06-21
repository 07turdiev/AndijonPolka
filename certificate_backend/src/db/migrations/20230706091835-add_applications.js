'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn("applications","stage",{
          type:Sequelize.ENUM,
          values:["1","2","3","0"],
          allowNull:false 
      })

    await queryInterface.addColumn("users","app_status",{
        type:Sequelize.ENUM,
        values:["checking","cancelled","accepted"]
    })
    await queryInterface.addColumn("users","role",{
        type:Sequelize.ENUM,
        values:["user","moderator","admin","super"]
    })
    await queryInterface.addColumn("users","status",{
      type:Sequelize.ENUM,
      values:["active","inactive"],
      defaultValue:"active"
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("applications","stage")

     await queryInterface.removeColumn("users","app_status")
     await queryInterface.removeColumn("users","role")
     await queryInterface.removeColumn("users","status")
  }
};
