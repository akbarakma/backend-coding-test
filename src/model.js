exports.findOne = (db, id) => new Promise((resolve, reject) => {
  db.all('SELECT * FROM Rides WHERE rideID = ?', id, (error, rows) => {
    if (error) reject(error);
    else resolve(rows);
  });
});

exports.insertOne = (db, data) => new Promise((resolve, reject) => {
  // eslint-disable-next-line func-names
  db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', data, function (err) {
    if (err) reject(err);
    else resolve(this.lastID);
  });
});

exports.findAllLimits = (db, limit, offset) => new Promise((resolve, reject) => {
  db.all('SELECT * FROM Rides LIMIT ? OFFSET ?', limit, offset, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

exports.countAll = (db) => new Promise((resolve, reject) => {
  db.all('SELECT COUNT(*) FROM Rides', (error, result) => {
    if (error) reject(error);
    else resolve(result[0]['COUNT(*)']);
  });
});
