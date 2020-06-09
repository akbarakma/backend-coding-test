const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }
      buildSchemas(db);
      done();
      return null;
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /rides', () => {
    it('should return 404 and error message', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect(404, done);
    });
  });

  describe('POST /rides', () => {
    it('should return status 200 and object', (done) => {
      const input = {
        start_lat: 15,
        start_long: 15,
        end_lat: 15,
        end_long: 15,
        rider_name: 'test',
        driver_name: 'test driver',
        driver_vehicle: 'crv',
      };
      request(app)
        .post('/rides')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    it('should return status 400 and error message', (done) => {
      const input = {
        start_lat: 150,
        start_long: 15,
        end_lat: 15,
        end_long: 15,
        rider_name: 'test',
        driver_name: 'test driver',
        driver_vehicle: 'crv',
      };
      request(app)
        .post('/rides')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
    it('should return status 400 and error message', (done) => {
      const input = {
        start_lat: 15,
        start_long: 15,
        end_lat: 150,
        end_long: 15,
        rider_name: 'test',
        driver_name: 'test driver',
        driver_vehicle: 'crv',
      };
      request(app)
        .post('/rides')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
    it('should return status 400 and error message', (done) => {
      const input = {
        start_lat: 15,
        start_long: 15,
        end_lat: 15,
        end_long: 15,
        rider_name: '',
        driver_name: 'test driver',
        driver_vehicle: 'crv',
      };
      request(app)
        .post('/rides')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
    it('should return status 400 and error message', (done) => {
      const input = {
        start_lat: 15,
        start_long: 15,
        end_lat: 15,
        end_long: 15,
        rider_name: 'test',
        driver_name: '',
        driver_vehicle: 'crv',
      };
      request(app)
        .post('/rides')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
    it('should return status 400 and error message', (done) => {
      const input = {
        start_lat: 15,
        start_long: 15,
        end_lat: 15,
        end_long: 15,
        rider_name: 'test',
        driver_name: 'test driver',
        driver_vehicle: '',
      };
      request(app)
        .post('/rides')
        .send(input)
        .expect('Content-Type', /json/)
        .expect(400, done);
    });
  });

  describe('GET /rides', () => {
    it('should return 200 and object', (done) => {
      request(app)
        .get('/rides')
        .expect('Content-Type', /json/)
        .expect((res) => {
          if (res.body.rides.length !== 1) throw new Error('Error');
          if (res.body.pages !== 1) throw new Error('Error');
          if (res.body.currentPage !== 1) throw new Error('Error');
          if (res.body.numOfResult !== 1) throw new Error('Error');
        })
        .expect(200, done);
    });
  });

  describe('GET /rides/:id', () => {
    it('should return 200 and object', (done) => {
      request(app)
        .get('/rides/1')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
    it('should return 404 and error message', (done) => {
      request(app)
        .get('/rides/2')
        .expect('Content-Type', /json/)
        .expect(404, done);
    });
  });
});
