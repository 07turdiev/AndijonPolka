module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("regions", {
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
        status:{
            type:Sequelize.ENUM,
            values:["active","inactive"],
            defaultValue:"active"
        },
        region_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    },{
        timestamps: false
    })
}