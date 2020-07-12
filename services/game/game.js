const uniqid = require("uniqid")
const _cards = require("./cards")
const _ = require("../utils")

const games = []

function createGame(data, socketID) {
  const player = {
    ...data.player,
    socketID,
    cards: [],
    shouts: []
  }

  // Create new game
  const newGame = {
    currentPlayer: 0,
    playingCard: null,
    whot: {
      state: false,
      shape: ""
    },
    pickThree: {
      state: false,
      pick: 0,
    },
    players: [],
    // Fill the game market
    market: [..._cards.shuffleDeck()],
    game: {
      id: uniqid(),
      ...data.game,
    },
    createdAt: _.formatDate(new Date()),
    lastMove: "",
    playedCards: "",
    totalPlayers: data.game.totalPlayers,
    noOfCards: data.game.noOfCards
  }

  newGame.players.push(player)
  games.push(newGame)

  return newGame
}

function getOpenGames() {
  const openGames = []

  games.forEach(game => {
    if (!game.game.private) {
      openGames.push({
        id: game.game.id,
        name: game.game.name,
        totalPlayers: game.totalPlayers,
        mistakes: game.game.mistakes,
        createdAt: game.createdAt,
        activePlayers: game.players.length
      })
    }
  })

  return openGames
}

function joinGame(data, socketID) {
  const player = {
    ...data.player,
    socketID,
    cards: [],
    shouts: []
  }

  const index = games.findIndex(game => game.game.id === data.gameID)

  if (index < 0) return false
  else {
    const joinedGame = games[index]
    joinedGame.players.push(player)

    return joinedGame
  }
}

function leaveGame(data) {
  const game = games.find(game => game.game.id === data.gameID)
  
  const gameIndex = games.findIndex(game => game.game.id === data.gameID)

  const playerIndex = game.players.findIndex(player => player.id === data.playerID)

  game.players.splice(playerIndex, 1)

  if (game.players.length === 0) {
    games.splice(gameIndex, 1)
    return
  } else {
    return game
  }
}

function checkForPlayer(socketID) {
  let playerExists = false

  games.forEach(game => {
    const playerIndex = game.players.findIndex(player => {
      if (player.socketID === socketID) playerExists = true
    })
  })

  return playerExists
}

function removePlayer(socketID) {
  const gameLeft = games.map(game => {
    const playerIndex = game.players.findIndex(player => player.socketID === socketID)

    game.players.splice(playerIndex, 1)

    return game
  })

  return gameLeft
}


module.exports = {
  createGame,
  getOpenGames,
  joinGame,
  leaveGame,
  removePlayer,
  checkForPlayer
}