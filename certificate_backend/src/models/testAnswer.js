module.exports = async(sequelize, Sequelize) =>{
    return sequelize.define("test_answer",{
        answer:{
            type:Sequelize.INTEGER,
        },
        number_of_questions:{
            type:Sequelize.INTEGER
        },
        number_of_correct_answers:{
            type:Sequelize.INTEGER
        },
        number_of_incorrect_answers:{
            type:Sequelize.INTEGER
        },
        test_answer_id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
    })
}