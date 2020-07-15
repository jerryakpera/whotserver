const moment = require('moment');
const play = require('./game/play');

function formatDate(date) {
  return moment(date).format('h:mm:ss a');
}

// Get played cards from selectedcards IDs
function getPlayedCards(deck, selectedCards) {
  const playedCards = []
  selectedCards.forEach(cardID => {
      const playedCard = deck.find(card => card.id === cardID)
  
      playedCards.push(playedCard)
  })
  const lastPlayedCard = playedCards[0]
  return {playedCards, lastPlayedCard}
}

function getMistakes(game, lastPlayedCard) {
  return new Promise((resolve, reject) => {
    const playingCard = game.playingCard

    // If pick three is on and the player did not play 5 then reject it 
    if (game.pick.type === "three") {
      if (lastPlayedCard.no == 5) {
        resolve()
        return
      } else {
        reject()
        return
      }
    }

    // If pick two is on then reject it
    if (game.pick.type === "two") {
      reject()
      return
    }

    // If the current playing card is whot and there is no whot state
    if (!game.whot.state && playingCard.no === 20) {
      resolve()
      return
    }

    // If whot has been asked and the shape matches then resolve
    if (game.whot.state && lastPlayedCard.shape === game.whot.shape) {
      resolve()
      return
    }

    if (lastPlayedCard.no === 20) {
      resolve()
      return
    }

    // If the playing card is 1 then anything goes
    if (playingCard.no === 1) {
      resolve()
      return
    }


    // If the player plays the same shape or number
    if (playingCard.no === lastPlayedCard.no || lastPlayedCard.shape === playingCard.shape) {
      resolve()
      return
    }
    
    console.log("getMistakes end")
    reject()
  })
}

function getNextPlay(game, playedCards) {
  return new Promise((resolve, reject) => {
    const played = {
      no: playedCards.length,
      newPlayingCard: playedCards[playedCards.length - 1],
      action: "game continue",
      pick: 0,
      suspend: 0
    }

    // Pick three
    if (playedCards[0].no === 5) {
      if (game.pick.type === "market") {
        game.pick.type = "three"
        game.pick.no = played.no * 3
      } else if (game.pick.type === "three") {
        game.pick.no += played.no * 3
      }

      played.action = "pick three"
    }

    // Suspension
    if (playedCards[0].no === 8) {
      played.suspend = played.no
      played.action = "suspension"
    }

    // Pick two
    if (playedCards[0].no === 2) {
      game.pick = {
        type: "two",
        no: played.no * 2
      }

      played.action = "pick two"
    }

    // Whot!
    if (playedCards[0].no === 20) {
      game.whot = {
        state: true,
        shape: ""
      }
      played.action = "whot"
    }

    // General market
    if (playedCards[0].no === 14) {
      played.action = "general market"
      game.pick = {
        type: "market",
        no: played.no
      }
    }

    // General market
    if (playedCards[0].no === 1) {
      played.action = "hold on"
    }

    const returnPlay = {
      game,
      played
    }
    
    resolve(returnPlay)
  })
}

module.exports = {
  formatDate,
  getPlayedCards,
  getMistakes,
  getNextPlay,
}