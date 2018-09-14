const axios = require('axios');
const bcrypt = require("bcryptjs");
const { authenticate } = require('./middlewares');
const db = require("../database/dbConfig");
const jwt = require('jsonwebtoken');
const jwtKey = require('../_secrets/keys').jwtKey;

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};
function generateToken(user) {
  const payload = {
    username: user.username,
  };
  const options = {
    expiresIn: '1h',
    jwtid: '12345',
  };
  return jwt.sign(payload, jwtKey, options);
}

function register(req, res) {
  let creds = req.body;
  if (!(creds.username && creds.password)) return res.json({ code: 400 });
 
   const hash = bcrypt.hashSync(creds.password, 10);
   creds.password = hash;
 
   db('users')
     .insert(creds)
     .then(response => {
       if (response) return res.status(200).send(response);
     })
     .catch(err => res.status(500).send(err));
}

function login(req, res) {

  let creds = req.body; 

  db("users")
    .where({username: creds.username})
    .first()
    .then(user => {
      if(user && bcrypt.compareSync(creds.password, user.password)) {
        const token = generateToken(user); 

        res.status(200).json({token}); 
      }else{
        res.status(401).json({message: "No User Found"});
      }
    })
    .catch(err => res.status(500).send(err));
}

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
