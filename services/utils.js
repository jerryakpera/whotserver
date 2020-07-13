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
    
    if (game.whot.state) {
      if (playingCard.shape === game.whot.shape) {
        resolve()
      } else {
        reject()
      }
      return
    }
    
    if (playingCard.shape === "whot") {
      resolve()
      return
    }
    
    if (playingCard.no === 1) {
      resolve()
      return
    }
    
    if (playingCard.shape === lastPlayedCard.shape) {
      resolve()
      return
    }

    if (playingCard.no === lastPlayedCard.no) {
      resolve()
      return
    }

    reject()
  })
}

function getNextPlay(game, playedCards) {
  return new Promise((resolve, reject) => {
    const played = {
      no: playedCards.length,
      newPlayingCard: playedCards[playedCards.length - 1],
      action: "game continue",
      actionFor: "next",
      pick: 0,
      suspend: 0
    }

    if (playedCards[0].no === 5) {
      if (game.pick.type === "three") {
        game.pick.no === game.pick.no + (played.no * 3)
      } else {
        game.pick = {
          type: "three",
          no: played.no * 3
        }
      }
      game.lastMove = `Pick ${game.pick.no}`
      played.action = "pick three"
    }
    
    if (playedCards[0].no === 14) {
      game.pick.type = "general market"
      game.pick.no = played.no
      
      game.lastMove = `General market! ${game.pick.no}`
      played.action = "general market"
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