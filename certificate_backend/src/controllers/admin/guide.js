const reply = require("../../helpers/reply")
const { Op, where } = require("sequelize");
const { imageUpdate } = require("../../helpers/fileSave")
const generateQRCode = require("../../helpers/qrcode")
const { getAccessTokenMB, getPassportDataByParams } = require("../../helpers/mb")
const nanoId = require("nanoid/async")
const { generateBadge } = require("../../helpers/generateBadge")
const path = require('path');
const { JSCoverage } = require("puppeteer");


// module.exports.getGuidesListAdmin = async (req, res) => {
//     try {
//         const search = {}
//         const limit = req.query.limit ? Number(req.query.limit) : 10
//         const page = req.query.page ? Number(req.query.page) : 1
//         if (req.query.searchWord && req.query.searchWord !== "") {
//             const word = req.query.searchWord.trim().split(" ")
//             Object.assign(search,
//                 {
//                     [Op.or]:
//                         [
//                             {
//                                 first_name: {
//                                     [Op.iLike]: `%${req.query.searchWord}%`
//                                 }
//                             }, {
//                                 middle_name: {
//                                     [Op.iLike]: `%${req.query.searchWord}%`
//                                 }
//                             }, {
//                                 sur_name: {
//                                     [Op.iLike]: `%${req.query.searchWord}%`
//                                 },
//                             }, {
//                                 first_name: {
//                                     [Op.in]: word
//                                 }
//                             }, {
//                                 middle_name: {
//                                     [Op.in]: word
//                                 }
//                             }, {
//                                 sur_name: {
//                                     [Op.in]: word
//                                 }
//                             }
//                         ]
//                 }
//             )
//         }

//         const totalCount = await req.db.guides.count({
//             where:search
//         })

//         let lastPage = Math.ceil(totalCount / limit) 
//         let offset = limit * (page - 1)
//         const { rows, count } = await req.db.guides.findAndCountAll({
//             subQuery: false,
//             distinct: true,
//             where: search,
//             include: [
//                 {
//                     model: req.db.badges,
//                     as: "badges",
//                     // include:[
//                     //     {
//                     //        model:req.db.regions  
//                     //     },{
//                     //         model: req.db.langcerts,
//                     //         as: "langcertsb",
//                     //         where:subSearch
//                     //     }
//                     // ]
//                 },
//                 {
//                     model:req.db.langcerts,
//                     as:"langcertsg"
//                 },
//                 {
//                      model:req.db.regions
//                 }
//             ],
//             order: [
//                 ["first_name", "ASC"],
//                 ["sur_name", "ASC"]
//             ],
//             limit: limit,
//             offset:offset,
//         })

//         return reply(res, 200, true, null, { rows, count,meta:{firstPage:1,lastPage,page,perPage:limit,totalCount} })

//     } catch (err) {
//         return reply(res, 500, false, (err.message || "Something went wrong"), null)
//     }
// }


