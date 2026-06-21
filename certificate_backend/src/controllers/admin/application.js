const reply = require("../../helpers/reply")
const { createMemberAndBadge, checkPayment, testAnswer, testDate,practiceDate, practiceAnswer,createCertificate} = require("../../helpers/application")
const { Op, where } = require("sequelize");


module.exports.getListOfApplications = async (req, res) => {
    try {

        const searchQuery = {}
        let subSearch = {}
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0

        if (req.query.searchWord && req.query.searchWord !== "") {
            const word = req.query.searchWord.trim().split(" ")
            Object.assign(searchQuery, {
                [Op.or]: [
                    {
                        first_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        }
                    }, {
                        middle_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        }
                    }, {
                        sur_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        },
                    }, {
                        first_name: {
                            [Op.in]: word
                        }
                    }, {
                        middle_name: {
                            [Op.in]: word
                        }
                    }, {
                        sur_name: {
                            [Op.in]: word
                        }
                    }
                ]
            })
        }

        if (req.query.region_id && req.query.region_id !== "") {
            subSearch.region_id = req.query.region_id
        }

        if (req.query.application_type && req.query.application_type !== "") {
            searchQuery.application_type = req.query.application_type
        }
        if (req.query.status && req.query.status !== "") {
            searchQuery.status = req.query.status
        }

        // Year filter: filter by the year of the associated quarter
        if (req.query.year && req.query.year !== "") {
            const yearNum = parseInt(req.query.year)
            const yearStart = new Date(`${yearNum}-01-01`)
            const yearEnd = new Date(`${yearNum + 1}-01-01`)
            const quartersInYear = await req.db.quarters.findAll({
                where: {
                    date: {
                        [Op.gte]: yearStart,
                        [Op.lt]: yearEnd
                    }
                },
                attributes: ['quarter_id']
            })
            const quarterIds = quartersInYear.map(q => q.quarter_id)
            searchQuery.quarter_id = quarterIds.length > 0 ? { [Op.in]: quarterIds } : { [Op.is]: null }
        }

        const yearFilter = searchQuery.quarter_id ? { quarter_id: searchQuery.quarter_id } : {}

        const totalNumberApplications = await req.db.applications.count({ where: yearFilter })
        const newApplications = await req.db.applications.count({
            where: {
                status: "new",
                ...yearFilter
            }
        })
        const finishedApplications = await req.db.applications.count({
            where: {
                status: "done",
                ...yearFilter
            }
        })
        const acceptedApplications = await req.db.applications.count({
            where: {
                status: "accepted",
                ...yearFilter
            }
        })
        const cancelledApplications = await req.db.applications.count({
            where: {
                status: "cancelled",
                ...yearFilter
            }
        })

        const { rows, count } = await req.db.applications.findAndCountAll({
            distinct:true,
            where: searchQuery,
            include:[
               {
                model:req.db.organizations,
                where:subSearch,
                include:[
                    {
                        model:req.db.regions
                    }
                ]
               }
            ],
            attributes:{exclude: ["pin","pport_num"]},
            order: [
                ["createdAt", "DESC"],
                ["first_name", "ASC"],
                ["sur_name", "ASC"]
            ],
            limit: limit,
            offset: offset
        })
       
        return reply(res, 200, true, null, { rows, count, totalNumberApplications, newApplications, finishedApplications, acceptedApplications, cancelledApplications })

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.getSingleApplication = async (req, res) => {
    try {
        let application = await req.db.applications.findOne({
            attributes: { exclude: ["pin"] },
            where: {
                application_id: req.params.id
            },
            includes:[
                {
                 model:req.db.organizations,
                 includes:[
                     {
                         model:req.db.regions
                     }
                 ]
                }
             ],
           // raw: true
        })
        if (!application) {
            return reply(res, 404, false, 404, null)
        } 
        return reply(res, 200, true, null, { application })

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}


module.exports.putResponseToApplication = async (req,res) => {
    try{
        const application = await req.db.applications.findOne({
              where:{
                application_id:req.params.id
              }
        })
        if((req.body.status === "accepted" &&  application && application.status == 'new') || (req.body.status === "cancelled" &&  application && application.status == 'new')){
                const updateData = { status: req.body.status }
                if (req.body.status === 'cancelled' && req.body.cancel_comment) {
                    updateData.cancel_comment = req.body.cancel_comment
                }
                await req.db.applications.update(updateData, {
                    where: {
                        application_id: req.params.id
                    }
                })
          return reply(res,200,true,null,req.body.status)
        }else{
          return reply(res,500,true,null,"Wrong status body or wrong step")
        }         
        
    }catch(err){
        console.log(err)
        reply(res,500,false,108,null)
    }
}

module.exports.putCreateCertificate = async (req,res) => {
    try{
        const application = await req.db.applications.findOne({
            where:{
              application_id:req.params.id
            }
      })
       if(req.body.status = 'done'  &&  application && application.status == 'accepted'){
            const result = await createCertificate(req,application)
            return reply(res,200,result.error?false:true,result.error,result.result)
        }else if(req.body.status = 'cancelled' &&  application && application.status == 'accepted'){
             await req.body.applications.update({
                   status:req.body.status
             },{
                where:{
                    application_id:req.params.id
                }
             }) 
            return reply(res,200,true,null,"Successfully cancelled")
        }else {
            return reply(res,500,false,"Wrong status or application already gone",null)
        } 
    }catch(err){
        console.log(err)
        reply(res,500,false,108,null)
    }
}


