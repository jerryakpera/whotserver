module.exports = {
  email: {
    completeRegistration(link) {
      return new Promise((resolve, reject) => {
        resolve({
          html: `
            <a href="http://localhost:3002/api/v1/auth/activate?link=${link}">Activate account</a>
          `
        })
      })
    },
    resetPassword(link) {
      return new Promise((resolve, reject) => {
        resolve({
          html: `
            <a href="http://localhost:8080/resetpassword?link=${link}">Reset password</a>
          `
        })
      })
    },
  }
}

