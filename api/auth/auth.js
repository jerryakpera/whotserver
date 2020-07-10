const passport = require("passport")
// const authPassport = require("./auth.passport")
const url = require("url")
const EMAIL = require("../../services/email/email.service")
const EMAILBODY = require("../../services/email/emailBody")
const _ = require("../../modules/utils")
const express = require("express")
const router = express.Router()

const AUTH = require("./authController")
const TOKEN = require("../../modules/token/token")

const {
  validationResult
} = require('express-validator')

router.get("/facebook", passport.authenticate("facebook"));

router.post("/tokentest", TOKEN.verify, (req, res) => {
  res.json({
    status: 200,
    message: "Token still valid!",
    data: {}
  })
})

// Routes
/** 
 * @swagger
 * definitions:
 *  User:
 *    properties:
 *      username: string
 *      email: string
 *      password: string
 *      confirmpassword: string
 *  Login:
 *    properties:
 *      email: string
 *      password: string
 *  Logout:
 *    properties:
 *      email: string
 *  ChangePassword:
 *    properties:
 *      currentpassword: string
 *      newpassword: string
 *      confirmnewpassword: string
 *  ForgotPassword:
 *    properties:
 *      password: string
 *      confirmpassword: string
 *  RefreshToken:
 *    properties:
 *      refreshToken: string
 * /api/v1/auth/register-user:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to register a new regular user
 *    produces:
 *      - application/json
 *    parameters: [{
 *      name: register-user,
 *      in: body,
 *      description: User object,
 *      required: true,
 *      schema: {
 *        $ref: '#/definitions/User'
 *      }
 *    }]
 *    responses:
 *      '200' :
 *        description: Success
 * 
 * 
 */
