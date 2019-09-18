const admin = require('firebase-admin');

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  databaseURL: 'https://test-b1438.firebaseio.com',
  storageBucket: "test-b1438.appspot.com",
});

const db = admin.firestore();

module.exports = { admin, db }