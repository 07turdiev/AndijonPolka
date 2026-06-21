const bcrypt = require("bcryptjs")
const regionsData = require("../data/regions.json")
const districtsData = require("../data/districts.json")
const config = require("../modules/config")

// Seed regions + districts (idempotent upsert) and a default admin.
async function seedReference(db) {
    // Regions
    const regionRows = regionsData.map(r => ({
        region_id: r.id,
        name_uz: r.name_uz,
        name_ru: r.name_ru,
        name_en: r.name_en,
        name_uz_cyr: r.name_uz_cyr,
        status: "active"
    }))
    await db.regions.bulkCreate(regionRows, {
        updateOnDuplicate: ["name_uz", "name_ru", "name_en", "name_uz_cyr", "status"]
    })

    // Districts
    const districtRows = districtsData.map(d => ({
        district_id: d.id,
        region_id: d.region_id,
        name_uz: d.name_uz,
        name_ru: d.name_ru,
        name_en: d.name_en,
        name_uz_cyr: d.name_uz_cyr,
        status: d.active === 1 ? "active" : "inactive"
    }))
    await db.districts.bulkCreate(districtRows, {
        updateOnDuplicate: ["region_id", "name_uz", "name_ru", "name_en", "name_uz_cyr", "status"]
    })

    // Default admin
    const adminCount = await db.admins.count()
    if (adminCount === 0) {
        await db.admins.create({
            name: "Administrator",
            login: config.ADMIN_LOGIN,
            password: config.ADMIN_PASSWORD, // hashed by model beforeCreate hook
            role: "admin"
        })
        console.log(`Default admin created -> login: ${config.ADMIN_LOGIN}`)
    }

    console.log(`Reference seeded: ${regionRows.length} regions, ${districtRows.length} districts`)
}

module.exports = { seedReference }
