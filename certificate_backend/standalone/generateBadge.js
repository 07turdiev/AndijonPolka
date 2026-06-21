const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const path = require("path");
const generateQRCode = require("./qrcode");

/**
 * Sertifikat PDF generatsiya qilish funksiyasi
 * @param {Object} data - Sertifikat ma'lumotlari
 * @param {string} data.reg_num - Sertifikat raqami
 * @param {string} data.sur_name - Familiya
 * @param {string} data.first_name - Ism
 * @param {Date} data.given_date - Berilgan sana
 * @param {string} data.category - Kategoriya
 * @param {Object} data.user - User ma'lumotlari
 * @param {string} data.user.data_token - QR kod uchun token
 * @param {string} templatePath - Template fayl yo'li (ixtiyoriy)
 * @returns {Promise<{err: null|Error, code: Buffer|null}>}
 */
module.exports.generateBadge = async (data, templatePath = null) => {
    try {
        // Template yo'li - agar berilmasa, default yo'ldan olinadi
        const defaultTemplatePath = path.join(__dirname, "../templates/certificate-template.ejs");
        const templateFilePath = templatePath || defaultTemplatePath;
        
        // Template faylini o'qish
        const template = fs.readFileSync(templateFilePath, 'utf-8');
        
        // EJS template'ni compile qilish
        const compiledTemplate = ejs.compile(template);
        
        // QR kod generatsiya qilish
        const qr_code = await generateQRCode(data.user?.data_token);
        
        let guide_type = data.category || "akt";
        
        // HTML generatsiya qilish
        const html = compiledTemplate({
            id: data.reg_num,
            guide_type: guide_type,
            fullName: data.sur_name + " " + data.first_name,
            data: data,
            qr_code: qr_code,
            date: data.given_date
        });
        
        // Puppeteer browser'ni ishga tushirish
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Server uchun
        });
        
        const page = await browser.newPage();
        
        // HTML kontentni sahifaga yuklash
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        // PDF generatsiya qilish
        const bufferCode = await page.pdf({ 
            width: '1920px', 
            height: '1328px',
            return: "buffer" 
        });
        
        await browser.close();
        
        return { err: null, code: bufferCode };
    } catch (err) {
        console.log('GenerateBadge Error:', err);
        return { err: err, code: null };
    }
};

