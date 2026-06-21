const axios = require("axios")
const path = require("path")

module.exports.getGuidesDatabase = async (req, res) => {
    try {

        
        axios({
            method: 'get',
            url: 'http://185.8.212.208:1739/api/v1'
        })
            .then(async function (response) {
                 const currentDate = Date.now()
                 const object = response.data[7]
                for (let object of response.data) {
                    const name = object.fio_uz.split(" ")
                    let middle_name = name[3] && name[3] !== undefined ? name[2] + " " +name[3] :name[2]
                    let birth_date = object.birth_date
                    let  array_birth_date = birth_date.split("-")
                    birth_date = array_birth_date[2]+"-" + array_birth_date[1]+"-" + array_birth_date[0]
                    let gender = object.sex === "Мужчина" ? "M" : "F"
                    let work_phone_number = object.working_tel
                    let personal_phone_number = object.personal_tel
                    let category = 0
                    if (object.category_guide === "Высшая категория") {
                        category = 10
                    } else if (object.category_guide === "I категория") {
                        category = 1
                    } else if (object.category_guide === "II категория") {
                        category = 2
                    }
                    let univer_graduated_year = object.graduated_year
                    if(univer_graduated_year && univer_graduated_year !== ""){
                       let univer_graduated_year_array = univer_graduated_year.split("-")
                       univer_graduated_year = univer_graduated_year_array[2] + "-" + univer_graduated_year_array[1] + "-" + univer_graduated_year_array[0]
                    }
                    const languages = getLanguageId(object.language)
                    
                   
                    const email = object.email
                    const data_token = object.data_token
                    const regions = getRegion(object.region_id)
                    let exprDate = object.beydj_date.split("-") 
                    exprDate = new Date(`${exprDate[2]}-${exprDate[1]}-${exprDate[0]}`)
                    exprDate = exprDate.getTime()
                    let activity = null
                    if(currentDate>exprDate){
                        activity = "expired"
                    }else{
                        activity = "active"
                    }
                    let attestation_given_date = object.attestation_given_date
                    if(attestation_given_date && attestation_given_date !== ""){
                        let attestation_given_date_array = attestation_given_date.split("-")
                        attestation_given_date = attestation_given_date_array[2] + "-" + attestation_given_date_array[1] + "-" + attestation_given_date_array[0] 
                    }
                    let photo = path.join("badgeImages",object.photo)
                    let file = object.file && object.file !== null ?path.join("applicationFiles",object.file):null
                    
                  const userDocument =  await req.db.users.create({
                        phone_number:personal_phone_number,
                        email:email
                      })
                    const guideDocument =   await req.db.guides.create({
                        first_name:name[1] ,
                        middle_name:middle_name ,
                        last_name:name[0] ,
                        birth_date:birth_date,
                        gender:gender,
                        work_phone_number:work_phone_number,
                        personal_phone_number:personal_phone_number,
                        regions:regions,
                        guide_photo:photo,
                        category:category,
                        languages:languages,
                        univer_graduate_date:univer_graduated_year,
                        guide_type:"interpreter",
                        data_token:data_token,
                        activity:activity,
                        user_id:userDocument.user_id,
                        certificate_file:file
                    })

                  await req.db.badges.create({
                    expr_date:exprDate,
                    given_date:attestation_given_date,
                    reg_num:object.attestation_sertificate,
                    guide_id:guideDocument.guide_id
                  })

               }
                res.send("ok")
            })
            .catch(err => {
                console.log(err)
                res.send("something went wrong!")
            });

    } catch (err) {
           res.send(err)
    }
}

module.exports.putUpdateGuidesRandom = async(req,res) =>{
     try{
         for(let i = 0;i<req.body.amount;i++){
            const randomNumber = Math.floor(Math.random() * 1500) + 1;

         await  req.db.guides.update({
                guide_type:req.body.guide_type
            },{
                where:{
                    guide_id:randomNumber
                }
            })
         }
        
         res.send("succesful done!")
        
     }catch(err){
        res.send(err)
     }
}


function getRegion(regionString) {
    const regionsArray = regionString.split(",")
    let regionIds = []
    for (let region of regionsArray) {
        switch (region) {
            case "Samarqand viloyati": {
                regionIds.push(8);
                break;
            }
            case "Qoraqalpog‘iston": {
                regionIds.push(7);
                break;
            }
            case "Buxoro viloyati": {
                regionIds.push(1);
                break;
            }
            case "Navoiy viloyati": {
                regionIds.push(5);
                break;
            }
            case "Andijon viloyati": {
                regionIds.push(6);
                break;
            }
            case "Fargona viloyati": {
                regionIds.push(2);
                break;
            }
            case "Surxondaryo viloyati": {
                regionIds.push(10);
                break;
            }
            case "Sirdaryo viloyati": {
                regionIds.push(9);
                break;
            }
            case "Xorazm viloyati": {
                regionIds.push(13);
                break;
            }
            case "Toshkentviloyati": {
                regionIds.push(12);
                break;
            }
            case "Qashqadaryo viloyati": {
                regionIds.push(6);
                break;
            }
            case "jizzakh viloyati": {
                regionIds.push(3);
                break;
            }
            case "Namangan viloyati": {
                regionIds.push(4);
                break;
            }
            case "Toshkent shahar": {
                regionIds.push(11);
                break;
            }
            case "O'zbekiston tog'lari": {
                regionIds.push(14);
                break;
            }
        }
    }

    return regionIds

}

