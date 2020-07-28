function createScores(scoreObj) {
    const score = {
        gameID: scoreObj.gameID,
        players: []
    }

    scoreObj.players.forEach(player => {
        score.players.push({
            score: 0,
            id: player.id,
            name: player.name
        })
    })

    return score
}

module.exports = {
    createScores
}