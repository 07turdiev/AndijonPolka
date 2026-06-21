# Admin Certificate Dashboard

A Vue.js admin dashboard for managing user certificates and applications.

## Features

- **Admin Authentication**: Secure login for administrators
- **Certified Users**: View and manage users with certificates
- **Applications**: Process new applications and change their status
- **Certificate Generation**: Create new certificates for approved applications
- **Certificate Download**: Generate and download certificates

## Project Structure

- `src/views`: Main application views
  - `Login.vue`: Admin login page
  - `Dashboard.vue`: Main dashboard with sidebar
  - `Applications.vue`: Applications management view
  - `CertifiedUsers.vue`: Certificate users management view
- `src/store`: Vuex store for state management
- `src/router`: Vue Router configuration

## Frontend Setup

```bash
# Install dependencies
npm install

# Compiles and hot-reloads for development
npm run serve

# Compiles and minifies for production
npm run build
```

## Mock Backend Server

The project includes a simple Python mock server that imitates the backend API.

### Setup Mock Server

```bash
# Install required Python packages
pip install -r requirements.txt

# Run the mock server
python mock_server.py
```

The mock server will run on http://localhost:5000 and provides the following endpoints:

- POST `/api/admin/login` - Admin authentication
- GET `/api/site/volunteers` - Get certified users
- GET `/api/admin/applications` - Get applications
- PUT `/api/admin/applications/{id}` - Change application status
- PUT `/api/admin/applications/certificate/{id}` - Create a certificate

### Test User

- Email: admin@gmail.com
- Password: 123456

## API Configuration

Update the base URL in `src/store/index.js` to point to the mock server:

```javascript
state: {
  baseUrl: 'http://localhost:5000', // Point to the mock server
  // ...
}
```

## Technology Stack

- Vue.js 3
- Vuex 4
- Vue Router 4
- PrimeVue (UI Components)
- Axios (HTTP Client)
- Flask (Mock Backend Server) 