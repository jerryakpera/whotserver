const _cards = require("./cards");
const _utils = require("../utils");
const game = require("./game");
const cards = require("./cards");

const shouts = []

function shout(shoutObj) {
    return new Promise((resolve, reject) => {
        const shoutIndex = shouts.findIndex(shout => shout.gameID == shoutObj.gameID)
    
        if (shoutIndex < 0) {
            const newShout = {
                gameID: shoutObj.gameID,
                shouts: [ shoutObj.playerID ]
            }
            shouts.push(newShout)
        } else {
            const gameShout = shouts[shoutIndex]
    
            const playerShoutIndex = gameShout.shouts.findIndex(player => player === shoutObj.playerID)
    
            if (playerShoutIndex < 0) {
                gameShout.shouts.push(shoutObj.playerID)
            } else {
                gameShout.shouts.splice(playerShoutIndex, 1)
            }
        }

        resolve()
    })
}

function getGameShouts(gameID) {
    return new Promise((resolve, reject) => {
        const gameShout = shouts.find(shout => shout.gameID === gameID)

        resolve(gameShout)
    })
}

function pickMarket(game) {
    return new Promise((resolve, reject) => {
        const currentPlayer = game.players[game.currentPlayer]
        if (game.pick.type === "market") {
            game.lastMove = `${currentPlayer.name} went to the market`
        } else {
            game.lastMove = `${currentPlayer.name} picked ${game.pick.no}`
        }
        pickCards(game, game.pick.no)
        .then(pickedGame => {
            game.pick = {
                type: "market",
                no: 1
            }
            nextPlayer(pickedGame)
            resolve(pickedGame)
        })
    });
}

// HELPA FANCTIOS
function pickCards(game, noOfCards) {
    return new Promise((resolve, reject) => {
        let playerCards = game.players[game.currentPlayer].cards
        const market = game.market
        const cardsToPick = market.splice(0, noOfCards)
    
        game.players[game.currentPlayer].cards = [...playerCards, ...cardsToPick]
    
        resolve(game)
    })
}

// General market function
function generalMarket(game, played) {
    return new Promise((resolve, reject) => {
        // Get current player
        const currentPlayer = game.players[game.currentPlayer]
        
        game.players.forEach((player) => {
            if (currentPlayer.id != player.id) {
                const cardsFromMarket = game.market.splice(0, game.pick.no)

                player.cards = [...player.cards, ...cardsFromMarket]
            }
        })
        
        resolve(game)
    })
}

function setWhotShape(game) {
    return new Promise((resolve, reject) => {
        nextPlayer(game)
        game.lastMove = `I need ${game.whot.shape}`
        resolve(game)
    })
}

