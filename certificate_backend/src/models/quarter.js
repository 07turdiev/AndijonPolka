module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("quarters", {
        quarter_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM,
            values: ["active", "inactive"],
            defaultValue: "active"
        }
    })
}
