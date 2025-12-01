# Booking App

A full-stack hotel booking application built with **Node.js**, **Express**, **MongoDB**, and a frontend using **HTML/CSS/JS/BOOTSTRAP**.  
Users can register, login, browse hotels, make reservations, and manage their bookings.

##  Live Demo
🔗 [Booking App Live](https://booking-app-bmps.onrender.com/)

> ⚠️**Note:** Backend may take 30–50 seconds to wake up on the first request (free Render tier limitation).

---

## Features

- **User Authentication**
  - Register, login, and logout
  - Password hashing and JWT-based authentication
- **Hotels**
  - Create, read, delete hotel entries (admin or user who created it)
  - Search hotels by destination
  - Filter hotels by type, price, and benefits
- **Reservations**
  - Make reservations for hotels
  - View all personal reservations
  - Confirm or cancel reservations
- **Geolocation**
  - Automatic geocoding of hotel addresses using Google Maps API
- **Secure cookies**
  - JWT tokens stored in `httpOnly` cookies

---

## Technologies Used

- **Backend:** Node.js, Express, Mongoose (MongoDB), JWT, cookie-parser
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MongoDB Atlas
- **APIs:** Google Maps Geocoding API
- **Dev Tools:** Nodemon
