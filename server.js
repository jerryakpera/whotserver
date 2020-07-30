const config = require('./config');
const app = require('./app.js');

const ENV = require("./config/env")

const db = require('./db/db');
const port = ENV === "dev" ? process.env.PORT : config.port;

const _cards = require("./services/game/cards")
const _scores = require("./services/game/scores")
const _play = require("./services/game/play")
const _game = require('./services/game/game');
const game = require('./services/game/game');

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on('uncaughtException', (err) =>
  console.log('uncaught exception', err)
);
process.on('unhandledRejection', (error) =>
  console.log('unhandled rejection', error)
);

// GAME SOCKET SERVER

var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
  socket.on("disconnect", () => {
    _game.removeEmptyGames()

    const playerGameExists = _game.checkForPlayer(socket.id)

    if (!playerGameExists) return

    const gameLeft = _game.removePlayer(socket.id)
    socket.broadcast.emit("playerLeft", gameLeft[0]);
  })

  // A user hosts a game
  socket.on('hostNewGame', (newGame) => {
    const game = _game.createGame(newGame)
    
    socket.join(game.game.id, () => {
      // Send back the game to the
      socket.emit('gameHosted', game);

      // Send all games to the user when a new game is hosted
      const games = _game.getOpenGames()
      socket.broadcast.emit('openGames', games);
    })
  });
  
  // A user asks for all the open games
  socket.on("fetchOpenGames", () => {
    const games = _game.getOpenGames()
    socket.emit('openGames', games);
  })
  
  socket.on("joinGame", data => {
    _game.playerAlreadyExists(data.gameID, data.player.id)
    .then(() => {
      // Player joins game
      socket.join(data.gameID, () => {
        // Player is added to game
        const joinedGame = _game.joinGame(data, socket.id)
        
        if(joinedGame.players.length === joinedGame.totalPlayers) {
          // If all players are joined
          const scoreObj = {
            gameID: joinedGame.game.id,
            players: joinedGame.players
          }
    
          scoreCard = _scores.createScores(scoreObj)
    
          const shuffledGame = _cards.shareCards(joinedGame)
    
          shuffledGame.scoreCard = scoreCard

          io.in(data.gameID).emit('gameStarting', shuffledGame);
        } else {
          // If the players are not complete send game back to all players in game room
          
          socket.emit('playerJoined', joinedGame);
          socket.broadcast.emit('newPlayerJoined', joinedGame);

          // io.in(data.gameID).emit('message', 'cool game');
        }

        // Gets updated list of all games
        const games = _game.getOpenGames()
        // Sends updated list to all clients
        socket.broadcast.emit('openGames', games);
      })
    })
    .catch(() => {
      return
    })
  })
  
  socket.on("leaveGame", data => {
    const gameLeft = _game.leaveGame(data)
    
    if (!gameLeft) {
      const games = _game.getOpenGames()
      socket.emit('gameClosed', games);
      socket.broadcast.emit('gameClosed', games);
      return
    }
    
    socket.emit('playerLeft');
    socket.broadcast.emit('playerLeft', gameLeft);

    // Gets updated list of all games
    const games = _game.getOpenGames()
    // Sends updated list to all clients
    socket.broadcast.emit('openGames', games);
  })
  
  socket.on("pickMarket", game => {
    _play.pickMarket(game)
    .then(pickedGame => {
      if (pickedGame.status === "over") {
        io.in(pickedGame.game.id).emit('gameOver', pickedGame);
        return
      }

      io.in(pickedGame.game.id).emit('gameContinue', pickedGame);
    })
  })

  socket.on("playCards", data => {
    const selectedCards = data.selectedCards
    const game = data.game

    _play.playCards(game, selectedCards)
    .then(playedGame => {
      if (playedGame.whot.state && playedGame.whot.shape === "") {
        socket.emit('selectShape', playedGame);
        socket.broadcast.emit('gameContinue', playedGame);
      } else {
        socket.emit('gameContinue', playedGame);
        socket.broadcast.emit('gameContinue', playedGame);
      }
    })
  })

  socket.on("shapeSelected", game => {
    _play.setWhotShape(game)
    .then(whotGame => {
      socket.emit('gameContinue', whotGame);
      socket.broadcast.emit('gameContinue', whotGame);
    })
  })

  socket.on("sendMessage", ({player, gameID, message}) => {
    const msg = {
      player,
      message
    }
    io.in(gameID).emit('receiveMsg', msg);
  })

  socket.on("shoutLastCard", shout => {
    // Add shout to a game shouts array
    _game.lastCardShout(shout)
    .then(gameShout => {
      // socket.emit('broadcastShout', shout)
      // socket.broadcast.emit('broadcastShout', shout)

      socket.emit('updateShouts', gameShout)
      socket.broadcast.emit('updateShouts', gameShout)
    })
    .catch(gameShout => {
      socket.emit('updateShouts', gameShout)
      socket.broadcast.emit('updateShouts', gameShout)
    })
  })
});