const express = require('express')
const cookieSession = require('cookie-session')
const passport = require('passport')
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const compRoutes = require('./routes/comp-routes');
const timerRoutes = require('./routes/timer-routes');
const passportSetup = require('./config/passport')
const keys = require('./config/keys');

const app = express()
const port = 3000

// res.authError is set in passport.js if deserialization of user from cookie fails
app.get('/*', (req, res, next) => {
  if ( res.authError ) {
    console.log(res.authError)
    res.authError = null;
    res.redirect('/auth/login');
  } else {
    console.log('next()')
    next();
  }
});

// set view engine
app.set('view engine', 'ejs');

app.use(express.static('public'));

// set up session cookies
app.use(cookieSession({
  name: 'google-auth-session',
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/comp', compRoutes);
app.use('/timer', timerRoutes);

app.get('/', (req, res) => {
  res.render('home2', {user: req.user})
});

// // Auth 
// app.get('/auth' , passport.authenticate('google', { scope:
//   [ 'email', 'profile' ]
// }));

// // Auth Callback
// app.get( '/auth/callback',
//     passport.authenticate( 'google', {
//         successRedirect: '/auth/callback/success',
//         failureRedirect: '/auth/callback/failure'
// }));

// // Success 
// app.get('/auth/callback/success' , (req , res) => {
//   if(!req.user)
//       res.redirect('/auth/callback/failure');
//   res.send("Welcome " + req.user);
//   console.log('User object:')
//   console.log(req.user)
// });

// // failure
// app.get('/auth/callback/failure' , (req , res) => {
//   res.send("Error");
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})