# Serverga o'rnatish (Ubuntu 22.04)

Barcha buyruqlar serverда (`markaz@markaz`) bajariladi. Loyiha `~/AndijonPolka` da.
Arxitektura: **nginx** (80) → sayt (statik) + admin (`/admin/`, statik) + `/api/` → **Node backend** (5000) → **PostgreSQL**.
Frontendlar nisbiy `/api/...` yo'lini ishlatadi — shuning uchun domen/IP o'zgarsa ham qayta build shart emas.

---

## 0. Kerakli dasturlar (bir marta)

```bash
# Node.js 20 (agar yo'q bo'lsa)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v        # v20.x bo'lishi kerak

# pm2 (backendni doimiy ishlatish uchun)
sudo npm install -g pm2
```

## 1. PostgreSQL bazasi (bir marta)

```bash
sudo -u postgres psql -c "CREATE USER andijonpolka WITH PASSWORD 'KUCHLI_PAROL';"
sudo -u postgres psql -c "CREATE DATABASE andijonpolka_db OWNER andijonpolka;"
```

## 2. Backend

```bash
cd ~/AndijonPolka/certificate_backend
npm install --omit=dev
```

`.env` faylini yarating (git'ga tushmaydi — qo'lda yoziladi):

```bash
nano .env
```

Ichiga (qiymatlarni o'zingizникiga moslang):

```
PORT=5000
DATABASE_URL=postgres://andijonpolka:KUCHLI_PAROL@localhost:5432/andijonpolka_db
TOKEN_KEY=uzun_maxfiy_kalit_2026
HASHNUMBER=10
ADMIN_LOGIN=admin
ADMIN_PASSWORD=KUCHLI_ADMIN_PAROL

# Pasport API (itg.madaniyat.uz)
PASSPORT_MOCK=false
PASSPORT_API_URL=https://itg.madaniyat.uz/api/web/MV/PersonGetByPassportData
# DIQQAT: parolда # yoki maxsus belgi bo'lsa — qo'shtirnoq ichida yozing!
PASSPORT_API_LOGIN="@madaniyat$login"
PASSPORT_API_PASSWORD="#parol..."
```

Ishga tushiring:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # chiqgan buyruqni nusxalab bajaring (server qayta yuklanganда avto-start)
pm2 logs andijon-polka-api --lines 30   # "server ready on 5000" + "real rejim ulandi" ko'rinsin
```

Birinchi ishga tushirishда jadvallar, viloyat/tuman va default admin avtomatik yaratiladi.

## 3. Ishtirokchi sayti (build)

```bash
cd ~/AndijonPolka/certificate_site
npm install
npm run build      # dist/ yaratiladi (nisbiy /api/site yo'li bilan)
```

## 4. Admin panel (build)

```bash
cd ~/AndijonPolka/admin-cert-frontend
npm install
npm run build      # dist/ yaratiladi, /admin/ ostida ishlaydi
```

## 5. nginx

```bash
sudo cp ~/AndijonPolka/deploy/nginx-andijonpolka.conf /etc/nginx/sites-available/polka.madaniyhayot.uz
sudo nano /etc/nginx/sites-available/polka.madaniyhayot.uz   # server_name ni o'z subdomeningizga moslang
sudo ln -s /etc/nginx/sites-available/polka.madaniyhayot.uz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Tekshirish:
- Sayt:  `https://polka.madaniyhayot.uz/`
- Admin: `https://polka.madaniyhayot.uz/admin/`  (login: `.env` dagi ADMIN_LOGIN / ADMIN_PASSWORD)
- API:   `https://polka.madaniyhayot.uz/api/site/count`  → `{"success":true,...}`

## 6. HTTPS / Load balancer

Bu serverда SSL kerak emas — **HTTPS load balancer'da tugaydi** (mavjud saytlardagidek).
nginx 80-portда HTTP qabul qiladi, config'da `X-Forwarded-Proto https` qattiq qo'yilgan.

Qilish kerak: load balancer (va DNS) da **`polka.madaniyhayot.uz`** subdomenini shu serverga
(`192.168.100.11`, 80-port) yo'naltiring — boshqa `*.madaniyhayot.uz` saytlaridagi kabi.

---

## Yangilash (kod o'zgarganда)

```bash
cd ~/AndijonPolka
git pull

# backend o'zgargan bo'lsa:
cd certificate_backend && npm install --omit=dev && pm2 restart andijon-polka-api

# sayt o'zgargan bo'lsa:
cd ~/AndijonPolka/certificate_site && npm install && npm run build

# admin o'zgargan bo'lsa:
cd ~/AndijonPolka/admin-cert-frontend && npm install && npm run build
```

Frontend qayta build qilingach nginx'ni qayta yuklash shart emas (statik fayllar yangilanadi).

## Foydali buyruqlar

```bash
pm2 status                       # backend holati
pm2 logs andijon-polka-api       # backend loglari
pm2 restart andijon-polka-api    # qayta ishga tushirish
sudo tail -f /var/log/nginx/error.log
```

## Eslatmalar
- 5000-port faqat ichki (nginx orqali) ishlatiladi — tashqi firewall'da yopiq qoldiring.
- Backend `.env` va maxfiy login/parol git'ga tushmaydi (`.gitignore`).
- Fotosuratlar `certificate_backend/public/photos/` ga saqlanadi va `/api/cdn/photos/...` orqali beriladi.
