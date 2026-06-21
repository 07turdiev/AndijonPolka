const Router = require("express").Router()
const {getGuidesDatabase,putUpdateGuidesRandom} = require("../controllers/getDatabase")
const {postLogin,postAuthorizeAdmin,postApplyForAdmin,getAdminApplicants,putAcceptApplicant,getAdminProfiles,putEditAdminProfile,getMyAdminProfile,postSignOutAdmin,deleteUser} = require("../controllers/admin/user")
const {postUserInfoByPinfl,getGuidesListAdmin,getSingleGuideAdmin,postCreateGuide,putUpdateGuide,postDownloadBadge,deleteGuide} = require("../controllers/admin/guide")
const {verifyToken,createToken,isAdmin} = require("../middlewares/authAdmin")
const {putCreateCertificate,getListOfApplications,getSingleApplication,putResponseToApplication} = require("../controllers/admin/application")
const {getOrganizations,getOrganization,addOrganization,putEditOrganization,deleteOrganization} = require("../controllers/admin/organization")
const {getTestTopics,postCreateTestTopic,putUpdateTestTopic,deleteTestTopic} = require("../controllers/admin/testTopic")
const {getTestQuestions,postCreateTestQuestion,putUpdateTestQuestion,deleteTestQuestion,getUserTestResults} = require("../controllers/admin/testQuestion")
const {getQuarters,getQuarter,createQuarter,updateQuarter,deleteQuarter,getActiveQuarters} = require("../controllers/admin/quarter")
//
const {upload} = require("../middlewares/multerUpload")


// Router.get("/guides/database",getGuidesDatabase)
// Rlsouter.put("/guides/random",putUpdateGuidesRandom)
//after
Router.post("/login",createToken,postLogin)
Router.get("/me",getMyAdminProfile)
Router.post("/logout",postSignOutAdmin)
Router.get("/users",getAdminProfiles)
Router.put("/users/:id",putEditAdminProfile)
Router.delete("/users/:id",verifyToken,deleteUser)

// Router.post("/adminapplicants/apply",postApplyForAdmin)
// Router.get("/adminapplicants",getAdminApplicants)
// Router.put("/adminapplicants/:id",putAcceptApplicant)
Router.post("/guides/generate/pdf/:id",postDownloadBadge)
Router.get("/guides",verifyToken,getGuidesListAdmin)
Router.get("/guides/:id",verifyToken,getSingleGuideAdmin)
Router.post("/guides/create",verifyToken,upload(["./files/private/applications",{fieldname:"member_photo",path:"./files/public/images"}]).any(),postCreateGuide)
Router.put("/guides/edit/:id",verifyToken,upload(["./files/private/applications",{fieldname:"member_photo",path:"./files/public/images"}]).any(),putUpdateGuide)
Router.delete("/guides/:id",verifyToken,deleteGuide)
Router.post("/guides/passport/data",verifyToken,postUserInfoByPinfl)

//test
Router.get("/test/topics",verifyToken,getTestTopics)
Router.post("/test/topics/create",verifyToken,postCreateTestTopic)
Router.put("/test/topics/edit/:test_topic_id",verifyToken,putUpdateTestTopic)
Router.delete("/test/topics/delete/:test_topic_id",verifyToken,deleteTestTopic)

Router.get("/test/questions/:test_topic_id",verifyToken,getTestQuestions)
Router.post("/test/questions/create",verifyToken,postCreateTestQuestion)
Router.put("/test/questions/edit/:test_question_id",verifyToken,putUpdateTestQuestion)
Router.delete("/test/questions/delete/:test_question_id",verifyToken,deleteTestQuestion)
Router.get("/test/results",verifyToken,getUserTestResults)

Router.get("/applications",verifyToken,getListOfApplications)
Router.get("/applications/:id",verifyToken,getSingleApplication)
Router.put("/applications/certificate/:id",verifyToken,putCreateCertificate)
Router.put("/applications/:id",verifyToken,putResponseToApplication)

Router.get("/organizations",verifyToken,getOrganizations)
Router.get("/organizations/:id",verifyToken,getOrganization)
Router.post("/organizations/add",verifyToken,addOrganization)
Router.put("/organizations/edit/:id",verifyToken,putEditOrganization)
Router.delete("/organizations/:id",verifyToken,deleteOrganization)

// Quarters routes
Router.get("/quarters",verifyToken,getQuarters)
Router.get("/quarters/active",verifyToken,getActiveQuarters)
Router.get("/quarters/:id",verifyToken,getQuarter)
Router.post("/quarters/create",verifyToken,createQuarter)
Router.put("/quarters/edit/:id",verifyToken,updateQuarter)
Router.delete("/quarters/:id",verifyToken,deleteQuarter)

module.exports = Router