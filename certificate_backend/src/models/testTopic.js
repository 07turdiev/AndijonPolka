module.exports = async(sequelize, Sequelize) =>{
    return sequelize.define("test_topic",{
        topic_name:{
            type:Sequelize.TEXT,
        },
        test_topic_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quarter_id:{
            type: Sequelize.INTEGER,
            allowNull: true
        },
    })
}