const functions = require('firebase-functions');
const app = require('express')();
const Auth = require('./util/Auth');

const { getScreams, createScream } = require('./handlers/screams');
const { signup, login, uploadImage } = require('./handlers/users');

app.get('/screams', getScreams);
app.post('/screams', Auth, createScream); 

app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', Auth, uploadImage);

exports.api = functions.https.onRequest(app);

