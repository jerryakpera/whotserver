const config = require("../../config")

const jwt = require("jsonwebtoken")
const AUTH = require("../../api/auth/authController")
const RefreshToken = require("../../db/models/RefreshToken")
// const _ = require("../../services/util")


module.exports = {
  createToken: (user) => {
    const tokenSecret = config.tokenSecret
    return jwt.sign({
      userID: user._id,
      role: user.role
    }, tokenSecret, {
      expiresIn: config.jwtExpiryInSeconds
    })
  },

  createRefreshToken: (userID) => {
    const refreshTokenSecret = config.refreshTokenSecret
    const now = new Date()

    return new Promise((resolve, reject) => {
      // RefreshToken
      const refreshToken = {
        userID,
        token: jwt.sign({userID}, refreshTokenSecret),
        expiresIn: now.setDate(now.getDate() + config.refreshTokenExpiresIn)
      }
      RefreshToken.findOneAndUpdate({user: userID}, refreshToken, {
        new: true,
        useFindAndModify: false,
        upsert: true
      }, (err, newRefreshToken) => {
        if (err) {
          reject(err)
        }
        resolve(newRefreshToken)
      })
    })
  },

  getExpiresIn: (token) => {
    return jwt.verify(token, config.tokenSecret).exp
  },

  getTokenData: (token) => {
    const verified = jwt.verify(token, config.tokenSecret)
    return verified
  },

  // Verify token middleware that ensures that the token userID exists in the DB and that the token is valid
  verify: (req, res, next) => {
    let token = req.header("Authorization")
    
    if (!token) {
      return res.json({
        status: 401,
        message: "Access denied",
        data: {}
      })
    }
    
    try {
      const verified = jwt.verify(token, config.tokenSecret)
      AUTH.findByUserID(verified.userID).then(user => {
        if (!user) {
          return res.json({
            status: 401,
            message: "Access denied",
            data: {}
          })
        }
        req.user = verified
        next()
      })
    } catch (err) {
      res.json({
        status: 400,
        message: "Invalid token",
        data: err.message
      })
    }
  },

  verifyAdmin: (req, res, next) => {
    const token = req.header("access-token")
    
    if (!token) {
      return res.json({
        status: 401,
        message: "Access denied",
        data: {}
      })
    }

    try {
      const verified = jwt.verify(token, config.tokenSecret)
      AUTH.findByUserID(verified.userID).then(user => {
        if (!user) {
          return res.json({
            status: 401,
            message: "Access denied",
            data: {}
          })
        }

        if (user.role > 1) {
          return res.json({
            status: 401,
            message: "Access denied",
            data: {}
          })
        }

        req.user = verified
        next()
      })
    } catch (err) {
      res.json({
        status: 400,
        message: "Invalid token",
        data: err
      })
    }
  },

  verifySuperAdmin: (req, res, next) => {
    const token = req.header("access-token")
    
    if (!token) {
      return res.json({
        status: 401,
        message: "Access denied",
        data: {}
      })
    }

    try {
      const verified = jwt.verify(token, config.tokenSecret)
      AUTH.findByUserID(verified.userID).then(user => {
        if (!user) {
          return res.json({
            status: 401,
            message: "Access denied",
            data: {}
          })
        }
        
        if (user.role > 0) {
          return res.json({
            status: 401,
            message: "Access denied",
            data: {}
          })
        }

        req.user = verified
        next()
      })
    } catch (err) {
      res.json({
        status: 400,
        message: "Invalid token",
        data: err
      })
    }
  },

  getID: (token) => {
    const verified = jwt.verify(token, config.tokenSecret)
    return new Promise((resolve, reject) => {
      resolve(verified.userID)
    })
  },

  findRefreshToken: (userID) => {
    return new Promise((resolve, reject) => {
      RefreshToken
      .findOne({user: userID.userID})
      .then(refreshToken => {
        //this will log all of the users with each of their posts 
        resolve(refreshToken);
      })
      .catch(err => {
        reject(err);
      })
    })
  },

  findAndPopulateRefreshToken: (userID) => {
    return new Promise((resolve, reject) => {
      RefreshToken
      .find({user: userID})
      .populate('user')
      .exec((err, refreshToken) => {
        if(err) reject(err);
        //this will log all of the users with each of their posts 
        else resolve(refreshToken);
      })
    })
  },

  refresh: {
    delete: (query) => {
      return new Promise((resolve, reject) => {
        RefreshToken.deleteOne(query, (err, docs) => {
          if (err) reject(err)
          resolve()
        })
      })
    }
  }
}