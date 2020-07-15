const config = require('./config');
const app = require('./app.js');

const ENV = require("./config/env")

const db = require('./db/db');
const port = ENV === "dev" ? process.env.PORT : config.port;

const _cards = require("./services/game/cards")
const _play = require("./services/game/play")
const _game = require('./services/game/game');

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
    const game = _game.createGame(newGame, socket.id)
    
    socket.join(game.id, () => {
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
    const playerCheck = _game.notDuplicatePlayer(data.gameID, data.player.id)

    if (!playerCheck) return

    const joinedGame = _game.joinGame(data, socket.id)
    
    if (!joinedGame) return
    
    // If the game is complete and can be started
    if (joinedGame.players.length === joinedGame.totalPlayers) {
      const shuffledGame = _cards.shareCards(joinedGame)

      socket.broadcast.emit('gameStarting', shuffledGame);
      socket.emit('gameStarting', shuffledGame);
      return
    } 
    else {
      // If the players are not yet complete
      socket.emit('playerJoined', joinedGame);
      socket.broadcast.emit('newPlayerJoined', joinedGame);
    }
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
  })
  
  socket.on("pickMarket", game => {
    _play.pickMarket(game)
    .then(pickedGame => {
      socket.emit('gameContinue', pickedGame);
      socket.broadcast.emit('gameContinue', pickedGame);
    })
  })

  socket.on("playCards", data => {
    const selectedCards = data.selectedCards
    const game = data.game

    _play.playCards(game, selectedCards)
    .then(playedGame => {
      // console.log("****GAME****")
      // console.log(game.lastPlayedCards)

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
});

// SOCKET COMMANDS

// Send to the client
// socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

// sending to all clients except sender
// socket.broadcast.emit('broadcast', 'hello friends!');