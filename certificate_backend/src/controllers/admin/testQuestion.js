const reply = require("../../helpers/reply")

module.exports.getTestQuestions = async (req, res) => {
    try {
        const testQuestions = await req.db.testQuestions.findAll({
          where: {
            test_topic_id: req.params.test_topic_id
          }
        })
        return reply(res, 200, true, null, testQuestions)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)     
    }
}

module.exports.postCreateTestQuestion = async (req, res) => {
    try {
        const question = req.body.question
        const answer_1 = req.body.answer_1
        const answer_2 = req.body.answer_2
        const answer_3 = req.body.answer_3
        const answer_4 = req.body.answer_4
        const correct_answer = req.body.correct_answer
        const test_topic_id = req.body.test_topic_id
        const testQuestion = await req.db.testQuestions.create({
          question,
          answer_1,
          answer_2,
          answer_3,
          answer_4,
          correct_answer,
          test_topic_id
        })
        return reply(res, 200, true, null, testQuestion)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)     
    }
    }

module.exports.putUpdateTestQuestion = async (req, res) => {
    try {
        const question = req.body.question
        const answer_1 = req.body.answer_1
        const answer_2 = req.body.answer_2
        const answer_3 = req.body.answer_3
        const answer_4 = req.body.answer_4
        const correct_answer = req.body.correct_answer
        const testQuestion = await req.db.testQuestions.update({
          question,
          answer_1,
          answer_2,
          answer_3,
          answer_4,
          correct_answer
        },{
          where:{
            test_question_id:req.params.test_question_id
          }
        })
        return reply(res, 200, true, null, testQuestion)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)     
    }
}

module.exports.deleteTestQuestion = async (req, res) => {
    try {
        const testQuestion = await req.db.testQuestions.destroy({
          where:{
            test_question_id:req.params.test_question_id
          }
        })
        return reply(res, 200, true, null, testQuestion)
    } catch (err) {
        console.log(err) 
        reply(res, 500, false, 107, null)     
    }
}

// Get all test results for a user (admin)
module.exports.getUserTestResults = async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            return reply(res, 400, false, 108, "Missing user_id");
        }
        // Get all test results for this user, include topic name, order by topic and date
        const results = await req.db.testAnswers.findAll({
            where: { user_id },
            include: [
                {
                    model: req.db.testTopics,
                    attributes: ['topic_name', 'test_topic_id']
                }
            ],
            order: [
                ['test_topic_id', 'ASC'],
                ['createdAt', 'DESC']
            ]
        });
        return reply(res, 200, true, null, results);
    } catch (err) {
        console.log(err);
        reply(res, 500, false, 107, null);
    }
};
