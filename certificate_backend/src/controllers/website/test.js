const reply = require("../../helpers/reply")

module.exports.getTestTopics = async (req, res) => {
    try {
        const where = {}
        if (req.query.quarter_id) {
            where.quarter_id = req.query.quarter_id
        }
        const testTopics = await req.db.testTopics.findAll({
            where,
            include: [{
                model: req.db.quarters,
                attributes: ['quarter_id', 'name', 'date']
            }]
        })
        return reply(res, 200, true, null, testTopics)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)
    }
}

module.exports.getTestQuestions = async (req, res) => {
    try {
        const testQuestions = await req.db.testQuestions.findAll({
            where:{
                test_topic_id:req.params.test_topic_id
            },
            attributes: {
                exclude: ['correct_answer']
          }
        })
     
        return reply(res, 200, true, null, testQuestions)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)     
    }
}

module.exports.checkTestAttempts = async (req, res) => {
  try {
    const { user_id, test_topic_id } = req.query;
    if (!user_id || !test_topic_id) {
      return reply(res, 400, false, 108, "Missing user_id or test_topic_id");
    }
    const attempts = await req.db.testAnswers.count({
      where: { user_id, test_topic_id }
    });
    // Get highest score
    const bestAttempt = await req.db.testAnswers.findOne({
      where: { user_id, test_topic_id },
      order: [['number_of_correct_answers', 'DESC']]
    });
    return reply(res, 200, true, null, {
      attempts,
      bestScore: bestAttempt ? bestAttempt.number_of_correct_answers : 0,
      bestAttempt
    });
  } catch (err) {
    console.log(err);
    reply(res, 500, false, 107, null);
  }
};

module.exports.postCreateTestAnswer = async (req, res) => {  
    try {
        const { test_topic_id, user_id, answers } = req.body;
        if (!Array.isArray(answers) || !test_topic_id || !user_id) {
            return reply(res, 400, false, 108, "Invalid input");
        }
        // Restrict to 3 attempts
        const attemptCount = await req.db.testAnswers.count({
          where: { user_id, test_topic_id }
        });
        if (attemptCount >= 3) {
          // Get highest score
          const bestAttempt = await req.db.testAnswers.findOne({
            where: { user_id, test_topic_id },
            order: [['number_of_correct_answers', 'DESC']]
          });
          return reply(res, 403, false, 109, {
            message: "Attempt limit reached",
            bestScore: bestAttempt ? bestAttempt.number_of_correct_answers : 0,
            bestAttempt
          });
        }
        // Fetch all questions for this topic and their correct answers
        const questionIds = answers.map(a => a.test_question_id);
        const questions = await req.db.testQuestions.findAll({
            where: { test_question_id: questionIds },
            attributes: ['test_question_id', 'correct_answer']
        });

        // Map question_id to correct answer
        const correctMap = {};
        questions.forEach(q => {
            correctMap[q.test_question_id] = q.correct_answer;
        });

        let correct = 0, incorrect = 0;
        answers.forEach(ans => {
            const correctField = correctMap[ans.test_question_id];
            // correctField is like "answer_1", "answer_2", etc.
            console.log("correctField",ans.selected === correctField)
    //        const correctIdx = ["answer_1", "answer_2", "answer_3", "answer_4"].indexOf(correctField);
            if (ans.selected === correctField) correct++;
            else incorrect++;
        });
        console.log("correct",correct,incorrect)
        const testAnswers = await req.db.testAnswers.create({
            number_of_questions: answers.length,
            number_of_correct_answers: correct,
            number_of_incorrect_answers: incorrect,
            test_topic_id,
            user_id
        });

        return reply(res, 200, true, null, {
            testAnswers,
            correct,
            incorrect
        });
    } catch (err) { 
        console.log(err)
        reply(res, 500, false, 107, null)     
    }
}

module.exports.checkTestForQuarter = async (req, res) => {
  try {
    const { user_id, quarter_id } = req.query;
    if (!user_id || !quarter_id) {
      return reply(res, 400, false, 108, "Missing user_id or quarter_id");
    }
    // Find test topics linked to this quarter
    const topicsForQuarter = await req.db.testTopics.findAll({
      where: { quarter_id },
      attributes: ['test_topic_id', 'topic_name']
    })
    if (topicsForQuarter.length === 0) {
      // No test topics for this quarter — user cannot apply
      return reply(res, 200, true, null, { hasPassed: false, noTestExists: true, topics: [] })
    }
    const topicIds = topicsForQuarter.map(t => t.test_topic_id)
    const { Op } = require('sequelize')
    const testResult = await req.db.testAnswers.findOne({
      where: {
        user_id,
        test_topic_id: { [Op.in]: topicIds }
      }
    })
    return reply(res, 200, true, null, {
      hasPassed: !!testResult,
      noTestExists: false,
      topics: topicsForQuarter
    })
  } catch (err) {
    console.log(err);
    reply(res, 500, false, 107, null);
  }
};

module.exports.getTestResults = async (req, res) => {
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





// module.exports.postCreateTestAnswer = async (req, res) => {  
//     try {
//         const number_of_questions = req.body.number_of_questions
//         const number_of_correct_answers = req.body.number_of_correct_answers
//         const number_of_incorrect_answers = req.body.number_of_incorrect_answers
//         const test_topic_id = req.body.test_topic_id
//         const user_id = req.body.user_id
//         const testAnswers = await req.db.testAnswers.create({
//             number_of_questions,
//             number_of_correct_answers,
//             number_of_incorrect_answers,
//             test_topic_id,
//             user_id
//         })
//         return reply(res, 200, true, null, testAnswers)
//     } catch (err) { 
//         console.log(err)
//         reply(res, 500, false, 107, null)     
//     }
// }

