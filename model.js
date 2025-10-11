const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Morate unijetiime!'],
  },
  surname: {
    type: String,
    required: [true, 'Morate unijeti prezime'],
  },
  username: {
    type: String,
    required: [true, 'Morate unijeti korisničko ime!'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Morate unijete lozinku!'],
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const User = mongoose.model('User', userSchema);

const hotelSchema = new mongoose.Schema({
  guestId: {
    type: String,
    required: true,
  },
  lat: { type: Number },
  lng: { type: Number },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: {
      values: ['hotel', 'apartman', 'hostel'],
      message: 'Tip mora biti hotel, hostel ili apartman',
    },
    lowercase: true,
    require: true,
  },
  street: { type: String },
  place: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  breakfast: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  wiFi: { type: Boolean, default: false },
  klima: { type: Boolean, default: false },
  cleaning: { type: Boolean, default: false },
  familyRoom: { type: Boolean, default: false },
  smoking: { type: Boolean, default: false },
});
const Hotel = mongoose.model('Hotel', hotelSchema);

const reservationSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  guestId: {
    type: String,
    required: true,
  },
  checkIn: {
    type: String,
    required: true,
  },
  checkOut: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

const Rezervation = mongoose.model('Rezervation', reservationSchema);

module.exports = { User, Hotel, Rezervation };
