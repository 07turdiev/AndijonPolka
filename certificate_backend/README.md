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
| POST | `/search` | Qidirish — `{ pinfl?, document?, birth_date }` → ma'lumot + foto |
| POST | `/register` | Ro'yxatdan o'tish — `{ pinfl?, document?, birth_date, phone_number?, region_id?, district_id? }` |

`POST /search` va `/register` majburiy maydonlari: `pinfl` (14 raqam) + `birth_date` (YYYY-MM-DD).
Javobda `is_minor` — qatnashuvchi 18 yoshgacha bo'lsa `true`.
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

## Real API'larga ulash
Ikkita provayder alohida fayllarda:
- `src/helpers/providers/adultApi.js` — kattalar API
- `src/helpers/providers/minorApi.js` — 18 yoshgacha bolalar API

`.env` da `PASSPORT_MOCK=false` qiling va `ADULT_API_URL`/`ADULT_API_TOKEN`,
`MINOR_API_URL`/`MINOR_API_TOKEN` ni to'ldiring. So'rov tanasi/sarlavhasi va javobni
o'girish (`normalize`) real API shartnomasiga moslab tegishli provayder faylida
to'g'rilanadi. Qolgan kod (controller, yo'naltirish, saqlash) o'zgarmaydi.
