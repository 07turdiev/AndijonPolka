let cron = require('node-cron');
const { Op } = require("sequelize");

module.exports.checkGuideActivityCroneJob = (db) => {
    try {

        cron.schedule('0 1 * * *', async function () {
            let promisesArray = []
            const currentDate = new Date()
            const expiredGuides = await db.guides.findAll({
                where: {
                    [Op.and]: [
                        {
                            "$badges.expr_date$": {
                                [Op.lt]: currentDate
                            }
                        }, {
                            "activity": "active"
                        }
                    ]
                },
                include: {
                    model: db.badges,
                    as: "badges",
                    attributes: ["reg_num", "expr_date"],
                },
                subQuery: false
            })

            for (let guide of expiredGuides) {
                let queryPromise = db.guides.update({
                    activity: "expired"
                }, {
                    where: {
                        guide_id: guide.guide_id
                    }
                })

                promisesArray.push(queryPromise)
            }

            Promise.all(promisesArray)
                .then((result) => {
                    console.log(result, " check Activity")
                })
                .catch((err) => {
                    console.log(err)
                })
        })


    } catch (err) {
        console.log(err)
    }

}