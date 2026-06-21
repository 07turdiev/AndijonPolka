const reply = require("../../helpers/reply")


module.exports.getTestTopics = async (req, res) => {
    try {
        const testTopics = await req.db.testTopics.findAll({
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

module.exports.postCreateTestTopic = async (req, res) => {
    try {
        const { topic_name, quarter_id } = req.body
        const testTopic = await req.db.testTopics.create({
          topic_name,
          quarter_id: quarter_id || null
        })
        return reply(res, 200, true, null, testTopic)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)
    }
}

module.exports.putUpdateTestTopic = async (req, res) => {
    try {
        const { topic_name, quarter_id } = req.body
        const testTopic = await req.db.testTopics.update({
          topic_name,
          quarter_id: quarter_id || null
        },{
          where:{
            test_topic_id:req.params.test_topic_id
          }
        })
        return reply(res, 200, true, null, testTopic)
    } catch (err) {
        console.log(err)
        reply(res, 500, false, 107, null)
    }
}

module.exports.deleteTestTopic = async (req, res) => {
  try {
    const testTopic = await req.db.testTopics.destroy({
      where:{
        test_topic_id:req.params.test_topic_id
      }
    })
    return reply(res, 200, true, null, testTopic)
  } catch (err) {
    console.log(err)
    reply(res, 500, false, 107, null)     
  }
}

// module.exports.postAuthorizeAdmin = async (req, res) => {
//     try {
//         res.cookie("access_token", req.token, {
//             httpOnly: true,
//             domain:".gidlar.uz"
//         })
//         if (req.user && (req.user.role === "moderator" || req.user.role === "admin" || req.user.role === "super")) {
//             return reply(res, 200, true, null, { user: req.user })
//         } else {
//             return reply(res, 403, false, 114, { app_status: req.user.app_status })
//         }
//     } catch (err) {
//         console.log(err)
//         reply(res, 500, false, 107, null)
//     }
// }

