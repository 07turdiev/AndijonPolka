const reply = require("../../helpers/reply")
const { Op, QueryTypes, where } = require("sequelize");

module.exports.getOrganizations = async (req, res) => {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 10
        const offset = req.query.offset ? Number(req.query.offset) : 0
        const searchWord = req.query.searchWord
        const regionId = req.query.region_id

        // Build where clause for filtering
        const whereClause = {}
        
        // Add region filter if provided
        if (regionId) {
            whereClause.region_id = regionId
        }
        
        // Add search filter if searchWord is provided
        if (searchWord) {
            whereClause[Op.or] = [
                { name_uz: { [Op.iLike]: `%${searchWord}%` } },
                { name_ru: { [Op.iLike]: `%${searchWord}%` } },
                { name_en: { [Op.iLike]: `%${searchWord}%` } }
            ]
        }

        const { rows, count } = await req.db.organizations.findAndCountAll({
            where: whereClause,
            offset,
            limit
        })
        console.log(count)
        return reply(res, 200, true, null, { organizations: rows, count })

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.getOrganization = async (req, res) => {
    try {
        const organization = await req.db.organizations.findOne({
            where: {
                organization_id: req.params.id
            }
        })

        if (!organization) {
            return reply(res, 404, false, 114, null)
        }

        return reply(res, 200, true, null, organization)

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.addOrganization = async (req, res) => {
    try {
        const { name_uz,name_ru,name_en,direction_uz,direction_ru,direction_en,cadastral_number,inn,region_id,global_id } = req.body
        
        if (!name_uz || !region_id || !inn) {
            return reply(res, 400, false, 113, null)
        }

        const organization = await req.db.organizations.create({
            name_uz,
            name_ru,
            name_en,
            direction_uz,
            direction_ru,
            direction_en,
            cadastral_number,
            inn,
            region_id,
            global_id
        })

        return reply(res, 200, true, null, organization)

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.putEditOrganization = async (req, res) => {
    try {
        const { name_uz,name_ru,name_en,direction_uz,direction_ru,direction_en,cadastral_number,inn,region_id ,global_id} = req.body

        if (!name_uz || !region_id || !inn) {
            return reply(res, 400, false, 113, null)
        }

        const organization = await req.db.organizations.findOne({
            where: {
                organization_id: req.params.id
            }
        })
        

        if (!organization) {
            return reply(res, 404, false, 114, null)
        }

        await organization.update({
            name_uz,
            name_ru,
            name_en,
            direction_uz,
            direction_ru,
            direction_en,
            cadastral_number,
            inn,
            region_id,
            global_id:global_id
        })

        return reply(res, 200, true, null, organization)

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}

module.exports.deleteOrganization = async (req, res) => {
    try {
        const organization = await req.db.organizations.findOne({
            where: {
                organization_id: req.params.id
            }
        })

        if (!organization) {
            return reply(res, 404, false, 114, null)
        }

        await organization.destroy()

        return reply(res, 200, true, null, null)

    } catch (err) {
        console.log(err)
        reply(res, 500, false, 108, null)
    }
}