module.exports = async(sequelize, Sequelize) =>{
    return sequelize.define("session",{
        access_token:{
            type:Sequelize.STRING,
        },
        refresh_token:{
            type:Sequelize.STRING,
        },
        expires_in:{
            type:Sequelize.STRING,
        },
        session_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
    })
}