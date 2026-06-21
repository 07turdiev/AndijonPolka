/**
 * Sertifikat Generatsiya - Misol Ishlatish
 * 
 * Bu fayl qanday ishlatishni ko'rsatadi
 */

const { generateBadge } = require('./generateBadge');
const fs = require('fs');
const path = require('path');

async function example() {
    try {
        // 1. Sertifikat ma'lumotlarini tayyorlash
        const certificateData = {
            reg_num: "15781",                    // Sertifikat raqami
            sur_name: "Familiya",                // Familiya
            first_name: "Ism",                   // Ism
            middle_name: "Otasining ismi",       // Otasining ismi (ixtiyoriy)
            given_date: new Date('2025-01-15'),  // Berilgan sana
            category: "akt",                     // Kategoriya
            user: {
                data_token: "unique-token-12345" // QR kod uchun token
            }
        };

        // 2. Template yo'li (agar default yo'ldan boshqa bo'lsa)
        const templatePath = path.join(__dirname, '../templates/certificate-template.ejs');
        
        // 3. PDF generatsiya qilish
        console.log('PDF generatsiya qilinmoqda...');
        const result = await generateBadge(certificateData, templatePath);

        // 4. Natijani tekshirish va saqlash
        if (!result.err && result.code) {
            // PDFni faylga yozish
            const outputPath = path.join(__dirname, 'output-certificate.pdf');
            fs.writeFileSync(outputPath, result.code);
            console.log('✅ Sertifikat muvaffaqiyatli yaratildi:', outputPath);
        } else {
            console.error('❌ Xatolik:', result.err);
        }
    } catch (error) {
        console.error('❌ Umumiy xatolik:', error);
    }
}

// Funksiyani chaqirish
if (require.main === module) {
    example();
}

module.exports = { example };

