const passport = require('passport');
const query = require('../db/db');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const keys = require('./keys');
  
passport.serializeUser((user , done) => {
    console.log("user.id: " + user.id)
    done(null , user.id);
}),

passport.deserializeUser(async (id, done) => {
  console.log("id: " + id)
  // Look up user id in database
  const result = await query(
    'SELECT * FROM user_account WHERE id = $1',
    [id]
  );
  console.log("length: " + result.rows.length)
  if (result.rows.length !== 0){
    var user = {
      id : result.rows[0].id,
      name : result.rows[0].name,
      email : result.rows[0].email
    };
  }
  done(null, user);
});  
  
passport.use(new GoogleStrategy({
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL:"http://localhost:3000/auth/callback",
    passReqToCallback:true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    // Check if user exists in database
    const result = await query(
      'SELECT * FROM user_account WHERE google_id = $1',
      [profile.id]
    );
    if (result.rows.length === 0){
      // User does not exist a new one is created
      const result = await query(
        'INSERT INTO user_account (google_id, email, name) VALUES ($1, $2, $3) RETURNING *',
        [profile.id, profile.displayName, profile.email]
      );
      if (result.rows.length === 0) {
          res.status(500).json({
              message: 'Couldnt create user'
          });
      } else {
        var user = {
          id : result.rows[0].id,
          name : result.rows[0].name,
          email : result.rows[0].email
        };
      };
    } else {
      var user = {
        id : result.rows[0].id,
        name : result.rows[0].name,
        email : result.rows[0].email
      };
    }

    return done(null, user);
  }
));