const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const cors = require('cors');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//rate limit
const limiter = ratelimit.rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//Http headers

app.use(express.json());
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against HTML
app.use(xss());

app.use(
  cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

app.use(express.static(`${__dirname}/public/`));

// app.use((req, res, next) => {
//   console.log('widdleware');
//   next();
// });

app.use('/api/v1/tours/', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
  // const err = new Error(`Cannot find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);

module.exports = app;
