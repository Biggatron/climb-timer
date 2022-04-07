const express = require('express')
const app = express()
const passport = require('passport')
const cookieSession = require('cookie-session')
const keys = require('./config/keys');
require('./config/passport')

const port = 3000

app.use(cookieSession({
  name: 'google-auth-session',
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
  res.send("<button><a href='/auth'>Login With Google</a></button>")
});

// Auth 
app.get('/auth' , passport.authenticate('google', { scope:
  [ 'email', 'profile' ]
}));

// Auth Callback
app.get( '/auth/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/callback/success',
        failureRedirect: '/auth/callback/failure'
}));

// Success 
app.get('/auth/callback/success' , (req , res) => {
  if(!req.user)
      res.redirect('/auth/callback/failure');
  res.send("Welcome " + req.user);
  console.log('User object:')
  console.log(req.user)
});

// failure
app.get('/auth/callback/failure' , (req , res) => {
  res.send("Error");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})