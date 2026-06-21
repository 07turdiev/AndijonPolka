# Boshqa Saytda Ishlatish Uchun Kerakli Fayllar

## ✅ Mutlaqo Kerakli Fayllar (3 ta)

### 1. **generateBadge.js** - Asosiy Generatsiya Funksiyasi
Fayl joylashuvi: `helpers/generateBadge.js` yoki `utils/generateBadge.js`

### 2. **qrcode.js** - QR Kod Generatsiya
Fayl joylashuvi: `helpers/qrcode.js` yoki `utils/qrcode.js`

### 3. **certificate-template.ejs** - Sertifikat Template
Fayl joylashuvi: `templates/certificate-template.ejs` yoki `views/certificate-template.ejs`

---

## 📦 Kerakli NPM Paketlar

```bash
npm install puppeteer ejs qrcode
```

---

## 📁 Fayl Strukturasi (Boshqa Saytda)

```
your-project/
├── helpers/
│   ├── generateBadge.js
│   └── qrcode.js
├── templates/
│   └── certificate-template.ejs
└── package.json
```

---

## ⚙️ Qanday Ishlatish

### 1. Endpoint yaratish (Express misolida):

```javascript
const express = require('express');
const { generateBadge } = require('./helpers/generateBadge');

const app = express();

app.get('/certificate/:id', async (req, res) => {
    try {
        // Sertifikat ma'lumotlarini olish (sizning DB yoki API'dan)
        const certificateData = {
            reg_num: "12345",
            sur_name: "Familiya",
            first_name: "Ism",
            given_date: new Date(),
            category: "akt",
            user: {
                data_token: "token123" // QR kod uchun
            }
        };

        // PDF generatsiya
        const result = await generateBadge(certificateData);
        
        if (!result.err && result.code) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');
            return res.send(result.code);
        } else {
            return res.status(500).json({ error: result.err });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.listen(3000);
```

---

## 🔧 Muhim Eslatmalar

1. **Puppeteer:** Serverda Chrome/Chromium o'rnatilgan bo'lishi kerak
2. **Template yo'li:** `generateBadge.js` faylida template yo'li to'g'ri ko'rsatilgan bo'lishi kerak
3. **QR Kod URL:** `qrcode.js` faylida QR kod URL manzili to'g'ri belgilangan bo'lishi kerak

---

## 📝 Keyingi Qadamlar

1. Yuqoridagi 3 ta faylni nusxalash
2. NPM paketlarini o'rnatish
3. Template yo'llarini to'g'rilash
4. QR kod URL manzilini sozlash
5. Test qilish

