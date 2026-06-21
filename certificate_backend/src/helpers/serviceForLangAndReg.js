module.exports.createLangAndReg = async (regionModel, model_id, model_id_name, regions) => {
   const arrayOfRegs = []
   if (regions) {
      if (typeof (typeof (regions[0]) === 'number')) {
         regions.map((reg) => {
            const regionModel = { region_id: reg }
            regionModel[model_id_name] = model_id
            arrayOfRegs.push(regionModel)
         })
      } else {
         regions.map((reg) => {
            const regionModel = { region_id: reg.region_id }
            regionModel[model_id_name] = model_id
            arrayOfRegs.push(regionModel)
         })
      }

      await regionModel.bulkCreate(arrayOfRegs)

   }

}


//###############

// module.exports.createLangAndReg = async (regionModel,languageModel,model_id, model_id_name, languages, regions) => {
//    const arrayOfLangs = [], arrayOfRegs = []
//    if (typeof (languages[0]) === 'number' && typeof (regions[0]) === 'number') {
//       languages.map((lang) => {
//          const langModel = { lang_id: lang}
//          langModel[model_id_name] = model_id
//          arrayOfLangs.push(langModel)
//       })
//       regions.map((reg) => {
//          const regionModel = { region_id: reg}
//          regionModel[model_id_name] = model_id
//          arrayOfRegs.push(regionModel)
//       })
//    }else{
//       languages.map((lang) => {
//          const langModel = { lang_id: lang.dataValues.lang_id }
//          langModel[model_id_name] = model_id
//          arrayOfLangs.push(langModel)
//       })
//       regions.map((reg) => {
//          const regionModel = { region_id: reg.region_id }
//          regionModel[model_id_name] = model_id
//          arrayOfRegs.push(regionModel)
//       })
//    }
//    await languageModel.bulkCreate(arrayOfLangs)
//    await regionModel.bulkCreate(arrayOfRegs)

// }


module.exports.updateLangAndReg = async () => {

}