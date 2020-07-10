require("dotenv").config()

module.exports = {
  baseURL: process.env.BASEURL,
  port: process.env.PORT,
  fbClientID: process.env.FACEBOOK_CLIENT_ID,
  fbClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  fbCallbackURL: process.env.FACEBOOK_CALLBACK_URL,
  dbURL: process.env.DBURL,
  liveDBURL: process.env.LIVEDBURL,
  jwtExpiryInSeconds: process.env.JWTEXPIRYSECONDS,
  tokenSecret: process.env.TOKENSECRET,
  refreshTokenSecret: process.env.REFRESHTOKENSECRET,
  refreshTokenExpiresIn: process.env.REFRESHTOKENEXPIRESIN,
  emailAccount: process.env.EMAILACCOUNT,
  emailPassword: process.env.EMAILPASSWORD
}