module.exports.getGuidesListAdmin = async (req, res) => {
    try {
        const search = {}
        let subSearch = {}
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0
        
        if (req.query.searchWord && req.query.searchWord !== "") {
            const word = req.query.searchWord.trim().split(" ")
            Object.assign(search, {
                [Op.or]: [
                    {
                        first_name: {
                            [Op.iLike]: `%${req.query.searchWord}%`
                        }
                    }, {
                        mid_name: {
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
                        mid_name: {
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
            // First find all organizations in this region
            const organizations = await req.db.organizations.findAll({
                where: {
                    region_id: req.query.region_id
                },
                attributes: ['organization_id']
            })
            
            const orgIds = organizations.map(org => org.organization_id)
            
            // Filter certificates by organizations in this region
            if (orgIds.length > 0) {
                subSearch.organization_id = {
                    [Op.in]: orgIds
                }
            } else {
                // If no organizations in region, return empty
                return reply(res, 200, true, null, { users: [], count: 0 })
            }
        }

        // Add year filter for certificates (via quarters)
        if (req.query.year && req.query.year !== "") {
            const yearNum = parseInt(req.query.year)
            const yearStart = new Date(`${yearNum}-01-01`)
            const yearEnd = new Date(`${yearNum + 1}-01-01`)
            const quartersInYear = await req.db.quarters.findAll({
                where: {
                    date: { [Op.gte]: yearStart, [Op.lt]: yearEnd }
                },
                attributes: ['quarter_id']
            })
            const quarterIds = quartersInYear.map(q => q.quarter_id)
            subSearch.quarter_id = quarterIds.length > 0 ? { [Op.in]: quarterIds } : { [Op.is]: null }
        }

        // Add quarter filter for certificates
        if (req.query.quarter_id && req.query.quarter_id !== "") {
            subSearch.quarter_id = req.query.quarter_id
        }

        // Add date range filter for certificate given_date
        if (req.query.start_date && req.query.end_date) {
            const startDate = new Date(req.query.start_date)
            const endDate = new Date(req.query.end_date)
            // Set end date to end of day
            endDate.setHours(23, 59, 59, 999)
            
            subSearch.given_date = {
                [Op.between]: [startDate, endDate]
            }
        } else if (req.query.start_date) {
            const startDate = new Date(req.query.start_date)
            subSearch.given_date = {
                [Op.gte]: startDate
            }
        } else if (req.query.end_date) {
            const endDate = new Date(req.query.end_date)
            endDate.setHours(23, 59, 59, 999)
            subSearch.given_date = {
                [Op.lte]: endDate
            }
        }

        const { rows, count } = await req.db.users.findAndCountAll({
            distinct: true,
            where: search,
            include: [
                {
                    model: req.db.certificates,
                    required: true,
                    where: subSearch,
                    include: [
                        {
                            model: req.db.organizations,
                            include: [
                                { model: req.db.regions }
                            ]
                        },
                        {
                            model: req.db.applications,
                            attributes: ['phone_number', 'tin'],
                            required: false
                        }
                    ]
                }
            ],
            // Expose TIN for admin list; keep PIN and passport number hidden
            attributes: { exclude: ['pin', 'pport_num'] },
            order: [
                ["first_name", "ASC"],
                ["sur_name", "ASC"]
            ],
            offset: offset,
            limit: limit
        })
        return reply(res, 200, true, null, { users: rows, count })
    } catch (err) {
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

module.exports.getSingleGuideAdmin = async (req, res) => {
    try {

        const guideDocument = await req.db.guides.findOne({
            where: {
                guide_id: req.params.id
            },
            include: [
                {
                    model: req.db.badges,
                    as: "badges"
                },
                {
                    model: req.db.regions
                },
                {
                    model: req.db.langcerts,
                    as: "langcertsg",
                }
            ],
        })
        if (!guideDocument) {
            return reply(res, 404, false, 404, null)
        }
        //  const qrcode = await generateQRCode(guideDocument.data_token)
        return reply(res, 200, true, null, { guideDocument })

    } catch (err) {
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

module.exports.postDownloadBadge = async (req, res) => {
    try {

        const guide = await req.db.guides.findOne({
            where: {
                guide_id: req.params.id
            },
            include: [
                {
                    model: req.db.badges,
                    as: "badges"
                }
            ]
        }, { nest: true })

        const before = new Date()
        const { err, code } = await generateBadge(guide.dataValues)
        const then = new Date()

        if (err && !code) {
            return reply(res, 500, false, (err.message || "Something went wrong"), null)
        } else {
            return reply(res, 200, true, null, code)
        }

    } catch (err) {
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

module.exports.postUserInfoByPinfl = async (req, res) => {
    try {
        const birth_date = req.body.birth_date
        const pport_num = req.body.pport_num

        const getToken = await getAccessTokenMB()

        if (!getToken) {
            return reply(res, 500, false, "Something went wrong while getting access token", null)
        }
        const pport_data = await getPassportDataByParams(getToken.access_token, birth_date, pport_num)
        if (!pport_data) {
            return reply(res, 500, false, "Something went wrong while getting passport data", null)
        }
        return reply(res, 200, true, null, { ...pport_data })
    } catch (err) {
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

module.exports.postCreateGuide = async (req, res) => {
    try {

        const { first_name, sur_name, middle_name, member_type, phone_number, address, pin, tin, pport_num, email, birth_place, birth_date, pport_issue_date, pport_issue_place, gd, university, major } = req.body

        let langcerlist
        if (typeof (req.body.langcerlist) === "string") {
            langcerlist = JSON.parse(req.body.langcerlist)
        } else {
            langcerlist = req.body.langcerlist
        }
        console.log(req.files, "lancerlist", langcerlist)
        let badge_img
        for (let file of req.files) {
            switch (file.fieldname) {
                case "member_photo": {
                    badge_img = path.posix.join("public", "images", file.filename)
                    break;
                }
                default: {
                    let lang_id = Number(file.fieldname.split("_")[1])
                    const matchedItemIndex = langcerlist.findIndex(langcer => langcer.lang_id == lang_id)
                    console.log(matchedItemIndex)
                    matchedItemIndex >= 0 ? langcerlist[matchedItemIndex].certificate_file = path.posix.join("private", "applications", file.filename) : langcerlist
                }
            }
        }


        let userDocument = await req.db.users.findOne({
            where: {
                pin
            }
        })
        if (!userDocument) {
            userDocument = await req.db.users.create({
                phone_number,
                email,
                first_name,
                sur_name,
                mid_name: middle_name,
                birth_place,
                birth_date,
                per_adr: address,
                pport_issue_place,
                pport_issue_date,
                pport_num,
                pin,
                tin,
                gd
            })
        } else {
            await req.db.users.update({
                phone_number,
                email,
                first_name,
                sur_name,
                mid_name: middle_name,
                birth_place,
                birth_date,
                per_adr: address,
                pport_issue_place,
                pport_issue_date,
                pport_num,
                gd
            }, {
                where: {
                    pin
                }
            })
        }


        const data_token = await nanoId.nanoid()


        const guideDocument = await req.db.guides.create({
            first_name,
            middle_name,
            sur_name,
            member_type,
            phone_number,
            birth_date,
            university,
            major,
            member_photo: badge_img,
            address,
            birth_place,
            pport_issue_date,
            pport_issue_place,
            gd,
            pin,
            data_token,
            tin,
            pport_num,
            email,
            user_id: userDocument.user_id
        })

        const badgeDocument = await req.db.badges.create({
            first_name,
            middle_name,
            sur_name,
            application_type: member_type,
            phone_number,
            address,
            pin,
            tin,
            pport_num,
            email,
            university,
            major,
            badge_img,
            guide_id: guideDocument.guide_id
        })

        let idObject = { guide_id: guideDocument.guide_id, badge_id: badgeDocument.badge_id }
        langcerlist = langcerlist.map(item => ({ ...item, ...idObject }))
        await req.db.langcerts.bulkCreate(langcerlist)


        return reply(res, 201, true, null, "Succesful created")

    } catch (err) {
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

module.exports.deleteGuide = async (req, res) => {
    try {
        const deletedGuide = await req.db.guides.findOne({
            where: {
                guide_id: req.params.id
            }
        })

        await req.db.langcerts.destroy({ where: { guide_id: req.params.id } });
        await req.db.badges.destroy({ where: { guide_id: req.params.id } })
        await req.db.guides.destroy({ where: { guide_id: req.params.id } })
        await req.db.users.destroy({ where: { pin: deletedGuide.pin } })
        return reply(res, 200, true, null, "Succesful deleted")

    } catch (err) {
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

module.exports.putUpdateGuide = async (req, res) => {
    try {

        const { first_name, sur_name, middle_name, member_type, phone_number, address, pin, tin, pport_num, email, birth_place, birth_date, pport_issue_date, pport_issue_place, gd, university, major } = req.body
        let langcerlist = req.body.langcerlist
        let badge_img

        for (let file of req.files) {
            switch (file.fieldname) {
                case "member_photo": {
                    badge_img = path.posix.join("public", "images", file.filename)
                    break;
                }
                default: {
                    let lang_id = Number(file.fieldname.split("_")[1])
                    const matchedItemIndex = langcerlist.findIndex(langcer => langcer.lang_id == lang_id)
                    console.log(matchedItemIndex)
                    matchedItemIndex >= 0 ? langcerlist[matchedItemIndex].certificate_file = path.posix.join("private", "applications", file.filename) : langcerlist
                }
            }
        }


        await req.db.guides.update({
            first_name,
            middle_name,
            sur_name,
            member_type,
            phone_number,
            birth_date,
            university,
            major,
            member_photo: badge_img,
            address,
            email,
        }, {
            where: {
                guide_id: req.params.id
            }
        })

        await req.db.badges.update({
            first_name,
            middle_name,
            sur_name,
            application_type: member_type,
            phone_number,
            address,
            email,
            university,
            major,
            badge_img
        }, {
            where: {
                guide_id: req.params.id
            }
        })

        await editLangcerts(req, langcerlist)

        return reply(res, 201, true, null, "Succesful updated")

    } catch (err) {
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}


async function editLangcerts(req, langcerts) {
    try {

        // Fetch existing items from the database
        const existingLangcerts = await req.db.langcerts.findAll({
            where: { guide_id: req.params.id } // Or any other relevant filtering criteria
        });

        // Convert existing items to a map for easy lookup
        const existingItemsMap = new Map();
        langcerts.forEach(item => existingItemsMap.set(item.lang_cer_id, item));

        // Track IDs of items to keep
        const itemsToKeep = new Set();

        // Process each item in the received array
        for (const item of langcerts) {
            if (item.lang_cer_id) {
                // Existing item, check if it needs to be updated
                if (existingItemsMap.has(item.lang_cer_id)) {
                    await req.db.langcerts.update({
                        certificate_type: item.certificate_type,
                        certificate_score: item.certificate_score,
                        certificate_file: item.certificate_file,
                    }, {
                        where: { lang_cer_id: item.lang_cer_id }
                    });
                    itemsToKeep.add(item.lang_cer_id);
                }
            } else {
                // New item, create it
                const newLangCert = await req.db.langcerts.create({
                    certificate_type: item.certificate_type,
                    certificate_score: item.certificate_score,
                    certificate_file: item.certificate_file,
                    lang_id: item.lang_id,
                    guide_id: req.params.id,
                });
                itemsToKeep.add(newLangCert.lang_cer_id);
            }
        }

        // Delete items that are not in the received array
        const itemsToDelete = existingLangcerts.filter(item => !itemsToKeep.has(item.lang_cer_id));
        for (const item of itemsToDelete) {
            await req.db.langcerts.destroy({ where: { lang_cer_id: item.lang_cer_id } });
        }
        return 200
    } catch (err) {
        console.log(err)
        return null
    }
}
