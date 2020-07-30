const User = require("../../db/models/User/index")

function updatePlayerScores(playerScores) {
    playerScores.forEach(player => {
        User.findOne({ _id: player.id }, (err, doc) => {
            doc.played = player.played
            doc.won = player.won
            doc.lost = player.lost
            doc.save();
        });
    })
}


module.exports = {
    updatePlayerScores
}