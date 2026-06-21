const nodemailer = require("nodemailer")
const {SENDER_USER,APP_PASSWORD} = require("../modules/config")


const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: SENDER_USER,
        pass: APP_PASSWORD
    }
});

module.exports.sendToEmail = async(application,address) =>{

     const day = address.exam_date.getDate()
     const month = address.exam_date.getMonth() + 1
     const year = address.exam_date.getFullYear()
     const hour = address.exam_date.getHours()
     const minute = address.exam_date.getMinutes();
     
    let emailContent = `
     <p>Imtihon bo'lib o'tadigan manzil ${address.address}</p>
     <p> Imtihon bo'ladigan sana ${day}-${month}-${year} </p>
     <p> Imtihon bo'ladigan vaqt ${hour}:${minute} </p>
     <p> Quyida imtihon manziliga bo'lgan link keltirilgan </p>
     <a href="https://www.google.com/maps?q=${address.lat},${address.long}" target="_blank">Google mapda ochish</a>`

    const mailOptions = {
        from: SENDER_USER,
        subject:"Imthihon sanasi va manzili",
        to:application.email,
        html:emailContent,
    }

    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
        }
    })
}