function getLanguageId(langString) {
    let langArray = langString.split(",")
    let langIds = []
    for (let lang of langArray) {
        switch (lang) {
            case " Xitoy tili ": {
                langIds.push(45);
                break;
            }
            case " Arab tili ": {
                langIds.push(4);
                break;
            }
            case " Hind tili ": {
                langIds.push(27);
                break;
            }
            case " Ingliz tili ": {
                langIds.push(3);
                break;
            }
            case " Ispan tili ": {
                langIds.push(37);
                break;
            }
            case " Bengal tili ": {
                langIds.push(13);
                break;
            }
            case " Portugal tili ": {
                langIds.push(40);
                break;
            }
            case " Rus tili ": {
                langIds.push(2);
                break;
            }
            case " Yapon tili ": {
                langIds.push(9);
                break;
            }
            case " Nemis tili ": {
                langIds.push(47);
                break;
            }
            case " Koreys tili ": {
                langIds.push(8);
                break;
            }
            case " Frantsuz tili ": {
                langIds.push(28);
                break;
            }
            case " Yava tili ": {
                langIds.push(132);
                break;
            }
            case " Telugu tili ": {
                langIds.push(136);
                break;
            }
            case " Marati tili ": {
                langIds.push(71);
                break;
            }
            case " Vetnam tili ": {
                langIds.push(20);
                break;
            }
            case " Tamil tili ": {
                langIds.push(104);
                break;
            }
            case " Italyan tili ": {
                langIds.push(5);
                break;
            }
            case " Turk tili ": {
                langIds.push(39);
                break;
            }
            case " Urdu tili ": {
                langIds.push(114);
                break;
            }
            case " Panjob tili ": {
                langIds.push(81);
                break;
            }
            case " Ukrain tili ": {
                langIds.push(30);
                break;
            }
            case " Gujarati tili ": {
                langIds.push(111);
                break;
            }
            case " Polyak tili ": {
                langIds.push(42);
                break;
            }
            case " Malayalam tili ": {
                langIds.push(66);
                break;
            }
            case " Kannada tili ": {
                langIds.push(41);
                break;
            }
            case " Oriya tili ": {
                langIds.push(79);
                break;
            }
            case " Birma tili ": {
                langIds.push(126);
                break;
            }
            case " Ozarbayjon tili ": {
                langIds.push(26);
                break;
            }
            case " Fors tili ": {
                langIds.push(82);
                break;
            }
            case " Sundan tili ": {
                langIds.push(101);
                break;
            }
            case " Pashto tili ": {
                langIds.push(85);
                break;
            }
            case " Rumin tili ": {
                langIds.push(33);
                break;
            }
            case " Bxojpuri tili ": {
                langIds.push(17);
                break;
            }
            case " Haus tili ": {
                langIds.push(119);
                break;
            }
            case " Maithili tili ": {
                langIds.push(63);
                break;
            }
            case " Serbo-xorvat tili ": {
                langIds.push(93);
                break;
            }
            case " Yoruba tili ": {
                langIds.push(109);
                break;
            }
            case " Golland tili ": {
                langIds.push(43);
                break;
            }
            case " Sindxi tili ": {
                langIds.push(96);
                break;
            }
            case " Igbo tili ": {
                langIds.push(110);
                break;
            }
            case " Oromo tili ": {
                langIds.push(80);
                break;
            }
            case " Indoneziya tili ": {
                langIds.push(34);
                break;
            }
            case " Nepal tili ": {
                langIds.push(76);
                break;
            }
            case " Assam tili ": {
                langIds.push(57);
                break;
            }
            case " Saraiki tili ": {
                langIds.push(81);
                break;
            }
            case " Sebuano tili ": {
                langIds.push(91);
                break;
            }
            case " Venger tili ": {
                langIds.push(19);
                break;
            }
            case " Chittagong tili ": {
                langIds.push(45);
                break;
            }
            case " Chjuan tili ": {
                langIds.push(45);
                break;
            }
            case " Shona tili ": {
                langIds.push(127);
                break;
            }
            case " Madur tili ": {
                langIds.push(27);
                break;
            }
            case " Sinhal tili ": {
                langIds.push(95);
                break;
            }
            case " Marvari tili ": {
                langIds.push(111);
                break;
            }
            case " Magaxi tili ": {
                langIds.push(111);
                break;
            }
            case " Xaryanvi tili ": {
                langIds.push(11);
                break;
            }
            case " Grek tili ": {
                langIds.push(23);
                break;
            }
            case " Chex tili ": {
                langIds.push(18);
                break;
            }
            case " Chattisgarhi tili ": {
                langIds.push(111);
                break;
            }
            case " Fula tili ": {
                langIds.push(133);
                break;
            }
            case " Malagasiya tili ": {
                langIds.push(65);
                break;
            }
            case " Belorus tili ": {
                langIds.push(12);
                break;
            }
        }
    }

    return langIds

}