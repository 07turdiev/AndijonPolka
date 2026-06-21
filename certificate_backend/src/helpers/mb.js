const axios = require('axios');
const {MB_URL,MB_PASSWORD,MB_USERNAME,MB_CLIENT_SECRET,MB_CLIENT_ID,MB_URL_PASSPORT} = require("../modules/config")
const qs = require('qs');

module.exports.getAccessTokenMB = async ()=>{
    try{
        const token = Buffer.from(`${MB_CLIENT_ID}:${MB_CLIENT_SECRET}`).toString('base64');
        const tokenResponse = await  axios.post(`${MB_URL}?grant_type=password&username=${MB_USERNAME}&password=${MB_PASSWORD}`,{}, {
            headers: {
                'Authorization': `Basic ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        if(tokenResponse && tokenResponse.status === 200){
            return tokenResponse.data
       }else{
            return null
       }
    }catch(err){
        console.log(err)
        return null
    }
}

module.exports.getPassportDataByParams = async (token,birth_date,pport_num)=>{
    try{
        let transaction_id = Math.floor(Math.random()*1000000) 
        const bodyJson = {
            transaction_id,
            is_consent:"Y",
            langId:3,
            document:pport_num,
            birth_date,
            is_photo:"Y",
            Sender:"P"
        }
        const dataResponse  = await axios.post(`${MB_URL_PASSPORT}`,bodyJson,{
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        if(dataResponse && dataResponse.status === 200){
            return dataResponse.data
       }else{
            return null
       }
    }catch(err){
         console.log(err)
        return null
    }
}
