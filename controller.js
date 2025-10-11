const mongoose = require('mongoose');
const { User, Hotel, Rezervation } = require('./model');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.NUMBER_OF_DAYS });
};

exports.verifyToken = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Korisnik ne postoji',
      });
    }
    res.status(200).json({
      status: 'success',
      message: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'You must enter username and password',
      });
    }
    const user = await User.findOne({ username: username });

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(404).json({
        status: 'fail',
        message: 'Wrong username or password',
      });
    }
    const token = signToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: 'success',
      message: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

exports.createUser = async (req, res) => {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Morate unijeti korisničko ime i loziku!',
      });
    }
    const newUser = await User.create({
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,
      password: req.body.password,
    });
    const token = signToken(newUser._id);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      status: 'success',
      message: newUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Korisničko ime već postoji!',
      });
    }
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createHotel = async (req, res) => {
  try {
    console.log(req.user);
    if (
      !req.body.name ||
      !req.body.place ||
      !req.body.description ||
      !req.body.price ||
      !req.body.image ||
      !req.body.street
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Molimo unesite obavezna polja',
      });
    }
    const city = req.body.place;
    const street = req.body.street;
    const address = `${city}, ${street}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${
      process.env.GOOGLE_MAPS_API_KEY
    }`;

    const response = await fetch(url);

    const data = await response.json();
    if (data.status !== 'OK') {
      return res.status(404).json({
        status: 'fail',
        message: 'Adresa nije pronađena',
      });
    }
    const lat = data.results[0].geometry.location.lat;
    const lng = data.results[0].geometry.location.lng;

    const newHotel = await Hotel.create({ ...req.body, lat, lng, guestId: req.user.id });
    res.status(201).json({
      status: 'success',
      data: newHotel,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getAllHotels = async (req, res) => {
  try {
    const allHotels = await Hotel.find();
    res.status(200).json({
      status: 'success',
      results: allHotels.length,
      data: allHotels,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.getExactPost = async (req, res) => {
  try {
    const post = await Hotel.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: post,
      user: req.user ? req.user.id : null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getHotelReservations = async (req, res) => {
  const { id } = req.params;

  console.log('=== DEBUG START ===');
  console.log('Received ID:', id);
  console.log('ID type:', typeof id);

  try {
    const allReservations = await Rezervation.find();
    const hotelObjectId = new mongoose.Types.ObjectId(id);
    const reservations = await Rezervation.find({ hotelId: hotelObjectId });
    res.status(200).json({
      status: 'success',
      count: reservations.length,
      reservations,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Greška pri dohvaćanju rezervacija',
    });
  }
};

exports.setRezervation = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut } = req.body;
    console.log('User:', req.user.id);
    const newRezervation = await Rezervation.create({
      hotelId: hotelId,
      guestId: req.user.id,
      checkIn: checkIn,
      checkOut: checkOut,
    });
    console.log(newRezervation);
    res.status(201).json({
      status: 'success',
      message: newRezervation,
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hotel ne postoji',
      });
    }

    if (hotel.guestId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Nemate dozvolu za brisanje ovog hotela',
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Uspješno obrisano',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Greška pri brisanju',
    });
  }
};

exports.searchHotel = async (req, res) => {
  console.log('Query parametri:', req.query);
  try {
    const { destination } = req.query;
    const matchedHotels = await Hotel.find({
      place: {
        $regex: destination,
        $options: 'i',
      },
    });
    res.status(200).json({
      status: 'success',
      data: matchedHotels,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.allFiltersHotel = async (req, res) => {
  try {
    const splittedTypes = req.query.types ? req.query.types.split(',') : [];
    const splittedPrices = req.query.prices ? req.query.prices.split(',') : [];
    const splittedBenefits = req.query.benefits ? req.query.benefits.split(',') : [];
    console.log(splittedTypes, splittedPrices);
    let query = {};
    if (splittedTypes.length > 0) {
      query.type = { $in: splittedTypes };
    }
    if (splittedPrices.length > 0) {
      const priceConditions = [];

      splittedPrices.forEach(range => {
        if (range === '0-50') {
          priceConditions.push({ price: { $gte: 0, $lte: 50 } });
        } else if (range === '51-100') {
          priceConditions.push({ price: { $gte: 51, $lte: 100 } });
        } else if (range === '101-200') {
          priceConditions.push({ price: { $gte: 101, $lte: 200 } });
        } else if (range === '200-more') {
          priceConditions.push({ price: { $gt: 200 } });
        }
      });

      if (priceConditions.length > 0) {
        query.$or = priceConditions;
      }
    }
    if (splittedBenefits.length > 0) {
      splittedBenefits.forEach(benefit => {
        query[benefit] = true;
      });
    }

    console.log('Final query:', query);
    const hotels = await Hotel.find(query);
    res.status(200).json({
      status: 'success',
      data: hotels,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

//My rezervations
exports.getAllRezervations = async (req, res) => {
  try {
    const id = req.user.id;
    const myAllRezervations = await Rezervation.find({
      guestId: id,
    }).populate('hotelId');
    res.status(200).json({
      status: 'success',
      data: myAllRezervations,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getExactRezervation = async (req, res) => {
  try {
    const rezervation = await Rezervation.findById(req.params.id).populate('hotelId');
    res.status(200).json({
      status: 'success',
      data: rezervation,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteRezervation = async (req, res) => {
  try {
    const rezervation = await Rezervation.findById(req.params.id);

    if (!rezervation) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rezervacija ne postoji',
      });
    }

    if (rezervation.guestId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Nemate dozvolu za otkazivanje ove rezervacije',
      });
    }

    await Rezervation.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Rezervacija uspješno obrisana',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Brisanje rezervacije nije uspijelo',
    });
  }
};

exports.confirmRezervation = async (req, res) => {
  try {
    const rez = await Rezervation.findById(req.params.id);

    if (!rez) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rezervacija ne postoji',
      });
    }

    if (rez.guestId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Nemate dozvolu za potvrdu ove rezervacije',
      });
    }

    rez.confirmed = true;
    await rez.save();
    res.status(200).json({
      status: 'success',
      message: 'Uspješno potvrđeno',
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Došlo je do greške prilikom potvrđivanja rezervacije',
    });
  }
};
