const qrcode = require('qrcode');

/**
 * QR kod generatsiya qilish funksiyasi
 * @param {string} employee_id - QR kod uchun ID yoki token
 * @param {string} qrcodeBaseUrl - QR kod URL manzili (ixtiyoriy)
 * @returns {Promise<string>} Base64 formatidagi QR kod rasm
 */
async function generateQRCode(employee_id, qrcodeBaseUrl = null) {
    try {
        // Agar base URL berilmasa, environment variable'dan olinadi yoki default ishlatiladi
        const QRCODE_ADDRESS = qrcodeBaseUrl || process.env.QRCODE_ADDRESS || 'https://example.com/verify/';
        
        const qrcode_url = QRCODE_ADDRESS + employee_id;
        
        // QR kod yaratish
        const qrCode = await qrcode.toDataURL(qrcode_url, {
            color: {
                dark: '#000000',  // QR kod foreground rangi
                light: '#0000'    // Shaffof background
            },
            errorCorrectionLevel: 'H', // Yuqori xatolik tuzatish
            margin: 1
        });
        
        // Base64 stringdan faqat rasm qismini olish (data:image/png;base64, qismini olib tashlash)
        const qrCodeImage = qrCode.split(',')[1];
        
        return qrCodeImage;
    } catch (err) {
        console.error('QR Code Generation Error:', err);
        return null;
    }
}

module.exports = generateQRCode;

