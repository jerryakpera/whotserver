const User = require("../../db/models/User/index")

function changeScores(users) {
    users.forEach(user => {
        User.updateOne({_id: user.id}, user, (err, doc) => {
            if (err) {
                console.log(0, err)
            }
            console.log(1, doc)
        })
    })
}


module.exports = {
    changeScores
}