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
app.use(bodyParser.json());

app.use(session({
  secret: 'g5g48er7gergGER',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // empêche l'accès au cookie depuis du javascript côté front
    secure: false, // HTTPS est nécessaire si l'on veut passer l'option à true
    maxAge: 1000 * 60 * 60 * 24, // durée de vie du cookie en milliseconds, ici ça donne 1 jour
  }
})),


app.use((req, res, next) => {
  // on autorise explicitement le domaine du front
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  // on autorise le partage du cookie
  res.header('Access-Control-Allow-Credentials', true);
  // on autorise le partage de ressources entre origines
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Page d'accueil du serveur : GET /
app.get('/', (req, res) => {
  res.send(`
    <div style="margin: 5em auto; width: 400px; line-height: 1.5">
      <h1 style="text-align: center">Hello!</h1>
      <p>Si tu vois ce message, c'est que ton serveur est bien lancé !</p>
      <div>Désormais, tu dois venir utiliser l'API</div>
      <ul style="display: inline-block; margin-top: .2em">
        <li>recettes : <code>GET http://localhost:${port}/recipes</code></li>
        <li>Login : avec <code>email</code> et <code>password</code> : <code>POST http://localhost:${port}/login</code></li>
        <li>Déconnexion : <code>POST http://localhost:${port}/logout</code></li>
        <li><code>POST http://localhost:${port}/isLogged</code></li>
        <li><code>POST http://localhost:${port}/favorites</code></li>
      </ul>
    </div>
  `);
});

// Liste des recettes : GET /recipes
app.get('/recipes', (req, res) => {
  res.json(recipes);
});

// Savoir si on est conntecté : POST /isLogged
app.post('/isLogged', (req, res) => {
  console.log('>> POST /isLogged', req.session.user);
  if (req.session.user) {
    res.json({ logged: true, pseudo: req.session.user.username })
  }
  else {
    res.json({ logged: false })
  }
});


// Login avec vérification : POST /login
app.post('/login', (req, res) => {
  console.log('>> POST /login', req.body);

  const { email, password } = req.body;

  let username;
  if (db.users[email] && db.users[email].password === password) {
    username = db.users[email].username;
  }

  // Réponse HTTP adaptée.
  if (username) {
    req.session.user = db.users[email];
    console.log('<< 200 OK', username);
    res.json({ logged: true, pseudo: username });
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    res.status(401).end();
  }
});

// Se déconnecter : POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ logged: false });
});

// Nos recettes préférées : GET /favorites
app.post('/favorites', (req, res) => {
  console.log('>> POST /favorites', req.session.user);

  if (req.session.user) {
    res.json({ favorites: req.session.user.favorites })
  }
  else {
    res.json({ favorites: [] })
  }
});

/*
 * Server
 */
app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
