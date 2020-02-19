/* eslint-disable prefer-destructuring */
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const recipes = require('./list.json');

/*
 * Vars
 */
const app = express();
const port = 3001;

const db = {
  users: {
    'bouclierman@herocorp.io': {
      id: 1,
      password: 'jennifer',
      username: 'John',
      color: '#c23616',
      favorites: [21453, 462],
    },
    'acidman@herocorp.io': {
      id: 2,
      password: 'fructis',
      username: 'Burt',
      color: '#009432',
      favorites: [8965, 11],
    },
    'captain.sportsextremes@herocorp.io': {
      id: 3,
      password: 'pingpong',
      username: 'Karin',
      color: '#f0f',
      favorites: [8762],
    }
  }
};

// Middlewares
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))

/*
 * Express
 */
app.use(bodyParser.json());
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  response.header('Access-Control-Allow-Credentials', true);
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});



function isLogged(req, res, next) {
  if (req.session.user) {
    console.log('User logged in, next')
    next();
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    res.status(401).end();
  }
}

// Page d'accueil du serveur : GET /
app.get('/', (request, response) => {
  response.send(`
    <div style="margin: 5em auto; width: 400px; line-height: 1.5">
      <h1 style="text-align: center">Hello!</h1>
      <p>Si tu vois ce message, c'est que ton serveur est bien lancé !</p>
      <div>Désormais, tu dois venir utiliser l'API</div>
      <ul style="display: inline-block; margin-top: .2em">
        <li>recettes : <code>GET http://localhost:${port}/recipes</code></li>
        <li>Login : avec <code>email</code> et <code>password</code> : <code>POST http://localhost:${port}/login</code></li>
        <li>Déconnexion : <code>POST http://localhost:${port}/logout</code></li>
        <li><code>POST http://localhost:${port}/isLogged</code></li>
      </ul>
    </div>
  `);
});

app.get('/recipes', (request, response) => {
  response.json(recipes);
});


app.post('/isLogged', (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    res.json({ logged: true, info: req.session.user })
  }
  else {
    res.json({ logged: false, info: { favorites: [] } })
  }
});


// Login avec vérification : POST /login
app.post('/login', (request, response) => {
  console.log('>> POST /login', request.body);

  const { email, password } = request.body;

  let username;
  if (db.users[email] && db.users[email].password === password) {
    username = db.users[email].username;
  }

  // Réponse HTTP adaptée.
  if (username) {
    request.session.user = db.users[email];
    console.log('<< 200 OK', username);
    response.json({ logged: true, info: request.session.user });
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    response.status(401).end();
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ logged: false, info: { favorites: [] } });
});

/*
 * Server
 */
app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
