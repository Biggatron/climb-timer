const express = require('express');
const http = require('http');
const cookieSession = require('cookie-session')
const passport = require('passport')
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const compRoutes = require('./routes/comp-routes');
const timerRoutes = require('./routes/timer-routes');
const passportSetup = require('./config/passport')
const keys = require('./config/keys');
const events = require('./events/socket');
const errorHandler = require('./utilities/errorHandler');

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


const port = 3000


// res.authError is set in passport.js if deserialization of user from cookie fails
app.get('/*', (req, res, next) => {
  if ( res.authError ) {
    console.log(res.authError)
    res.authError = null;
    res.redirect('/auth/login');
  } else {
    next();
  }
});


// set view engine
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.json());

// set up session cookies
app.use(cookieSession({
  name: 'google-auth-session',
  maxAge: 365 * 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Handle passport deserializion errors
app.use(function(err, req, res, next) {
  if (err) {
      req.logout();
      res.redirect('/');
  } else {
      next();
  }
});

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/timer', timerRoutes);
app.use('/', timerRoutes);

app.use(errorHandler);

/* app.get('/', (req, res) => {
  //res.render('home', {user: req.user})
  // Direct all traffic to timer
    res.redirect('/timer');
}); */

io.on('connection', (socket) => {
  events.joinRoom(socket);

  // Client Events
  socket.on('disconnect', () => {
    console.log('user disconnected');
    events.disconnectUser(socket);
  });
  socket.on('startTimer', (timer) => {
    console.log('user started timer ' + timer.timer_code);
    events.startTimer(socket, io, timer);
  });
  socket.on('pauseTimer', (timer) => {
    console.log('user paused timer ' + timer.timer_code);
    events.pauseTimer(socket, io, timer);
  });
  socket.on('resetTimer', (timer) => {
    events.resetTimer(socket, io, timer);
  });
  socket.on('syncTimer', (timer) => {
    events.syncTimer(socket, io, timer);
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})