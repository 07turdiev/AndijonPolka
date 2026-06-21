# Andijon Polka — Backend

Andijon polkasi tadbirida qatnashuvchilarni ro'yxatga olish tizimi backendi.
Qatnashuvchi **JSHSHIR + tug'ilgan sana** kiritadi → tizim yoshга qarab to'g'ri
pasport API'ni tanlaydi (kattalar API yoki 18 yoshgacha bolalar API), ma'lumot va
fotoni oladi → qatnashuvchi tasdiqlab ro'yxatdan o'tadi.

Yoshни avtomatik aniqlash: tug'ilgan sanadan yosh hisoblanadi; `MINOR_AGE` (default 18)
dan kichik bo'lsa — bolalar API'siga, aks holda kattalar API'siga yo'naltiriladi.

## Texnologiya
Node.js + Express + PostgreSQL (Sequelize). Kalitlar kelguncha GSP API **mock rejimda** ishlaydi.

## Ishga tushirish
```bash
npm install
cp .env.example .env   # va .env ni to'ldiring (DATABASE_URL paroli)
# PostgreSQL'da baza yarating:  CREATE DATABASE andijon_polka;
npm run dev
```
Birinchi ishga tushirishda jadvallar avtomatik yaratiladi, viloyat/tuman spravochniklari va
default admin (`.env` dagi `ADMIN_LOGIN`/`ADMIN_PASSWORD`) seed qilinadi.

## API

### Public — `/api/site`
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/regions` | Viloyatlar ro'yxati |
| GET | `/districts?region_id=17` | Tumanlar (viloyat bo'yicha) |
| GET | `/count` | Ro'yxatdan o'tganlar soni |
| POST | `/search` | Qidirish — `{ documentTypeId, pinfl?, seria?, number?, birth_date }` → ma'lumot + foto |
| POST | `/register` | Ro'yxatdan o'tish — yuqoridagi + `{ phone_number?, region_id?, district_id? }` |

`documentTypeId` = 7 bo'lsa `pinfl` (14 raqam) majburiy; aks holda `seria` + `number`.
`birth_date` (YYYY-MM-DD) doim majburiy. Javobda `is_minor` — 18 yoshgacha bo'lsa `true`.
Ro'yxatdan o'tishda ma'lumot xavfsizlik uchun **serverda qaytadan API'dan tekshiriladi**
(mijozdan kelgan shaxsiy ma'lumotga ishonilmaydi).

### Admin — `/api/admin` (token: `Authorization` header)
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/login` | `{ login, password }` → `{ token }` |
| GET | `/me` | Joriy admin |
| GET | `/participants?searchWord&region_id&district_id&start_date&end_date&offset&limit` | Ro'yxat |
| GET | `/participants/stats` | `{ total, today }` |
| GET | `/participants/export` | CSV (Excel) yuklab olish |
| DELETE | `/participants/:id` | O'chirish |

Fotosuratlar `public/photos/` ga saqlanadi, `/api/cdn/photos/<pinfl>.jpg` orqali ochiladi.

## Pasport API (itg.madaniyat.uz)
Bitta API — `POST /api/web/MV/PersonGetByPassportData` (provayder:
`src/helpers/providers/passportApi.js`). `.env`:
```
PASSPORT_MOCK=false
PASSPORT_API_URL=https://itg.madaniyat.uz/api/web/MV/PersonGetByPassportData
PASSPORT_API_AUTH=Basic <token>
```
`PASSPORT_MOCK=true` bo'lsa — test ma'lumotlari (real API chaqirilmaydi).

**Hujjat turlari (documentTypeId):** 7 = Pasport (PINFL) — `pinfl` orqali; 6 = ID-karta,
2 = Guvohnoma, 3 = Fuqarolik pasporti — `seria` + `number` orqali. Barchasi
`birth_date` (YYYY-MM-DD) bilan. Topilmasa API HTTP 400 + `persoN_NOT_FOUND` qaytaradi.

So'rov: `{ seria, number, dateOfBirth, documentTypeId, pinfl, includePhoto }`.
Javob: yassi obyekt (`firstName/lastName/middleName/pinfl/docSeria/docNumber/genderId/
nationality/citizenship/birthOn/photo`) → `mapPerson()` orqali ichki formatga o'giriladi.
`is_minor` belgisi faqat ko'rsatish uchun tug'ilgan sanadan hisoblanadi.
