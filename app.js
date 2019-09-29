/* imported express server */
const express = require('express');
/* database */
const DB = require('./db');
const config = require('./config');
/* imported bodyparser to handle the json data send from  the front end */
const bodyParser = require('body-parser');

/* password should not be directly stored as text in database. store as hashed */
const bcrypt = require('bcrypt');

/* imported jsonwebtoken to confirm the user is logged in */
const jwt = require('jsonwebtoken');

/* create database connection */
const db = new DB('sqlitedb');

/* created express server */
const app = express();
/* created a router instance  */
const router = express.Router();

router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

/* avoid problems due to cross origin request */
/* since for simplicity we are allowing the following header attributes */
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
}

app.use(allowCrossDomain);
router.post('/login', ( req, res) => { 
	db.selectByemail(req.body.email, ( err, user) => { 
		if(err) return res.status(500).send("Something went wrong while fetching the user");
		if(!user) return res.status(404).send("User not found");
		if(!bcrypt.compare(req.body.password,user.user_pass)) return res.status(404).send("username or password is wrong");
		let token = jwt.sign({id:user.id},config.secret,{expiresIn: 86400 });
		res.status(200).send({auth:true,token:token,user:user});
	});

});
router.post('/register', ( req, res) => { 

	db.insertUser([req.body.email,
			req.body.username,
			bcrypt.hashSync(req.body.password,8),
			0
			], (err ) => { 
				if(err) return res.status(404).send("There was a problem while creating user.");
				db.selectByemail(req.body.email, (err, user) => { 
					if(err) return res.status(500).send("Something went wrong while fetching the user");
					let token = jwt.sign({id:user.id},config.secret,{expiresIn: 86400 });
					res.status(200).send({auth:true,token:token,user:user});
				});	
			});
});
router.get('/getlist', ( req, res) => { 
	db.selectAll( (err,users) => { 
		if(err) return res.status(500).send("There was a problem fetching users");
		if(!users) return res.status(404).send("No users found");
		res.status(200).send({auth:true,users:users});		
	});

});
app.use(router);
let port = process.env.PORT || 3000;
let server = app.listen(port, ( req, res) => {  
	console.log('Express server listening on port ' + port);
})