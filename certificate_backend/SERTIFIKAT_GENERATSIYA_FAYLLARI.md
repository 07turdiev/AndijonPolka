# Sertifikat Generatsiya Qilishda Qatnashadigan Fayllar

Bu hujjatda sertifikat generatsiya qilishda qatnashadigan barcha fayllar va ularning vazifalari tushuntirilgan.

## Asosiy Fayllar

### 1. **src/helpers/generateBadge.js** - Asosiy Generatsiya Funksiyasi
Bu fayl sertifikatni PDF formatida generatsiya qilish uchun asosiy funksiyani o'z ichiga oladi.

**Vazifasi:**
- EJS template faylini o'qish
- QR kod generatsiya qilish
- Puppeteer orqali HTMLni PDFga aylantirish
- PDF buffer qaytarish

**Qo'llaniladigan kutubxonalar:**
- `puppeteer` - PDF generatsiya qilish uchun
- `ejs` - Template engine
- `fs` - Fayl tizimi operatsiyalari
- `path` - Fayl yo'llari bilan ishlash

**Template fayli:** `public/index.ejs`

### 2. **public/index.ejs** - Sertifikat Template
Bu fayl sertifikatning vizual ko'rinishini belgilaydi.

**Vazifasi:**
- Sertifikat dizayni
- CSS stillar
- Ma'lumotlarni ko'rsatish (ism, sana, raqam, va boshqalar)
- QR kodni ko'rsatish

**Parametrlar:**
- `id` - Sertifikat raqami (reg_num)
- `guide_type` - Kategoriya
- `fullName` - To'liq ism
- `data` - Barcha ma'lumotlar
- `qr_code` - QR kod (base64 formatida)
- `date` - Sana

### 3. **src/helpers/qrcode.js** - QR Kod Generatsiya
Bu fayl QR kod generatsiya qilish uchun.

**Vazifasi:**
- QR kod yaratish
- Base64 formatida qaytarish
- QR kod URL: `QRCODE_ADDRESS + employee_id`

**Qo'llaniladigan kutubxona:**
- `qrcode` - QR kod generatsiya qilish

### 4. **src/controllers/website/applications.js** - Controller
Bu fayl sertifikat yuklab olish endpoint'ini boshqaradi.

**Funksiya:** `getDownloadCertificate`
- Sertifikatni ma'lumotlar bazasidan olish
- `generateBadge` funksiyasini chaqirish
- PDFni javob sifatida yuborish

**Route:** `GET /download/:id`

### 5. **src/routes/routeWebsite.js** - Route Konfiguratsiyasi
Bu fayl route'larni sozlaydi.

**Route:**
```javascript
Router.get("/download/:id", getDownloadCertificate)
```

### 6. **src/helpers/application.js** - Application Helper
Bu fayl sertifikat yaratish logikasini o'z ichiga oladi.

**Funksiyalar:**
- `createCertificate` - Sertifikat yaratish
- `translator` - Arizani yaratish
- `checkActiveApplication` - Faol arizani tekshirish

### 7. **src/models/certificate.js** - Database Model
Bu fayl sertifikat ma'lumotlar bazasi modelini belgilaydi.

**Maydonlar:**
- `certificate_id` - Asosiy kalit
- `first_name`, `sur_name`, `middle_name` - Ism, familiya, otasining ismi
- `pin` - PINFL
- `given_date` - Berilgan sana
- `expr_date` - Tugash sanasi
- `reg_num` - Ro'yxat raqami
- `badge_img` - Rasm
- `organization_id`, `region_id`, `user_id` - Bog'lanishlar

### 8. **src/modules/config.js** - Konfiguratsiya
Bu fayl muhit o'zgaruvchilarini yuklaydi.

**Muhim o'zgaruvchilar:**
- `QRCODE_ADDRESS` - QR kod URL manzili

## Jarayon Oqimi

1. **Ariza Yaratish:**
   - `src/helpers/application.js` → `translator()` funksiyasi
   - Ma'lumotlar bazasiga ariza yoziladi

