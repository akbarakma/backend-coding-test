/* eslint-disable no-throw-literal */
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('../config/winston');
const {
  findOne,
  insertOne,
  findAllLimits,
  countAll,
} = require('./model');

const app = express();
const jsonParser = bodyParser.json();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined', { stream: winston.stream }));

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    try {
      if (req.body.start_lat > 0 === false || req.body.start_long > 0 === false
      || req.body.end_lat > 0 === false || req.body.end_long > 0 === false) {
        throw {
          status: 400,
          message: 'Start latitude-longitude, and end latitude-longitude must be a number',
        };
      }

      const startLatitude = Number(req.body.start_lat);
      const startLongitude = Number(req.body.start_long);
      const endLatitude = Number(req.body.end_lat);
      const endLongitude = Number(req.body.end_long);
      const riderName = req.body.rider_name;
      const driverName = req.body.driver_name;
      const driverVehicle = req.body.driver_vehicle;

      if (startLatitude < -90 || startLatitude > 90
        || startLongitude < -180 || startLongitude > 180) {
        throw {
          status: 400,
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        };
      }
      if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
        throw {
          status: 400,
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        };
      }
      if (typeof riderName !== 'string' || riderName.length < 1) {
        throw {
          status: 400,
          message: 'Rider name must be a non empty string',
        };
      }
      if (typeof driverName !== 'string' || driverName.length < 1) {
        throw {
          status: 400,
          message: 'Rider name must be a non empty string',
        };
      }
      if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
        throw {
          status: 400,
          message: 'Rider name must be a non empty string',
        };
      }

      const values = [startLatitude, startLongitude, endLatitude,
        endLongitude, riderName, driverName, driverVehicle];
      const id = await insertOne(db, values);
      const result = await findOne(db, id);
      res.send(result);
    } catch (err) {
      if (err.status === 400) {
        winston.error(`${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).send({
          error_code: 'VALIDATION_ERROR',
          message: err.message,
        });
      } else {
        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }
    }
  });

  app.get('/rides', async (req, res) => {
    try {
      const resPerPage = 5;
      const page = Number(req.query.page) || 1;
      if (page < 0) {
        throw {
          status: 400,
          message: 'Page must be greater and equal to 0',
        };
      }
      const offset = (resPerPage * page) - resPerPage;
      const rideData = await findAllLimits(db, resPerPage, offset);
      if (rideData.length === 0) {
        throw {
          status: 404,
          message: 'Could not find any rides',
        };
      }
      const numOfResult = await countAll(db);
      res.json({
        rides: rideData,
        pages: Math.ceil(numOfResult / resPerPage),
        currentPage: page,
        numOfResult,
      });
    } catch (err) {
      if (err.status === 500) {
        winston.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      } else {
        winston.error(`${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(err.status).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: err.message,
        });
      }
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await findOne(db, id);
      if (result.length === 0) {
        throw {
          status: 404,
          message: 'Could not find any rides',
        };
      }
      res.send(result);
    } catch (err) {
      if (err.status === 404) {
        winston.error(`404 - ${err.message}- ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: err.message,
        });
      } else {
        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }
    }
  });
  return app;
};
