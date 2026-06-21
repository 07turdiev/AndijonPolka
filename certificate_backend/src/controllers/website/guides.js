const reply = require("../../helpers/reply");
const { Op, QueryTypes, where } = require("sequelize");
const generateQRCode = require("../../helpers/qrcode")


module.exports.getCertificatedUsers = async (req, res) => {
    try {
        const search = {}
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0
        
        // Process search word filter
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
        
        // First, get certificates with filtered organizations if region_id is specified
        let certificateOptions = {}
        
        // Add category filter if specified
        if (req.query.guide_type && req.query.guide_type !== "") {
            certificateOptions.category = req.query.guide_type
        }
        
        // Add organization filter if specified
        if (req.query.organization_id && req.query.organization_id !== "") {
            certificateOptions.organization_id = req.query.organization_id
        }
        
        // If region_id is specified, we need to find certificates from organizations in that region
        if (req.query.region_id && req.query.region_id !== "") {
            // Find all organizations in the specified region
            const organizations = await req.db.organizations.findAll({
                where: {
                    region_id: req.query.region_id
                },
                attributes: ['organization_id']
            })
            
            // Get just the IDs as an array
            const orgIds = organizations.map(org => org.organization_id)
            
            // Only include certificates from these organizations
            if (orgIds.length > 0) {
                certificateOptions.organization_id = {
                    [Op.in]: orgIds
                }
            } else {
                // If no organizations found in the region, return empty result
                return reply(res, 200, true, null, { users: [], count: 0 })
            }
        }
        
        // Find all user_ids from certificates matching the criteria
        const certificates = await req.db.certificates.findAll({
            where: certificateOptions,
            attributes: ['user_id'],
            include: {
                model: req.db.organizations,
                attributes: ['organization_id', 'name_uz', 'name_ru', 'name_en']
            }
        })
        
        // Extract user IDs
        const userIds = certificates.map(cert => cert.user_id)
        
        // If no matches, return empty result
        if (userIds.length === 0) {
            return reply(res, 200, true, null, { users: [], count: 0 })
        }
        
        // Add user ID filter to search criteria
        search.user_id = {
            [Op.in]: userIds
        }
        
        // Now find users with the filtered IDs
        const { rows, count } = await req.db.users.findAndCountAll({
            where: search,
            include: [
                {
                    model: req.db.certificates,
                    include: [
                        {
                            model: req.db.organizations
                        }
                    ]
                }
            ],
            attributes: { exclude: ['pin', 'tin', 'pport_num'] },
            order: [
                ["first_name", "ASC"],
                ["sur_name", "ASC"]
            ],
            limit,
            offset
        })
        
        return reply(res, 200, true, null, { users: rows, count })
    } catch (err) {
        console.log(err)
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}



module.exports.getSingleGuide = async (req, res) => {
    try {
        const userDocument = await req.db.users.findOne({
            where: {
                data_token: req.query.id
            },
            include: [
                {
                    model: req.db.certificates,
                    include: [
                        {
                            model: req.db.organizations
                        }
                    ]
                }
            ],
            attributes: { exclude: ['pin', 'tin', 'pport_num'] },
        })

        const qrcode = await generateQRCode(userDocument.data_token ? userDocument.data_token : userDocument.user_id)
        return reply(res, 200, true, null, { userDocument, qrcode })

    } catch (err) {
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}


module.exports.getGuidesCount = async (req, res) => {
    try {

        const guidesCount = await req.db.users.count({
            distinct: true,
            col: 'user_id',
            include: [
                {
                    model: req.db.certificates,
                    required: true,
                    attributes: []
                }
            ]
        })

        return reply(res, 200, true, null, guidesCount)

    } catch (err) {
        return reply(res, 500, false, (err.message || "Something went wrong"), null)
    }
}

