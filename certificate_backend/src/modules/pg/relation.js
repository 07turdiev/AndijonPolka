module.exports = async (db) => {
    // Region -> Districts
    db.regions.hasMany(db.districts, { foreignKey: { name: "region_id" } })
    db.districts.belongsTo(db.regions, { foreignKey: { name: "region_id" } })

    // Region -> Participants
    db.regions.hasMany(db.participants, { foreignKey: { name: "region_id" } })
    db.participants.belongsTo(db.regions, { foreignKey: { name: "region_id" } })

    // District -> Participants
    db.districts.hasMany(db.participants, { foreignKey: { name: "district_id" } })
    db.participants.belongsTo(db.districts, { foreignKey: { name: "district_id" } })
}
