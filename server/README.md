# Realestate Server

Run the express + mongoose server for managing listings.

Install:

```
cd server
npm install
```

Create `.env` with:

```
MONGO_URI=mongodb://127.0.0.1:27017/realestate
PORT=5000
```

Run:

```
npm run dev
```

API endpoints (CRUD):
- GET `/api/listings`
- GET `/api/listings/:id`
- POST `/api/listings`
- PUT `/api/listings/:id`
- DELETE `/api/listings/:id`
