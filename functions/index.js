const functions = require('firebase-functions');
const admin = require('firebase-admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((req, res) => {
//  console.log('sisas ESO VA')
//  res.send("Hello from Firebase!");
// });

const app = require('express')();
admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  databaseURL: 'https://test-b1438.firebaseio.com'
});

const db = admin.firestore();

const config = {
	apiKey: "AIzaSyAKsoj__2SkHXbt8grgTXpDhDw6xDe7c7c",
	authDomain: "test-b1438.firebaseapp.com",
	databaseURL: "https://test-b1438.firebaseio.com",
	projectId: "test-b1438",
	storageBucket: "test-b1438.appspot.com",
	messagingSenderId: "716315433973",
	appId: "1:716315433973:web:27dcbf1c84fdf8f9"
};

const firebase = require('firebase');
firebase.initializeApp(config);

// exports.api = functions.region('us-central1').https.onRequest(app);

app.get('/screams', (req, res) => {
	db
	.collection('screams')
	.orderBy('createdAt', 'desc')
	.get()
	.then(data => {
		let screams = [];
			data.forEach(doc => {
			screams.push({
				screamId: doc.id,
				body: doc.data().body,
				userHandle: doc.data().userHandle,
				createdAt: doc.data().createdAt
			})
		});
		return res.json(screams);
	})
	.catch(err => console.log(err));
})

app.post('/screams', (req, res) => {

  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${ doc.id } created successfully` });
      return console.log('Document was created!');
    })
    .catch((err) => {
      res.status(500).json({ error: `something went wrong ${ err }` });
      console.log(err);
    })
})

const isEmail = (email) => {
	const regEx = "[a-zA-Z0-9_\\.\\+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-\\.]+";
	if(email.match(regEx)) return true
	else return false
}

const isEmpty = (string) => {
	if(string.trim() === '') return true;
	else return false;
}

app.post('/signup', (req, res) => {
const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
};

let errors = {};

if(isEmpty(newUser.email)){
	errors.email = 'Email must not be empty';
} else if(!isEmail(newUser.email)){
	errors.email = 'Must be a valid email addres';
}

if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
if(newUser.password !== newUser.confirmPassword)
	errors.confirmPassword = 'Passwords must match';
if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';


if(Object.keys(errors).length > 0) return res.status(400).json(errors);

let token, userId;
		db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
        if(doc.exists){
            return res.status(400).json({ handle: 'this handle is already taken' });
        } else {
            return firebase.auth().createUserWithEmailAndPassword( newUser.email, newUser.password );
        }
    })
    .then((data) => {
				userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then((idToken) => {
				// return res.status(201).json({ token });
				token = idToken;
				const userCredentials = {
					handle: newUser.handle,
					email: newUser.email,
					createdAt: new Date().toISOString(),
					userId
				};
				db.doc(`/users/${ newUser.handle }`).set(userCredentials);
				return console.log('get token');
		})
		.then((data) => {
			return res.status(201).json({ token })
		})
    .catch((err) => {
			console.error(err);
			if(err.code === 'auth/email-already-in-use'){
				return res.status(400).json({ email: 'Email is already in use' });
			} else {
				return res.status(500).json({ error: err.code });
			}
    })

// firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
// .then(data => {
// return res.status(201).json({ message: `user ${data.user.uid } signed successfully` });
// })
// .catch((err) => {
// console.error(err);
// return res.status(500).json({ error: err.code });
// })
	return console.log('Signup');
});


app.post('/login', (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	let errors = {};

	if(isEmpty(user.email)) errors.email = 'Must not be empty';
	if(isEmpty(user.password)) errors.password = 'Must not be empty';

	if(Object.keys(errors).length > 0) return res.status(400).json(errors);

	firebase.auth().signInWithEmailAndPassword(user.email, user.password)
		.then( data => {
			return data.user.getIdToken();
		})
		.then(token => {
			return res.json({ token })
		})
		.catch(err => {
			console.error(err);
			if(err.code === 'auth/wrong-password'){
				return res.status(403).json({ general: 'Wrong credentials, please try again' });
			}else{
				return res.status(500).json({ error: err.code });
			}
		})

});


exports.api = functions.https.onRequest(app);

