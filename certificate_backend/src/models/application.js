module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("applications", {
        first_name: {
            type: Sequelize.STRING,
        },
        sur_name: {
            type: Sequelize.STRING,
        },
        middle_name: {
            type: Sequelize.STRING
        },
        pin:{
            type:Sequelize.STRING,
            allowNull:false
        },
        tin:{
            type:Sequelize.STRING
        },
        gd:{
            type:Sequelize.ENUM,
            values:["F","M"]
        },
        pport_num:{
            type: Sequelize.STRING,
            allowNull:false
        },
        phone_number:{
            type:Sequelize.STRING
        },
        application_type: {
            type: Sequelize.ENUM,
            values:["certificate"],
            allowNull:false   
        },
        badge_img:{
            type:Sequelize.JSON
        }, 
        application_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        application_number:{
           type:Sequelize.STRING
        },
        status:{
            type:Sequelize.ENUM,
            values:["new","accepted","done","cancelled"],
            defaultValue:"new",
            allowNull:false  
        },
        quarter_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        cancel_comment: {
            type: Sequelize.STRING,
            allowNull: true
        }
    })
}