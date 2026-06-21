const fs = require('fs');
const path = require('path');
// const { sequelize } = require('../db');
// const { organizations } = require('../models');
// const { regions } = require('../models');

// Helper function to calculate string similarity
function stringSimilarity(str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();
    
    // Remove common suffixes
    const suffixes = ['region','regions', 'viloyati', 'область', 'область'];
    suffixes.forEach(suffix => {
        str1 = str1.replace(suffix, '').trim();
        str2 = str2.replace(suffix, '').trim();
    });

    // Handle common variations
    const variations = {
        'sirdaryo': 'syrdaryo',
        'syrdaryo': 'sirdaryo',
        'andijan': 'andijon',
        'andijon': 'andijan',
        'region': 'regions',
        'Fergana': 'Ferghana',
        'Ferghana': 'Fergana',
    };

    if (variations[str1] === str2 || variations[str2] === str1) {
        return 1;
    }

    return str1 === str2 ? 1 : 0;
}

async function insertOrganizations(db) {
    try {
        // Read JSON files
        const orgEnData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/org_en.json'), 'utf8'));
        const orgRuData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/org_ru.json'), 'utf8'));
        const orgUzData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/org_uz.json'), 'utf8'));

        // Create a map of organizations by global_id
        const orgMap = new Map();

        // Process English data
        orgEnData.forEach(org => {
            if (!orgMap.has(org.Identifikatorraqami)) {
                orgMap.set(org.Identifikatorraqami, {
                    global_id: org.Identifikatorraqami,
                    direction_en: org['Yo\'nalish nomi'],
                    name_en: org['Tashkilot nomi'],
                    cadastral_number: org.Kadastrraqami,
                    inn: org.INN,
                    region_name: org.hududviloyat
                });
            }
        });

        // Process Russian data
        orgRuData.forEach(org => {
            if (orgMap.has(org.Identifikatorraqami)) {
                const existingOrg = orgMap.get(org.Identifikatorraqami);
                existingOrg.direction_ru = org['Yo\'nalish nomi'];
                existingOrg.name_ru = org['Tashkilot nomi'];
            }
        });

        // Process Uzbek data
        orgUzData.forEach(org => {
            if (orgMap.has(org.Identifikatorraqami)) {
                const existingOrg = orgMap.get(org.Identifikatorraqami);
                existingOrg.direction_uz = org['Yo\'nalish nomi'];
                existingOrg.name_uz = org['Tashkilot nomi'];
            }
        });

        // Get all unique region names from JSON
        const jsonRegionNames = [...new Set(Array.from(orgMap.values()).map(org => org.region_name))];
        
        // Get all regions from database
        const dbRegions = await db.regions.findAll();
        
        // Create a map of region matches
        const regionMap = new Map();
        const unmatchedRegions = new Set();

        // Find best matches for each JSON region
        for (const jsonRegion of jsonRegionNames) {
            let bestMatch = null;
            let bestSimilarity = 0;

            for (const dbRegion of dbRegions) {
                const similarity = stringSimilarity(jsonRegion, dbRegion.name_en);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = dbRegion;
                }
            }

            if (bestMatch && bestSimilarity > 0) {
                regionMap.set(jsonRegion, bestMatch.region_id);
                console.log(`Matched region: "${jsonRegion}" -> "${bestMatch.name_en}" (similarity: ${bestSimilarity})`);
            } else {
                unmatchedRegions.add(jsonRegion);
                console.log(`WARNING: No match found for region: "${jsonRegion}"`);
            }
        }
  
        // Log summary
        console.log('\nRegion matching summary:');
        console.log(`Total regions in JSON: ${jsonRegionNames.length}`);
        console.log(`Successfully matched: ${regionMap.size}`);
        console.log(`Unmatched regions: ${unmatchedRegions.size}`);
        if (unmatchedRegions.size > 0) {
            console.log('Unmatched region names:', Array.from(unmatchedRegions));
        }

        // Insert organizations with region relationships
        for (const org of orgMap.values()) {
            const regionId = regionMap.get(org.region_name);
            
            if (regionId) {
                await db.organizations.create({
                    global_id: org.global_id,
                    direction_en: org.direction_en,
                    direction_ru: org.direction_ru,
                    direction_uz: org.direction_uz,
                    name_en: org.name_en,
                    name_ru: org.name_ru,
                    name_uz: org.name_uz,
                    cadastral_number: org.cadastral_number,
                    inn: org.inn,
                    region_id: regionId
                });
            } else {
                console.log(`Skipping organization ${org.global_id} due to unmatched region: ${org.region_name}`);
            }
        }

        console.log('\nSuccessfully inserted organizations with languages and regions');
    } catch (error) {
        console.error('Error inserting organizations:', error);
        throw error;
    }
}

module.exports = {
    insertOrganizations
};
