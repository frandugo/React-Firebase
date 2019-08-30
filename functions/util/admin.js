const admin = require('firebase-admin');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  databaseURL: 'https://test-b1438.firebaseio.com'
});

const db = admin.firestore();

module.exports = { admin, db }