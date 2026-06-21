
module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("organizations", {
        name_uz:{
           type:Sequelize.STRING,
           allowNull:false
        },
        name_ru:{
            type:Sequelize.STRING
        },
        name_en:{
            type:Sequelize.STRING
        },
        direction_uz:{
            type:Sequelize.STRING
        },
        direction_ru:{
            type:Sequelize.STRING
        },
        direction_en:{
            type:Sequelize.STRING
        },
        cadastral_number:{
            type:Sequelize.STRING
        },
        inn:{
            type:Sequelize.STRING
        },
        global_id:{
            type:Sequelize.BIGINT,
            allowNull:false
        },
        organization_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    },{
        timestamps: false
    })
}