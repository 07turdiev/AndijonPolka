const qrcode = require('qrcode');
const { QRCODE_ADDRESS } = require("../modules/config");

async function generateQRCode(employee_id) {
  try {
    const qrcode_url = QRCODE_ADDRESS + employee_id;
    const qrCode = await qrcode.toDataURL(qrcode_url, {
      color: {
        dark: '#000000',  // QR code foreground color
        light: '#0000'    // Transparent background
      }
    });
    const qrCodeImage = qrCode.split(',')[1];
    return qrCodeImage;
  } catch (err) {
    console.error(err);
  }
}

module.exports = generateQRCode;
