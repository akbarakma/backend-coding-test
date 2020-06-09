const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('../config/winston');

const app = express();
const jsonParser = bodyParser.json();
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: winston.stream }));

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
      || startLongitude < -180 || startLongitude > 180) {
      winston.error(`400 - 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      winston.error(`400 - 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      winston.error(`400 - 'Rider name must be a non empty string'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      winston.error(`400 - 'Rider name must be a non empty string'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      winston.error(`400 - 'Rider name must be a non empty string'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    const values = [req.body.start_lat, req.body.start_long, req.body.end_lat,
      req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

    // eslint-disable-next-line func-names
    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
      if (err) {
        /* istanbul ignore next */
        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        /* istanbul ignore next */
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (error, rows) => {
        if (error) {
          /* istanbul ignore next */
          winston.error(`${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
          /* istanbul ignore next */
          return res.status(500).send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }
        res.send(rows);
        return null;
      });
      return null;
    });
    return null;
  });

  app.get('/rides', (req, res) => {
    db.all('SELECT * FROM Rides', (err, rows) => {
      if (err) {
        /* istanbul ignore next */
        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        /* istanbul ignore next */
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        winston.error(`404 - 'Could not find any rides'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      res.send(rows);
      return null;
    });
  });

  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      if (err) {
        /* istanbul ignore next */
        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        /* istanbul ignore next */
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        winston.error(`404 - 'Could not find any rides'- ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }
      res.send(rows);
      return null;
    });
  });
  return app;
};
