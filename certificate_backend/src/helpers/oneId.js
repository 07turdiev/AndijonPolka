const axios = require("axios");
const { ONE_ID_SCOPE, ONE_ID_OAUTH_URL, ONE_ID_CLIENT_ID, ONE_ID_CLIENT_SECRET, REDIRECT_URI } = require("../modules/config")

module.exports.getAccessToken = async (code) => {
    try {
        
        const response = await axios.post(ONE_ID_OAUTH_URL, {}, {
            params: {
                grant_type: "one_authorization_code",
                client_id: ONE_ID_CLIENT_ID,
                client_secret: ONE_ID_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI
            }
        });
        if (response.data && response.data.access_token) {
            return { error: null, result: response.data }
        } else {
            return { error: "unexpected error while getting access_token", result: null }
        }
    } catch (err) {
        console.log(err)
        return { error: err, result: null }
    }
}


module.exports.getUserDataByAccessToken = async (access_token) => {
    try {
        const response = await axios.post(ONE_ID_OAUTH_URL, {}, {
            params: {
                grant_type: "one_access_token_identify",
                client_id: ONE_ID_CLIENT_ID,
                client_secret: ONE_ID_CLIENT_SECRET,
                access_token: access_token,
                scope: ONE_ID_SCOPE
            }
        });
         console.log(response.data)
        if (response.data && response.data.sess_id) {
            return { error: null, result: response.data }
        } else {
            return { error: "unexpected error while getting user info", result: null }
        }
    } catch (err) {
        return { error: err, result: null }
    }
}

module.exports.getAccessTokenByRefresh = async (refresh_token) => {
    try {
        const response = await axios.post(ONE_ID_OAUTH_URL, {}, {
            params: {
                grant_type: "refresh_token",
                client_id: ONE_ID_CLIENT_ID,
                client_secret: ONE_ID_CLIENT_SECRET,
                refresh_token: refresh_token,
                scope: ONE_ID_SCOPE
            }
        });
        if (response.data && response.data.access_token) {
            return { error: null, result: response.data }
        } else {
            return { error: "unexpected error while getting user info", result: null }
        }
    } catch (err) {
        return { error: err, result: null }
    }
}

module.exports.getSignOut = async (session,sessionsModel) => {
    try {
        if (Date.now() > session.expires_in) {
            let { error, result } = await this.getAccessTokenByRefresh(session.refresh_token)
            if (!error && result) {
                await sessions.update({
                    access_token:result.access_token,
                    refresh_token:result.refresh_token,
                    expires_in:result.expires_in
                },{
                    where:{
                        session_id:session.session_id
                    }
                })
                const response = await axios.post(ONE_ID_OAUTH_URL,{}, {
                    params: {
                        grant_type: "one_log_out",
                        client_id: ONE_ID_CLIENT_ID,
                        client_secret: ONE_ID_CLIENT_SECRET,
                        access_token: result.access_token,
                        scope: ONE_ID_SCOPE
                    }
                });
                if(response.status === 200){
                    return {error:null,result:"Succesful signed out"}
                }else{
                    return {error:"error",result:null}
                }
            }else{
                return {error:error,result:null}
            }
        }else{
            const response = await axios.post(ONE_ID_OAUTH_URL,{}, {
                params: {
                    grant_type: "one_log_out",
                    client_id: ONE_ID_CLIENT_ID,
                    client_secret: ONE_ID_CLIENT_SECRET,
                    access_token: session.access_token,
                    scope: ONE_ID_SCOPE
                }
            });
            if(response.status === 200){
                return {error:null,result:"Succesful signed out"}
            }else{
                return {error:"error",result:null}
            }
        }
      
    } catch (err) {
        console.log(err)
        return { error: err, result: null }
    }
}