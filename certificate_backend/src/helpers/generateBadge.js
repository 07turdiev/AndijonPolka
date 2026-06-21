const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const path = require("path")
const generateQRCode = require("./qrcode")


module.exports.generateBadge = async (data) => {
    try{
    // Read the EJS template file
    const template = fs.readFileSync(path.join(__dirname,"../../","public","index.ejs"), 'utf-8');
    // Compile the EJS template
    const compiledTemplate = ejs.compile(template);
    const qr_code = await generateQRCode(data.user?.data_token)

    let guide_type = data.category
   // let category = getGuideCategories(data.category)

    // Generate HTML from the compiled template
    const html = compiledTemplate({id:data.reg_num,guide_type,fullName:data.sur_name+" "+data.first_name,data,qr_code, date:data.given_date});

    // Launch Puppeteer and create a new page
    const browser = await puppeteer.launch({  headless: 'new'});
    const page = await browser.newPage();
    // Set the HTML content of the page
    await page.setContent(html, {waitUntil: 'networkidle0'  });
    
    // Generate PDF
    // await page.pdf({path:path.join(__dirname,"../../","public","last422.pdf"),width: '1920px',
    //     height: '1328px'})
     const bufferCode =  await page.pdf({ width: '1920px', height: '1328px',return:"buffer" });
    await browser.close();
    return {err:null,code:bufferCode}
    }catch(err){
        console.log(err)
        return {err:err,code:null}
    }
}


