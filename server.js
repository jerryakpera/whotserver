const config = require('./config');
const app = require('./app.js');

const db = require('./db/db');
// const port = config.port;
const port = provess.env.PORT;

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
const _game = require('./services/game/game');
const game = require('./services/game/game');

var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
  // A user hosts a game
  socket.on('hostNewGame', (newGame) => {
    const game = _game.createGame(newGame)
    
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
    const joinedGame = game.joinGame(data)
    
    if (!joinedGame) return
    
    // If the game is complete and can be started
    if (joinedGame.players.length === joinedGame.totalPlayers) {
      socket.broadcast.emit('gameStarting', joinedGame);
      socket.emit('gameStarting', joinedGame);
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
});

// SOCKET COMMANDS

// Send to the client
// socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

// sending to all clients except sender
// socket.broadcast.emit('broadcast', 'hello friends!');