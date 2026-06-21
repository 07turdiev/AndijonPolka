# Tezkor Boshlash Qo'llanmasi

## ✅ Kerakli Fayllar (3 ta)

Boshqa saytda ishlatish uchun quyidagi fayllar kerak:

### 1. `generateBadge.js`
**Joylashuvi:** `standalone/generateBadge.js`  
**Vazifasi:** PDF generatsiya qilish

### 2. `qrcode.js`
**Joylashuvi:** `standalone/qrcode.js`  
**Vazifasi:** QR kod yaratish

### 3. `certificate-template.ejs`
**Joylashuvi:** `public/index.ejs` (asl fayl)  
**Vazifasi:** Sertifikat dizayni

---

## 📋 Qadam-baqadam Ko'rsatma

### 1-qadam: Fayllarni Nusxalash

Boshqa loyihangizga quyidagi fayllarni ko'chiring:

```
your-project/
├── helpers/
│   ├── generateBadge.js    ← standalone/generateBadge.js dan
│   └── qrcode.js           ← standalone/qrcode.js dan
└── templates/
    └── certificate-template.ejs  ← public/index.ejs dan
```

### 2-qadam: Paketlarni O'rnatish

```bash
npm install puppeteer ejs qrcode
```

### 3-qadam: Template Yo'lini To'g'rilash

`generateBadge.js` faylida template yo'li:

```javascript
// 11-qatorda o'zgartiring:
const defaultTemplatePath = path.join(__dirname, "../templates/certificate-template.ejs");
```

Yoki funksiyani chaqirganda yo'lni ko'rsating:

```javascript
const result = await generateBadge(data, './templates/certificate-template.ejs');
```

### 4-qadam: QR Kod URL Manzilini Sozlash

`.env` faylga qo'shing:

```env
QRCODE_ADDRESS=https://yoursite.com/verify/
```

Yoki `qrcode.js` faylida to'g'ridan-to'g'ri:

```javascript
const QRCODE_ADDRESS = 'https://yoursite.com/verify/';
```

### 5-qadam: Ishlatish

```javascript
const { generateBadge } = require('./helpers/generateBadge');

const data = {
    reg_num: "12345",
    sur_name: "Familiya",
    first_name: "Ism",
    given_date: new Date(),
    category: "akt",
    user: {
        data_token: "token123"
    }
};

const result = await generateBadge(data);
if (!result.err) {
    // result.code - PDF buffer
    res.send(result.code);
}
```

---

## 📝 Minimal Kod Misoli

```javascript
// server.js
const express = require('express');
const { generateBadge } = require('./helpers/generateBadge');

const app = express();

app.get('/certificate/:id', async (req, res) => {
    // 1. Ma'lumotlarni olish (DB dan yoki API dan)
    const certificateData = {
        reg_num: "12345",
        sur_name: "Familiya",
        first_name: "Ism",
        given_date: new Date(),
        category: "akt",
        user: { data_token: "token123" }
    };

    // 2. PDF generatsiya
    const result = await generateBadge(certificateData);

    // 3. Javob yuborish
    if (!result.err && result.code) {
        res.setHeader('Content-Type', 'application/pdf');
        res.send(result.code);
    } else {
        res.status(500).json({ error: result.err.message });
    }
});

app.listen(3000);
```

---

## ⚠️ Muhim Eslatmalar

1. **Puppeteer:** Serverda Chrome o'rnatilgan bo'lishi kerak
2. **Template:** `public/index.ejs` faylini `templates/certificate-template.ejs` sifatida nusxalash kerak
3. **Yo'llar:** Barcha fayl yo'llari to'g'ri ko'rsatilgan bo'lishi kerak

---

## 🎯 Xulosa

**Kerakli fayllar:**
- ✅ `generateBadge.js`
- ✅ `qrcode.js`  
- ✅ `certificate-template.ejs` (asl fayl: `public/index.ejs`)

**Kerakli paketlar:**
- ✅ `puppeteer`
- ✅ `ejs`
- ✅ `qrcode`

Shunchaki bu 3 faylni nusxalab, paketlarni o'rnatib, ishlatishingiz mumkin!

