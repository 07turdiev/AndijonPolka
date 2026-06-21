const Joi = require('joi'); 
const reply = require('../helpers/reply');

module.exports.checkJoiCreateApplication = function(req,res,next){
      const schema = Joi.object().keys({ 
        email: Joi.string().email(), 
        phone_number:Joi.string(),
        application_type:Joi.required(),
        guide_type:Joi.when("application_type",{
          is:"registration",
          then:Joi.string().required(),
          otherwise:Joi.string()
        }),
        languages:Joi.required(),
        regions:Joi.required(),
        isThirdParty:Joi.boolean().required()
      }); 
      const {value, error} = schema.validate(req.body)

      if(error){
          return next()
      }else{
         return next()
      }
}
