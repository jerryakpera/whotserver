const _cards = require("./cards");
const _utils = require("../utils");
const game = require("./game");

function pickMarket(game) {
    return new Promise((resolve, reject) => {
        const currentPlayer = game.players[game.currentPlayer]

        const picked = pickCards(currentPlayer.cards, game.market, game.pick.no)

        game.players[game.currentPlayer].cards = [ ...picked.playerCards ]
        game.market = [ ...picked.market ]
        nextPlayer(game)
        resolve(game)
    });
}

// HELPA FANCTIOS
function pickCards(playerCards, market, noOfCards) {
    const cardsToPick = market.splice(0, noOfCards)

    playerCards = [...playerCards, ...cardsToPick]

    return {
        playerCards, 
        market
    }
}

function playCards(game, selectedCards) {
    return new Promise((resolve, reject) => {
        const fullDeck = _cards.fullDeck
        const {playedCards, lastPlayedCard} = _utils.getPlayedCards(fullDeck, selectedCards)
        const currentPlayer = game.players[game.currentPlayer]
    
        // Get Mistakes from last played card
        _utils.getMistakes(game, lastPlayedCard)
        .then(() => {
            
            // Check for next play
            _utils.getNextPlay(game, playedCards)
            .then(({game, played}) => {
                if (played.action === "game continue") {
                    // Set lastPlayedCards
                    dropCards(game, playedCards)
    
                    // Set playing card as the last card picked
                    setPlayingCard(game, played.newPlayingCard)

                    // Remove cards from player
                    removeCardsFromPlayer(game, selectedCards);

                    // Clear game attributes
                    resetGameAttributes(game)
                    
                    // Next player
                    nextPlayer(game)
    
                    resolve(game)
                }
            })
    
            // Remove played cards from the players cards
            // console.log("Current player", currentPlayer)
    
            // Set the last played cards of the game to the played cards in that order
    
            // Set the last move
    
            // Next player
            // console.log(0, "No mistake found")
        })
        .catch(() => {
            console.log(0, "MISTAKE!!!")
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

// Remove Change the current playing card
function setPlayingCard(game, card) {
    game.playingCard = card;
}

// Drop played cards to game played cards
function dropCards(game, cards) {
    game.lastPlayedCard = [...cards];
}

module.exports = {
    pickMarket,
    playCards
}