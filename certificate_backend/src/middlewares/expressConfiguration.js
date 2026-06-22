const cors = require("cors")
const express = require("express")
const path = require("path")
module.exports = async function expressConfiguration(app){
    app.use(cors({ credentials: true, origin: ['http://localhost:8080/','http://localhost:8080'," http://localhost:5173/","http://localhost:5173","http://localhost:3000","http://localhost:3000/","https://study.madaniyhayot.uz","https://culturevolunteers.uz"] }))
    app.options(["http://test.gidlar.uz",'http://localhost:8080/','http://localhost:8080',"http://127.0.0.1:5173",'http://profile.ijodkorlar.uz',"http://localhost:5173/","http://localhost:5173","http://localhost:3000","http://localhost:3000/","https://culturevolunteers.uz"], cors({ credentials: true, origin: ["https://study.madaniyhayot.uz",'http://localhost:8080/','http://localhost:8080',"https://admin.culturevolunteers.uz","http://localhost:5173/","http://localhost:5173","http://localhost:3000","http://localhost:3000/","https://culturevolunteers.uz"] }))   
    app.use(express.json({ limit: "8mb" }));
    app.use(express.urlencoded({ extended: true, limit: "8mb" }));
    app.use("/api/cdn",express.static(path.join(__dirname,"../../", "public")));
}

