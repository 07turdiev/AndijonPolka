# Sertifikat Generatsiya Tizimi - Mustaqil Versiya

Bu papka boshqa saytda ishlatish uchun tayyorlangan mustaqil sertifikat generatsiya modulini o'z ichiga oladi.

## 📁 Fayllar

1. **generateBadge.js** - Asosiy PDF generatsiya funksiyasi
2. **qrcode.js** - QR kod generatsiya funksiyasi
3. **package.json** - Kerakli paketlar ro'yxati

## 🚀 O'rnatish

```bash
cd standalone
npm install
```

## 📦 Kerakli Paketlar

- `puppeteer` - PDF generatsiya uchun
- `ejs` - Template engine
- `qrcode` - QR kod generatsiya

## 💻 Ishlatish

### 1. Asosiy Ishlatish

```javascript
const { generateBadge } = require('./generateBadge');

// Sertifikat ma'lumotlari
const certificateData = {
    reg_num: "12345",
    sur_name: "Familiya",
    first_name: "Ism",
    given_date: new Date('2025-01-15'),
    category: "akt",
    user: {
        data_token: "unique-token-123"
    }
};

// Template yo'li (ixtiyoriy)
const templatePath = './templates/certificate-template.ejs';

// PDF generatsiya
const result = await generateBadge(certificateData, templatePath);

if (!result.err && result.code) {
    // PDF buffer result.code da
    // Uni faylga yozish:
    const fs = require('fs');
    fs.writeFileSync('certificate.pdf', result.code);
    
    // Yoki Express response sifatida:
    // res.setHeader('Content-Type', 'application/pdf');
    // res.send(result.code);
} else {
    console.error('Xatolik:', result.err);
}
```

### 2. Express.js Endpoint Misoli

```javascript
const express = require('express');
const { generateBadge } = require('./standalone/generateBadge');

const app = express();

app.get('/certificate/:id', async (req, res) => {
    try {
        // Ma'lumotlar bazasidan sertifikat olish
        const certificate = await getCertificateFromDB(req.params.id);
        
        // PDF generatsiya
        const result = await generateBadge(certificate);
        
        if (!result.err && result.code) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
            return res.send(result.code);
        } else {
            return res.status(500).json({ error: result.err.message });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.listen(3000);
```

## ⚙️ Konfiguratsiya

### QR Kod URL

QR kod URL manzilini 3 usul bilan belgilash mumkin:

1. **Environment variable:**
```bash
export QRCODE_ADDRESS="https://yoursite.com/verify/"
```

2. **qrcode.js faylida to'g'ridan-to'g'ri:**
```javascript
const QRCODE_ADDRESS = 'https://yoursite.com/verify/';
```

3. **generateQRCode funksiyasiga parametr sifatida:**
```javascript
const qr_code = await generateQRCode(data.user.data_token, 'https://yoursite.com/verify/');
```

### Template Yo'li

Template fayl yo'li 2 usul bilan belgilanishi mumkin:

1. **Default:** `templates/certificate-template.ejs` (standalone papkasidan)
2. **Parametr sifatida:** `generateBadge(data, './custom/path/template.ejs')`

## 📋 Template Talablari

Template fayl quyidagi parametrlarni qabul qilishi kerak:

- `id` - Sertifikat raqami (reg_num)
- `guide_type` - Kategoriya
- `fullName` - To'liq ism (sur_name + first_name)
- `data` - Barcha ma'lumotlar
- `qr_code` - QR kod (base64 formatida)
- `date` - Sana

## 🔧 Server Talablari

- **Puppeteer** uchun Chrome/Chromium o'rnatilgan bo'lishi kerak
- Linux serverda: `apt-get install -y chromium-browser` yoki `yum install chromium`

## 📝 Eslatmalar

1. Template fayl (`certificate-template.ejs`) ni `templates/` papkasiga qo'yish kerak
2. QR kod URL manzilini o'z saytingizga moslashtirish kerak
3. PDF o'lchamlari: 1920px x 1328px (generateBadge.js faylida o'zgartirish mumkin)

## 🐛 Xatoliklarni Tuzatish

Agar xatolik bo'lsa:
- Puppeteer o'rnatilganligini tekshiring
- Template yo'li to'g'riligini tekshiring
- QR kod URL manzilini tekshiring
- Console'da xatolik xabarlarini ko'ring

