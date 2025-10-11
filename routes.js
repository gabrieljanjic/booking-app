const express = require('express');
const router = express.Router();
const controller = require('./controller');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const loginLimiter = rateLimit({
  windowsMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'fail',
    message: 'Previše pokušaja prijave pokušajte ponovo za 15 minuta',
  },
});

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  console.log('Token:', token);
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You have to login or register',
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Morate biti prijavljeni za rezervaciju',
      });
    }
    req.user = decoded;
    next();
  });
}

function optionalAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

router.get('/verify-token', authenticateToken, controller.verifyToken);
router.post('/login', loginLimiter, controller.loginUser);
router.post('/logout', controller.logout);
router.post('/create-user', controller.createUser);
router.post('/create-hotel', authenticateToken, controller.createHotel);
router.get('/get-all-hotels', controller.getAllHotels);
router.get('/get-exact-post/:id', optionalAuth, controller.getExactPost);
router.get('/get-all-hotel-rezevations/:id', controller.getHotelReservations);
router.post('/set-rezervation', authenticateToken, controller.setRezervation);
router.delete('/delete-post/:id', authenticateToken, controller.deletePost);
//
router.get('/type-filter', controller.allFiltersHotel);
router.get('/search-hotel', controller.searchHotel);
//
router.get('/my-rezervations', authenticateToken, controller.getAllRezervations);
router.get('/get-exact-rezervation/:id', controller.getExactRezervation);
router.delete('/delete-rezervation/:id', authenticateToken, controller.deleteRezervation);
router.patch('/confirm-rezervation/:id', authenticateToken, controller.confirmRezervation);

router.get('/api/maps-config', (req, res) => {
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  });
});
module.exports = router;
