module.exports = async(sequelize, Sequelize) =>{
    return sequelize.define("test_question",{
        question:{
            type:Sequelize.TEXT,
        },
        answer_1:{
            type:Sequelize.STRING,
        },
        answer_2:{
            type:Sequelize.STRING,
        },
        answer_3:{
            type:Sequelize.STRING,
        },
        answer_4:{
            type:Sequelize.STRING,
        },
        correct_answer:{
            type:Sequelize.STRING,
            enum:["answer_1","answer_2","answer_3","answer_4"]
        },
        test_question_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    })
}