2. **Sertifikat Yaratish:**
   - `src/helpers/application.js` → `createCertificate()` funksiyasi
   - Ma'lumotlar bazasiga sertifikat yoziladi

3. **PDF Generatsiya:**
   - `src/controllers/website/applications.js` → `getDownloadCertificate()`
   - `src/helpers/generateBadge.js` → `generateBadge()`
   - `src/helpers/qrcode.js` → QR kod yaratiladi
   - `public/index.ejs` → HTML generatsiya qilinadi
   - Puppeteer orqali PDF yaratiladi

## Kerakli Kutubxonalar (package.json)

```json
{
  "puppeteer": "^20.5.0",    // PDF generatsiya
  "ejs": "^3.1.9",            // Template engine
  "qrcode": "^1.5.3",         // QR kod
  "sequelize": "^6.31.1",     // Database ORM
  "express": "^4.18.2",       // Web framework
  "pg": "^8.11.0"             // PostgreSQL driver
}
```

## Muhim Eslatmalar

1. **Puppeteer:** Headless browser kerak. Serverda Chrome/Chromium o'rnatilgan bo'lishi kerak.

2. **Template:** `public/index.ejs` fayli sertifikat dizaynini o'z ichiga oladi. Bu faylni o'zgartirish orqali sertifikat ko'rinishini o'zgartirish mumkin.

3. **QR Kod:** QR kod URL manzili `.env` faylida `QRCODE_ADDRESS` o'zgaruvchisida belgilanadi.

4. **PDF O'lchamlari:** 
   - Kenglik: 1920px
   - Balandlik: 1328px

5. **Ma'lumotlar Oqimi:**
   - Certificate model → generateBadge() → Template → PDF

## Boshqa Saytda Ishlatish Uchun

Boshqa saytda ishlatish uchun quyidagi fayllarni nusxalash kerak:

1. **src/helpers/generateBadge.js** - Asosiy generatsiya funksiyasi
2. **src/helpers/qrcode.js** - QR kod generatsiya
3. **public/index.ejs** - Template fayli (yoki o'z templatingizni yarating)
4. **package.json** - Kerakli kutubxonalarni o'rnatish

**Qadamlar:**
1. `npm install puppeteer ejs qrcode` - Kutubxonalarni o'rnatish
2. `generateBadge.js` funksiyasini nusxalash
3. Template faylini yaratish yoki mavjud `index.ejs`ni nusxalash
4. Funksiyani chaqirish: `await generateBadge(certificateData)`

## Misol Kod

```javascript
const { generateBadge } = require('./helpers/generateBadge');

// Sertifikat ma'lumotlari
const certificateData = {
    reg_num: "12345",
    sur_name: "Familiya",
    first_name: "Ism",
    given_date: new Date(),
    category: "akt",
    user: {
        data_token: "token123"
    }
};

// PDF generatsiya
const result = await generateBadge(certificateData);
if (!result.err && result.code) {
    // PDF buffer result.code da
    // Uni faylga yozish yoki response sifatida yuborish mumkin
}
```

## Fayl Strukturasi

```
certificate_backend/
├── src/
│   ├── helpers/
│   │   ├── generateBadge.js      # Asosiy generatsiya funksiyasi
│   │   ├── qrcode.js              # QR kod generatsiya
│   │   └── application.js         # Application helper
│   ├── controllers/
│   │   └── website/
│   │       └── applications.js    # Controller
│   ├── models/
│   │   └── certificate.js         # Database model
│   ├── routes/
│   │   └── routeWebsite.js        # Routes
│   └── modules/
│       └── config.js              # Konfiguratsiya
└── public/
    └── index.ejs                  # Template fayli
```

## Xulosa

Sertifikat generatsiya qilish uchun quyidagi fayllar muhim:
1. **generateBadge.js** - Asosiy funksiya
2. **index.ejs** - Template
3. **qrcode.js** - QR kod
4. **applications.js** - Controller (endpoint)
5. **certificate.js** - Database model

Bu fayllarni boshqa loyihada ishlatish uchun ularni nusxalab, kerakli kutubxonalarni o'rnatish kifoya qiladi.