// User registration route
router.post("/register-user", AUTH.validateNewUser, (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      message: "Request is incorrect",
      errors: errors.array(),
      data: {}
    })
  }

  AUTH.registerUser(req.body)
    .then(user => {
      const token = TOKEN.createToken(user)
      const expiresIn = TOKEN.getExpiresIn(token)

      TOKEN.createRefreshToken(user._id)
        .then(refreshToken => {
          return res.json({
            status: 200,
            message: "User created",
            data: {
              "username": user.username,
              "userID": user._id,
              "flag": user.flag,
              "played": user.played,
              "won": user.won,
              "lost": user.lost,
              "accessToken": token,
              "refreshToken": refreshToken.token,
              expiresIn
            }
          })
          // FUNCTION TO SEND ACTIVATION EMAIL
          // const activationLink = EMAIL.generateActivationLink(user)
          // EMAILBODY.email.completeRegistration(activationLink)
          // .then(emailBody => {
          //   EMAIL.sendEmail(user.email, `Welcome ${user.username} Issue.Trakr`, emailBody)
          //   .then(() => {
          //     console.log("Email Notification sent!")
          //   })
          //   .catch(err => {
          //     console.log(err)
          //   })

          // })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err._message,
            error: err.message
          })
        })
    })
    .catch(err => {
      if (err.errors.email.message) {
        return res.json({
          status: 400,
          message: err.errors.email.message,
          error: err.message
        })
      }
      return res.json({
        status: 400,
        message: err._message,
        error: err.message
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/register-admin:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to register a new admin user
 *    produces:
 *      - application/json
 *    parameters: [{
 *      name: register-admin,
 *      in: body,
 *      description: User object,
 *      required: true,
 *      schema: {
 *        $ref: '#/definitions/User'
 *      }
 *    }]
 *    responses:
 *      '200' :
 *        description: Success
 */
// Admin registration route
router.post("/register-admin", AUTH.validateNewUser, (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      message: "Request is incorrect",
      errors: errors.array(),
      data: {}
    })
  }

  AUTH.registerAdmin(req.body)
    .then(user => {
      const token = TOKEN.createToken(user)
      const expiresIn = TOKEN.getExpiresIn(token)

      TOKEN.createRefreshToken(user._id)
        .then(refreshToken => {
          const activationLink = EMAIL.generateActivationLink(user)
          EMAILBODY.email.completeRegistration(activationLink)
            .then(emailBody => {
              EMAIL.sendEmail(user.email, `Welcome ${user.username} Issue.Trakr`, emailBody)
                .then(() => {
                  console.log("Email Notification sent!")
                })
                .catch(err => {
                  console.log(err)
                })
              return res.json({
                status: 200,
                message: "User created",
                data: {
                  "flag": user.flag,
                  "userID": user._id,
                  "accessToken": token,
                  "refreshToken": refreshToken.token,
                  expiresIn
                }
              })
            })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err._message,
            error: err.message
          })
        })
    })
    .catch(err => {
      return res.json({
        status: 400,
        message: err._message,
        error: err.message
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/register-superadmin:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to register a new super admin
 *    produces:
 *      - application/json
 *    parameters: [{
 *      name: register-user,
 *      in: body,
 *      description: User object,
 *      required: true,
 *      schema: {
 *        $ref: '#/definitions/User'
 *      }
 *    }]
 *    responses:
 *      '200' :
 *        description: Success
 */

// User registration route
router.post("/register-superadmin", AUTH.validateNewUser, (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      message: "Request is incorrect",
      errors: errors.array(),
      data: {}
    })
  }

  AUTH.registerSuperAdmin(req.body)
    .then(user => {
      const token = TOKEN.createToken(user)
      const expiresIn = TOKEN.getExpiresIn(token)

      TOKEN.createRefreshToken(user._id)
        .then(refreshToken => {
          const activationLink = EMAIL.generateActivationLink(user)
          EMAILBODY.email.completeRegistration(activationLink)
            .then(emailBody => {
              EMAIL.sendEmail(user.email, `Welcome ${user.username} Issue.Trakr`, emailBody)
                .then(() => {
                  console.log("Email Notification sent!")
                })
                .catch(err => {
                  console.log(err)
                })
              return res.json({
                status: 200,
                message: "User created",
                data: {
                  "userID": user._id,
                  "accessToken": token,
                  "refreshToken": refreshToken.token,
                  expiresIn
                }
              })
            })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err._message,
            error: err.message
          })
        })
    })
    .catch(err => {
      return res.json({
        status: 400,
        message: err._message,
        error: err.message
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/login:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to log a user in and generate access and refresh token
 *    produces:
 *      - application/json
 *    parameters: [{
 *      name: login-user,
 *      in: body,
 *      description: Login object,
 *      required: true,
 *      schema: {
 *        $ref: '#/definitions/Login'
 *      }
 *    }]
 *    responses:
 *      '200' :
 *        description: Success
 */

router.post("/login", AUTH.loginValidator, (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      message: "Request is incorrect",
      errors: errors.array(),
      data: {}
    })
  }

  AUTH.findByEmail(req.body.email).then(user => {
    // If no user with that email is found
    if (!user) {
      return res.json({
        status: 400,
        message: "User does not exist",
        data: {}
      })
    }

    if (user.attempts === 3) {
      // FUNCTION TO SEND PASSWORD RESET EMAIL
      const passwordResetLink = EMAIL.generateResetPasswordLink(user)
      EMAILBODY.email.resetPassword(passwordResetLink)
        .then(emailBody => {
          EMAIL.sendEmail(user.email, `Reset you Issue trakr password ${user.username}`, emailBody)
            .then(() => {
              return res.json({
                status: 400,
                message: "Your account has been locked. A reset password link has been sent to your email. ",
                data: {}
              })
            })
            .catch(err => {
              console.log(err)
            })
        })
      return
    }

    AUTH.login({
      user: req.body,
      hash: user.hash
    }).then(status => {
      if (!status) {
        if (user.attempts < 3) {
          user.attempts += 1
          AUTH.updateUser(user)
            .then(doc => {
              return res.json({
                status: 400,
                message: "Wrong details",
                data: {}
              })
            })
            .catch(err => {
              return res.json({
                status: 500,
                message: err._message,
                error: err.message
              })
            })
        }
        return
      }

      const token = TOKEN.createToken(user)
      const expiresIn = TOKEN.getExpiresIn(token)
      TOKEN.createRefreshToken(user._id).then(refreshToken => {
        return res.json({
          status: 200,
          message: "User logged in",
          data: {
            "username": user.username,
            "userID": user._id,
            "flag": user.flag,
            "played": user.played,
            "won": user.won,
            "lost": user.lost,
            "accessToken": token,
            "refreshToken": refreshToken.token,
            expiresIn
          }
        })
      }).catch(err => {
        return res.json({
          status: 500,
          message: err._message,
          error: err.message
        })
      })
    })
  }).catch(err => {
    return res.json({
      status: 500,
      message: err._message,
      error: err.message
    })
  })
})

/** 
 * @swagger
 * /api/v1/auth/logout:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to log a user out
 *    produces:
 *      - application/json
 *    parameters: [{
 *      name: logout-user,
 *      in: body,
 *      description: Logout object,
 *      required: true,
 *      schema: {
 *        $ref: '#/definitions/Logout'
 *      }
 *    }]
 *    responses:
 *      '200' :
 *        description: Success
 */

router.post("/logout", TOKEN.verify, (req, res) => {
  AUTH.findByEmail(req.body.email).then(user => {
    TOKEN.refresh.delete({
        user: user._id
      })
      .then(() => {
        return res.json({
          status: 200,
          message: "User logged out!",
          data: {}
        })
      })
  }).catch(err => {
    return res.json({
      status: 500,
      message: err._message,
      error: err.message
    })
  })
})

/** 
 * @swagger
 * /api/v1/auth/changepassword:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to change a users password
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: change password,
 *        in: body,
 *        description: Change password object,
 *        required: true,
 *        schema: {
 *          $ref: '#/definitions/ChangePassword'
 *        }
 *      },
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/changepassword", TOKEN.verify, AUTH.changePasswordValidator, (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.json({
      status: 400,
      message: "Request is incorrect",
      errors: errors.array(),
      data: {}
    })
  }

  const userDetails = TOKEN.getTokenData(req.header("Authorization"))

  AUTH.findByUserID(userDetails.userID).then(user => {
    if (!user) {
      return res.json({
        status: 400,
        message: "Wrong details",
        data: {}
      })
    }

    AUTH.comparePasswords({
      one: req.body.currentpassword,
      two: user.hash
    }).then(password => {
      if (!password) {
        return res.json({
          status: 400,
          message: "Wrong details",
          data: {}
        })
      }
      const newPassword = {
        newPassword: req.body.newpassword,
        userID: user._id
      }
      AUTH.changePassword(newPassword).then(() => {
          return res.json({
            status: 200,
            message: "Password changed",
            data: {
              userID: user._id
            }
          })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err.message,
            data: {}
          })
        })
    })
  })
})

/** 
 * @swagger
 * /api/v1/auth/forgotpassword:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to reset a users password through email notification
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: Forgot password,
 *        in: body,
 *        description: Forgot password,
 *        required: true,
 *        schema: {
 *          $ref: '#/definitions/ForgotPassword'
 *        }
 *      },
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/resetpassword", (req, res) => {
  const userID = req.body._id
  const password = req.body.password

  AUTH.findByUserID(userID).then(user => {
    if (!user) {
      return res.json({
        status: 400,
        message: "Wrong details",
        data: {}
      })
    }

    const newPassword = {
      newPassword: password,
      userID
    }
    AUTH.changePassword(newPassword)
      .then(() => {
        user.attempts = 0
        AUTH.updateUser(user)
          .then(doc => {
            return res.json({
              status: 200,
              message: "Password changed",
              data: {
                userID: user._id
              }
            })
          })
          .catch(err => {
            return res.json({
              status: 500,
              message: err._message,
              error: err.message
            })
          })
      })
      .catch(err => {
        return res.json({
          status: 500,
          message: err.message,
          data: {}
        })
      })
  })
})

/** 
 * @swagger
 * /api/v1/auth/refreshtoken:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to refresh token
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: refreshToken,
 *        in: body,
 *        description: Refresh token obj,
 *        required: true,
 *        schema: {
 *          $ref: '#/definitions/RefreshToken'
 *        }
 *      },
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/refreshtoken", TOKEN.verify, (req, res) => {
  const userDetails = TOKEN.getTokenData(req.header("Authorization"))
  AUTH.findByUserID(userDetails.userID).then(user => {
      const refreshtoken = req.body.refreshToken

      TOKEN.findRefreshToken({
        userID: user._id,
        refreshtoken
      }).then(found => {
        if (!found) {
          return res.json({
            status: 400,
            message: "Incorrect token",
            data: {}
          })
        }
        if (refreshtoken !== found.token) {
          return res.json({
            status: 400,
            message: "Invalid refresh token",
            data: {}
          })
        }

        const token = TOKEN.createToken(user)
        const expiresIn = TOKEN.getExpiresIn(token)

        TOKEN.createRefreshToken(user._id).then(refreshToken => {
          res.json({
            status: 200,
            message: "Token refreshed",
            data: {
              "accessToken": token,
              "refreshToken": refreshToken.token,
              expiresIn
            }
          })
        }).catch(err => {
          return res.json({
            status: 500,
            message: "Internal server error. Try again.",
            error: err.message,
            data: {}
          })
        })
      })
    })
    .catch(err => {
      return res.json({
        status: 500,
        message: err.message,
        data: {}
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/edit:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to edit user details
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: refreshToken,
 *        in: body,
 *        description: user obj,
 *        required: true,
 *        schema: {
 *          $ref: '#/definitions/User'
 *        }
 *      },
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/edit", TOKEN.verify, (req, res) => {
  const userDetails = TOKEN.getTokenData(req.header("Authorization"))
  AUTH.findByUserID(userDetails.userID)
    .then(user => {
      for (let [key, value] of Object.entries(req.body)) {
        user[key] = req.body[key]
      }

      AUTH.updateUser(user)
        .then(savedUser => {
          return res.json({
            status: 200,
            message: "User updated",
            data: {
              username: savedUser.username
            }
          })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err.message,
            data: {}
          })
        })
    })
    .catch(err => {
      return res.json({
        status: 500,
        message: err.message,
        data: {}
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/deactivate:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to deactivate user
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/deactivate", TOKEN.verify, (req, res) => {
  const userDetails = TOKEN.getTokenData(req.header("Authorization"))
  AUTH.findByUserID(userDetails.userID)
    .then(user => {
      user.flag = 2

      AUTH.updateUser(user)
        .then(savedUser => {
          return res.json({
            status: 200,
            message: "User deactivated",
            data: {}
          })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err.message,
            data: {}
          })
        })
    })
    .catch(err => {
      return res.json({
        status: 500,
        message: err.message,
        data: {}
      })
    })
})

router.get("/activate", (req, res) => {
  const link = _.getDataFromURL(req.originalUrl)
  const userID = _.decodeJSON(link).userID

  AUTH.findByUserID(userID)
    .then(user => {
      user.flag = 1

      AUTH.updateUser(user)
        .then(savedUser => {
          // SEND THE USER TO THE FRONT END PAGE
          return res.json({
            status: 200,
            message: "User activated. Send user to front end page",
            data: {}
          })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err.message,
            data: {}
          })
        })
    })
    .catch(err => {
      return res.json({
        status: 500,
        message: err.message,
        data: {}
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/remove:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to remove a user
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/remove", TOKEN.verify, (req, res) => {
  const userDetails = TOKEN.getTokenData(req.header("Authorization"))
  TOKEN.refresh.delete({
      user: userDetails.userID
    })
    .then(() => {
      AUTH.deleteUser(userDetails.userID)
        .then(() => {
          return res.json({
            status: 200,
            message: "User removed",
            data: {}
          })
        })
        .catch(err => {
          return res.json({
            status: 500,
            message: err.message,
            data: {}
          })
        })
    })
    .catch(err => {
      return res.json({
        status: 500,
        message: err.message,
        data: {}
      })
    })
})

/** 
 * @swagger
 * /api/v1/auth/details:
 *  post:
 *    tags: ["Authentication"]
 *    description: Endpoint to get user details
 *    produces:
 *      - application/json
 *    parameters: [
 *      {
 *        name: email,
 *        in: body,
 *        description: user email,
 *        required: true
 *      },
 *      {
 *        name: accessToken,
 *        in: header,
 *        description: Access token,
 *        required: true
 *      },
 *    ]
 *    responses:
 *      '200' :
 *        description: Success
 */
router.post("/details", TOKEN.verify, (req, res) => {
  AUTH.findByEmail(req.body.email)
    .then(user => {
      if (!user) {
        return res.json({
          status: 400,
          message: "User doesnt exist",
          data: {}
        })
      }
      return res.json({
        status: 200,
        message: "User details",
        data: {
          username: user.username,
          email: user.email,
          createdOn: user.createdAt,
          updatedOn: user.updatedAt,
          flag: user.flag,
          role: user.role,
          userID: user._id
        }
      })
    })
    .catch(err => {
      return res.json({
        status: 500,
        message: err.message,
        data: {}
      })
    })
})

module.exports = router