module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("districts", {
        district_id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        region_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
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
        name_uz_cyr: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.ENUM,
            values: ["active", "inactive"],
            defaultValue: "active"
        }
    }, {
        timestamps: false
    })
}
