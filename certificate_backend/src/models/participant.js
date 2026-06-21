module.exports = async (sequelize, Sequelize) => {
    return sequelize.define("participants", {
        participant_id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // Identity (from GSP passport API)
        pinfl: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        last_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        first_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        middle_name: {
            type: Sequelize.STRING
        },
        birth_date: {
            type: Sequelize.STRING
        },
        document: {
            // passport series+number OR birth-certificate number
            type: Sequelize.STRING
        },
        document_type: {
            type: Sequelize.STRING
        },
        gender: {
            type: Sequelize.STRING // "M" / "F"
        },
        birth_place: {
            type: Sequelize.STRING
        },
        nationality: {
            type: Sequelize.STRING
        },
        citizenship: {
            type: Sequelize.STRING
        },
        photo: {
            // path to saved photo file under /public, served via /api/cdn
            type: Sequelize.STRING
        },
        // Self-provided
        phone_number: {
            type: Sequelize.STRING
        },
        region_id: {
            type: Sequelize.INTEGER
        },
        district_id: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: true
    })
}
