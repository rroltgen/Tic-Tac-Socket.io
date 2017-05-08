var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;

class TicTacToe {
	constructor(gameID){
		this.whoseTurn = "X";
		this.gameOver = false;
		this.gameID = gameID;
		this.players = [];
		this.board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
	}

	changeTurn(){
		if(this.whoseTurn == "X"){
			this.whoseTurn = "O";
		}else{
			this.whoseTurn = "X";
		}
	}

	checkGameOver(){
		var cell1 = this.board[0];
		var cell2 = this.board[1];
		var cell3 = this.board[2];
		var cell4 = this.board[3];
		var cell5 = this.board[4];
		var cell6 = this.board[5];
		var cell7 = this.board[6];
		var cell8 = this.board[7];
		var cell9 = this.board[8];
		if((cell1 == "X" && cell4 == "X" && cell7 == "X") || (cell2 == "X" && cell5 == "X" && cell8 == "X") || (cell3 == "X" && cell6 == "X" && cell9 == "X") ||
		  (cell1 == "X" && cell2 == "X" && cell3 == "X") || (cell4 == "X" && cell5 == "X" && cell6 == "X") || (cell7 == "X" && cell8 == "X" && cell9 == "X") ||
		  (cell1 == "X" && cell5 == "X" && cell9 == "X") || (cell3 == "X" && cell5 == "X" && cell7 == "X"))
		{
		  this.gameOver = true;
		  this.players[0].emit("game over", {"winner": "X"});
		  this.players[1].emit("game over", {"winner": "X"});
		}
		else if((cell1 == "O" && cell4 == "O" && cell7 == "O") || (cell2 == "O" && cell5 == "O" && cell8 == "O") || (cell3 == "O" && cell6 == "O" && cell9 == "O")
		  || (cell1 == "O" && cell2 == "O" && cell3 == "O") || (cell4 == "O" && cell5 == "O" && cell6 == "O") || (cell7 == "O" && cell8 == "O" && cell9 == "O") 
		  || (cell1 == "O" && cell5 == "O" && cell9 == "O") || (cell3 == "O" && cell5 == "O" && cell7 == "O"))
		{
		  this.gameOver = true;
		  this.players[0].emit("game over", {"winner": "O"});
		  this.players[1].emit("game over", {"winner": "O"});
		}

		var testGameOver = true;
		for(var i = 0; i < 9; i++){
		  if(this.board[i] == " "){
		      testGameOver = false;
		  }
		}
		if(testGameOver == true){
		  this.gameOver = true;
		  this.players[0].emit("game over", {"winner": "no one"});
		  this.players[1].emit("game over", {"winner": "no one"});
		}

		return this.gameOver;
	}
}

var games = [];
var id = 0;

http.listen(port, function(){
  console.log('listening on *:' + port);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  console.log("trying to connect");

  if(games.length == 0){
  	var newGame = new TicTacToe(id);
  	games.push(newGame);
  	games[id].players.push(socket);
  	id++;
  	socket.emit('getgame', { gameID: games[id - 1].gameID, whoseTurn: games[id - 1].whoseTurn, mark: "X" });
  }else if(games[id - 1].players.length == 1){
  	games[id - 1].players.push(socket);
  	socket.emit('getgame', { gameID: games[id - 1].gameID, whoseTurn: games[id - 1].whoseTurn, mark: "O" });
  }else if(games[id - 1].players.length == 2){
  	var newGame = new TicTacToe(id);
  	games.push(newGame);
  	games[id].players.push(socket);
  	id++;
  	socket.emit('getgame', { gameID: games[id - 1].gameID, whoseTurn: games[id - 1].whoseTurn, mark: "X" });
  }

  console.log("connected");
  socket.on('turn played', function(data){
  	console.log(data);
  	games[data.gameID].board[data.id - 1] = games[data.gameID].whoseTurn;
  	games[data.gameID].changeTurn();
  	games[data.gameID].checkGameOver()
  	games[data.gameID].players[0].emit('update', { "board": games[data.gameID].board, "whoseTurn": games[data.gameID].whoseTurn, "gameOver": games[data.gameID].gameOver });
	games[data.gameID].players[1].emit('update', { "board": games[data.gameID].board, "whoseTurn": games[data.gameID].whoseTurn, "gameOver": games[data.gameID].gameOver });
	console.log(games[data.gameID].board[0] + games[data.gameID].board[1] + games[data.gameID].board[2]);
	console.log(games[data.gameID].board[3] + games[data.gameID].board[4] + games[data.gameID].board[5]);
	console.log(games[data.gameID].board[6] + games[data.gameID].board[7] + games[data.gameID].board[8]);
  	
  	
    
  });

  socket.on('new game', function(data){
  	games[data].board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
  	games[data].whoseTurn = "X";
  	games[data].gameOver = false;
  	games[data].players[0].emit('update', { "board": games[data].board, "whoseTurn": games[data].whoseTurn, "gameOver": games[data].gameOver });
  	games[data].players[1].emit('update', { "board": games[data].board, "whoseTurn": games[data].whoseTurn, "gameOver": games[data].gameOver });
  });
});