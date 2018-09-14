const axios = require('axios');

const { authenticate } = require('./middlewares');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const creds = req.body; 
  const hash = bcrypt.hashSync(creds.password, 10); 
  creds.password = hash; 
  db("users")
    .insert(creds)
    .then(ids => {
      const id = ids[0]; 
      db("users")
        .where({id})
        .first()
        .then(user=>{
          const token = generateToken(user); 
          res.status(201).json({id: user.id, token}); 
        })
        .catch(err => res.status(500).send(err));
    })
    .catch(err => res.status(500).send(err)); 
}

function login(req, res) {
  // implement user login
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
