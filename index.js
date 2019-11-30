//all requires for the project
const express = require('express')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const auth = require('spotify-personal-auth')
const SpotifyWebApi = require('spotify-web-api-node')

//express configuration on port 8888, and setup of all ressources (img, css, etc) emplacements
const app = express()
const PORT = 8888;
app.use('/public', express.static(__dirname +   '/public'));

//ejs templating engine configuration
app.set('views', './public/views');
app.set('view engine', 'ejs');

//mangodb nosql database set up with mangoose
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.connect('mongodb://localhost:27017/MyDatabase')
var db = mongoose.connection
const Schema = mongoose.Schema;

//description of the shema for the db

const UserDetailShema = new Schema({
      id: String,
      email: String,
      product: String,
      name: String,
      country: String,
      followersnumber: Number
    });
const UserDetails = mongoose.model('userInfo', UserDetailShema, 'userInfo');

//jwt token for session set up

const secret = 'ytcvubnlbvcrxyv5678hjbhvg767'
const cookieParser = require('cookie-parser')
app.use(cookieParser())

//configuration of the spotify api wrapper

auth.config({
  clientId: '5711d1a992694ef68a682bb36beddec8', // Replace with your client id
  clientSecret: '3603bbd6b1ed4251b791dc1759fff745', // Replace with your client secret
  scope: ['user-modify-playback-state', 'user-top-read'], // Replace with your array of needed Spotify scopes
  path: './to/tokens.json' // Optional path to file to save tokens (will be created for you)
})

const api = new SpotifyWebApi()

// principal root
app.get('/', (req, res) => {

  //try to recover the cookie for user id
  var token = req.cookies.auth;
  var tokenData;

  //if it exists, we recover data of the user from mangodb, with the id of the user contained in the token
  //then we render the page with the ejs template "index", and with the data from the user
  if (token) {
    jwt.verify(token, secret, function(err, token_data) {
      if (!err) {
        var userInfo = UserDetails.findOne({id : token_data.user})
        userInfo.then(userInfo => {
          console.log(userInfo);
          res.render('index', {userInfo : userInfo});
        })
      }});
  } else {
    //if no token is found, the classic page is charged, that let the user log in
    res.render('index');
  }
});

// root for songs, that show to the user all the songs that he heard the most
app.get('/songs/', (req, res) => {

  auth.token().then(([token, refresh]) => {
    // Sets api access and refresh token
    api.setAccessToken(token)
    api.setRefreshToken(refresh)

    // once access token set, fetch the top tracks from the api and rend the template 'songs' with the 'top tracks' data
    return api.getMyTopTracks()
  }).then(data => {
    res.render('songs', {data : data});
  }).catch(rej => {
      // if it don't work, bring the user to an error page
      console.log(rej)
      res.render('error')
  })

});

// same root as the songs page, but with a range choice, in fact spotify let us fetch datas from multiples ranges : long_term, short_term and medium_term
// the root do exactly the same as the precedent one, except it recovers the range from the url, and make the request from spotify api with the range in parameters
app.get('/songs/:range', (req, res) => {

  const range = req.params.range;
  auth.token().then(([token, refresh]) => {
    // Sets api access and refresh token
    api.setAccessToken(token)
    api.setRefreshToken(refresh)

    return api.getMyTopTracks({'time_range' : range})
  }).then(data => {
    console.log(data);
    res.render('songs', {data : data});
  }).catch(rej => {
      console.log(rej)
      res.render('error')
  })
});

//does exactly the same as 'songs', except it works for artists
app.get('/artists/', (req, res) => {

  auth.token().then(([token, refresh]) => {
    // Sets api access and refresh token
    api.setAccessToken(token)
    api.setRefreshToken(refresh)
    return api.getMyTopArtists()
  }).then(data => {
    console.log(data);
    res.render('artists', {data : data});
  }).catch(rej => {
      console.log(rej)
      res.render('error')
  })

});

//does exactly the same as 'songs' with range, except it works for artists
app.get('/artists/:range', (req, res) => {
  const range = req.params.range;
  auth.token().then(([token, refresh]) => {
    // Sets api access and refresh token
    api.setAccessToken(token)
    api.setRefreshToken(refresh)
    return api.getMyTopArtists({'time_range' : range})
  }).then(data => {
    res.render('artists', {data : data});
  }).catch(rej => {
      console.log(rej)
      res.render('error')
  })

});


// let the user log in
app.get('/login', (req, res) => {
   auth.token().then(([token, refresh]) => {
     // Sets api access and refresh token
     api.setAccessToken(token)
     api.setRefreshToken(refresh)
     return api.getMe()
   }).then(data => {
     // create a new user, following the shema described with mongodb setup
     var user = new UserDetails({
       id: data.body.id,
       email: data.body.email,
       product: data.body.product,
       name: data.body.display_name,
       country: data.body.country,
       followersnumber: data.body.followers.total
     })
     console.log(user)
     // save the user in the db
     user.save(function(error) {
       console.log("User has been saved");
       if (error) {
         console.error(error);
       }
     })
     // create a token in user cookies to remember him, for the home and the account page
     const myToken = jwt.sign({iss:'http://spotifyanalytics.fr', user: data.body.id},  secret)
     res.cookie('auth', myToken).redirect('/')
   }
   ).catch(console.log)
 });

// check local jwt token from cookies, then show the user's info from mangodb, thanks to the id contained in the token
 app.get('/account', (req, res) => {
   var token = req.cookies.auth;
   var tokenData;

   if (token) {
     jwt.verify(token, secret, function(err, token_data) {
       if (!err) {
         var userInfo = UserDetails.findOne({id : token_data.user})
         userInfo.then(userInfo => {
           // make a render with the template "account" and the user's datas
           res.render('account', {userInfo : userInfo});
         })
       }});
   } else {
     // make a render of the error template if the token is not recover
     res.render('error');
   }
 });

 app.get('/error', (req, res) => {
   res.render('error');
 });

 app.listen(PORT, () => {
   console.log(`listening on port ${PORT}`)
 });
