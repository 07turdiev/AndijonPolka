// pm2 process config for the backend API.
// Ishga tushirish:  pm2 start ecosystem.config.js  &&  pm2 save
module.exports = {
  apps: [
    {
      name: 'andijon-polka-api',
      cwd: __dirname,
      script: 'index.js',
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
        // Qolgan sozlamalar .env faylidan o'qiladi (dotenv)
      }
    }
  ]
}
