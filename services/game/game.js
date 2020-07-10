const uniqid = require("uniqid")
const _cards = require("./cards")
const _ = require("../utils")

const games = []

function createGame(data) {
  const player = {
    ...data.player,
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
    totalPlayers: data.game.totalPlayers
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

function joinGame(data) {
  const player = {
    ...data.player,
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

module.exports = {
  createGame,
  getOpenGames,
  joinGame,
  leaveGame
}