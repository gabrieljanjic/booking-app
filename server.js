const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();
const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to database'));
app.use('/', routes);

app.listen(process.env.PORT, () => {
  console.log(`App in running on ${process.env.PORT}`);
});
