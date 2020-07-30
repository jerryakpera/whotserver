const uniqid = require("uniqid")
const _cards = require("./cards")
const _ = require("../utils")
const { resolveContent } = require("nodemailer/lib/shared")

const games = []
const shouts = []

function createGame(data) {
  const player = {
    ...data.player,
    cards: [],
  }
  
  // Create new game
  const newGame = {
    shouts: [],
    currentPlayer: 0,
    playingCard: null,
    whot: {
      state: false,
      shape: ""
    },
    pick: {
      type: "market",
      no: 1
    },
    suspend: {
      type: "suspension",
      players: 1
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
    lastPlayedCards: [],
    totalPlayers: data.game.totalPlayers,
    noOfCards: data.game.noOfCards,
    status: "playing"
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
        activePlayers: game.players.length,
        stake: game.game.stake
      })
    }
  })

  return openGames
}

function joinGame(data, socketID) {
  const player = {
    ...data.player,
    socketID,
    cards: []
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

function playerAlreadyExists(gameID, playerID) {
  return new Promise((resolve, reject) => {
    const game = games.find(game => game.game.id === gameID)
    
    if (!game) {
      reject()
      return
    }

    const playerIndex = game.players.findIndex(player => player.id === playerID)

    if (playerIndex < 0) {
      // Player was not found
      resolve()
    } else {
      // Player was found
      reject()
    }
  })
}

function notDuplicatePlayer(gameID, playerID) {
  const game = games.find(game => game.game.id === gameID)

  const playerFound = game.players.find(player => player.id === playerID)

  if (!playerFound) return true
}

function removePlayer(socketID) {
  const gameLeft = games.map(game => {
    const playerIndex = game.players.findIndex(player => player.socketID === socketID)

    game.players.splice(playerIndex, 1)

    return game
  })

  return gameLeft
}

function removeEmptyGames() {
  const emptyGames = []
  games.forEach(game => {
    if(game.players.length === 0) {
      emptyGames.push(game.game.id)
    }
  })

  emptyGames.forEach(gameID => {
    const gameIndex = games.findIndex(game => game.game.id === gameID)

    games.splice(gameIndex, 1)
  })
}

function lastCardShout(playerShout) {
  return new Promise((resolve, reject) => {
    
    const gameShouts = playerShout.gameShouts
    const playerID = playerShout.playerID
    const playerName = playerShout.playerName
    // Check for playerID in game shouts
    const playerShoutIndex = gameShouts.findIndex(shout => shout.playerID === playerID)

    if (playerShoutIndex < 0) {
      const newShout = {
        playerID,
        playerName
      }

      gameShouts.push(newShout)
      resolve(gameShouts)
    } else {
      gameShouts.splice(playerShoutIndex, 1)
      reject(gameShouts)
    }
  })
}

module.exports = {
  createGame,
  getOpenGames,
  joinGame,
  leaveGame,
  removePlayer,
  checkForPlayer,
  removeEmptyGames,
  notDuplicatePlayer,
  lastCardShout,
  playerAlreadyExists,
}