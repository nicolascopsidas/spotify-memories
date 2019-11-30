# spotify-memories

A school project showing user's most heard tracks and artists, thanks to Spotify API
Developped by Nicolas Copsidas, Tristan Deligne-Luc and Gabriel Gerard

This webapp, let you connect yourself with your Spotify account. Then you have access to 3 pages : 
  - Songs, where you can see the tracks you heard the most on Spotify, depending the range you want (1 month, 6 months, since     the creation of your Spotify account
  - Artists, where you can see the artists you heard the most on Spotify, depending the range you want (1 month, 6 months,         since the creation of your Spotify account
  - My account, where you can get some infos about your Spotify account

It has been developped with NodeJS and MongoDB, and uses 8 packages : 
  - cookie-parser : used to retrieve the jwt token from the user's cookies
  - ejs : used for the templating of all views
  - express : used for rooting
  - jsonwebtoken : used for the user session, let the app recognize the user with the id contained in the token, 
    and retrieve datas from mongodb
  - mongoose : used to simplify calls to mongodb
  - nodemon : used for the development only, to recharge automatically nodeJS at every changes made on the project 
  - spotify-personal-auth : used to let the user login from Spotify easily
  - spotify-web-api-node : wrapper for the spotify api, used to simplify calls to the spotify api
  
For the front-end of the webapp, we used Bootstrap 4.4 and a free template that we found online, we transformed the pages in EJS template.  

To launch the app, you have to initialize a mongo database, then replace the URL in the 21st line of index.js 
(at the root of the project) with the one of your freshly created database.

Then you just have to launch the project with "node index.js" in the project emplacement.