function playCards(game, selectedCards) {
    return new Promise((resolve, reject) => {
        const fullDeck = _cards.fullDeck
        const {playedCards, lastPlayedCard} = _utils.getPlayedCards(fullDeck, selectedCards)
        const finalPlayedCard = playedCards[playedCards.length - 1]
        const currentPlayer = game.players[game.currentPlayer]
    
        // Get Mistakes from last played game
        _utils.getMistakes(game, lastPlayedCard)
        .then(() => {
            // No mistakes
            // Get next play
            _utils.getNextPlay(game, playedCards)
            .then(returnPlay => {
                const playedGame = returnPlay.game
                const played = returnPlay.played
                // Change playing card
                setPlayingCard(playedGame, finalPlayedCard)
                // Remove cards from player
                removeCardsFromPlayer(playedGame, selectedCards)
                // Set last played cards
                setLastPlayedCards(game, playedCards)

                if (game.whot.shape != "") {
                    game.whot = {
                        state: false,
                        shape: ""
                    }
                }
                
                if (played.action === "pick three") {
                    // Set last move
                    playedGame.lastMove = `Pick ${playedGame.pick.no}`

                    // Next player
                    nextPlayer(playedGame)

                    // Return game to server
                    resolve(playedGame)
                    return
                }
                
                if (played.action === "pick two") {
                    // Set last move
                    playedGame.lastMove = `Pick ${playedGame.pick.no}`

                    // Next player
                    nextPlayer(playedGame)

                    // Return game to server
                    resolve(playedGame)
                    return
                }
                
                if (played.action === "general market") {
                    // Set last move
                    playedGame.lastMove = `General market ${playedGame.pick.no}`

                    // General market
                    generalMarket(playedGame, played)
                    .then(pickedGame => {
                        resolve(pickedGame)
                        return
                    })
                }
                
                if (played.action === "hold on") {
                    // Set last move
                    playedGame.lastMove = `Hold on`

                    // Return game to server
                    resolve(playedGame)
                    return
                }
                
                if (played.action === "suspension") {
                    // Set last move
                    playedGame.lastMove = `Suspension`

                    for (let i = 0; i < playedGame.players.length; i ++) {
                        nextPlayer(playedGame)
                    }
                    // Return game to server
                    resolve(playedGame)
                    return
                }
                
                if (returnPlay.played.action === "whot") {
                    // Set last move
                    playedGame.lastMove = `I need . . . !`

                    // Return game to server
                    resolve(playedGame)
                    return
                }

                if (played.action === "game continue") {
                    // Ensure that player ID is present in shouts
                    const playerShoutIndex = playedGame.shouts.findIndex(shout => shout.playerID === currentPlayer.id)

                    if (playerShoutIndex >= 0) {
                        // console.log(0)
                        // Ensure that card played is not whot
                        if (playedCards[0].no != 20) {
                            // console.log(currentPlayer.cards)
                            if (currentPlayer.cards.length === 0) {
                                // console.log(2)
                                resolve("GameOver")
                                return
                            }
                        }
                    }
                    
                    resetGameAttributes(playedGame)
                    nextPlayer(playedGame)
                    resolve(playedGame)
                }
            })
        })
        .catch(() => {
            // Check for mistakes

            // If the player is to pick three
            if (game.pick.type == "three" || game.pick.type === "two") {
                let cardsToPick = game.pick.no

                if (game.game.mistakes) {
                    cardsToPick = game.pick.no
                }

                pickCards(game, cardsToPick)
                .then(pickedGame => {
                    pickedGame.lastMove = `${currentPlayer.name} picked for mistake`
                    nextPlayer(pickedGame)
                    resolve(pickedGame)
                    return
                })
            }

            if (game.game.mistakes) {
                pickCards(game, 2)
                .then(pickedGame => {
                    if (!game.whot.state) {
                        resetGameAttributes(pickedGame)
                    }
                    nextPlayer(pickedGame)
                    resolve(pickedGame)
                    return
                })
            }
        })
    })
}

function nextPlayer(game) {
    if (game.currentPlayer == game.totalPlayers - 1) game.currentPlayer = 0;
    else game.currentPlayer++;
}

function resetGameAttributes(game) {
    // Clear Whot!
    game.whot = ""
    
    // Clear Pick
    game.pick = {
        type: "market",
        no: 1
    }

    // Clear suspend
    game.suspend = {
        type: "suspension",
        players: 1
    }

    game.lastMove = "Game continue"
}

// Remove cards after play
function removeCardsFromPlayer(game, selectedCards) {
    const currentPlayer = game.players[game.currentPlayer];
    const playerCards = [];
  
    currentPlayer.cards.forEach((card) => {
      if (!selectedCards.includes(card.id)) playerCards.push(card);
    });
  
    game.players[game.currentPlayer].cards = [...playerCards];
}

// Set current playing card
function setPlayingCard(game, card) {
    game.playingCard = card;
}

// Remove Change the current playing card
function setLastPlayedCards(game, cards) {
    game.lastPlayedCards = [];
    game.lastPlayedCards = [ ...cards ];
}

module.exports = {
    pickMarket,
    playCards,
    setWhotShape,
    shout,
    getGameShouts
}