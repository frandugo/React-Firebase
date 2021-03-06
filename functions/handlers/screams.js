const { db } = require('../util/admin');

exports.getScreams = (req, res) => {
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
}

exports.createScream = (req, res) => {

	if(req.body.body.trim() === ''){
		return res.status(400).json({ body: 'Body must not be empty' });
	}

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
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
}