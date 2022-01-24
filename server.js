const net = require("net");
const sockets = [];
const server = net.createServer();

class Board {
    constructor(state = ['', '', '', '', '', '', '', '', '']) {
        this.state = state;
    }

    printFormattedBoard() {
        let formattedString = '';
        this.state.forEach((cell, index) => {
            formattedString += cell ? ` ${cell} |` : ` ${index}  |`;
            if((index + 1) % 3 == 0)  {
                formattedString = formattedString.slice(0,-1);
                if(index < 8) formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
            }
        });
        // console.log('%c' + formattedString, 'color: #6d4e42;font-size:16px');
        return `${formattedString}\n`
    }

    isEmpty() {
        return this.state.every(cell => !cell);
    }
    isFull() {
        return this.state.every(cell => cell);
    }
    isTerminal() {
        //Return False if board in empty
        if(this.isEmpty()) return false;
        //Checking Horizontal Wins
        if(this.state[0] == this.state[1] && this.state[0] == this.state[2] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'H', 'row': 1};
        }
        if(this.state[3] == this.state[4] && this.state[3] == this.state[5] && this.state[3]) {
            return {'winner': this.state[3], 'direction': 'H', 'row': 2};
        }
        if(this.state[6] == this.state[7] && this.state[6] == this.state[8] && this.state[6]) {
            return {'winner': this.state[6], 'direction': 'H', 'row': 3};
        }
        //Checking Vertical Wins
        if(this.state[0] == this.state[3] && this.state[0] == this.state[6] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'V', 'row': 1};
        }
        if(this.state[1] == this.state[4] && this.state[1] == this.state[7] && this.state[1]) {
            return {'winner': this.state[1], 'direction': 'V', 'row': 2};
        }
        if(this.state[2] == this.state[5] && this.state[2] == this.state[8] && this.state[2]) {
            return {'winner': this.state[2], 'direction': 'V', 'row': 3};
        }
        //Checking Diagonal Wins
        if(this.state[0] == this.state[4] && this.state[0] == this.state[8] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'D', 'row': 1};
        }
        if(this.state[2] == this.state[4] && this.state[2] == this.state[6] && this.state[2]) {
            return {'winner': this.state[2], 'direction': 'D', 'row': 2};
        }
        //If no winner but the board is full, then it's a draw
        if(this.isFull()) {
            return {'winner': 'draw'};
        }
        
        //return false otherwise
        return false;
    }

    insert(symbol, position) {
        if(position > 8 || this.state[position]) return false; //Cell is either occupied or does not exist
        this.state[position] = symbol;
        return true;
    }

    getAvailableMoves() {
        const moves = [];
        this.state.forEach((cell, index) => {
            if(!cell) moves.push(index); 
        });
        return moves;
    }
}





const board = new Board();


server.on('connection', function(socket){
	console.log(`Connected by: ${socket.remoteAddress}:${socket.remotePort}`);	
	socket.setEncoding('utf8');
	sockets.push(socket);
    const clients = sockets.length;
    let player1_turn = true 
    let player2_turn = false
    //Check player joining game
    if (clients === 1) {
        sockets[0].write('Wait for player2.....\n'); // === wait for player2 
    } else if (clients === 2) {
        sockets[0].write('>>>> Player2 has joined\n'); 
        sockets[1].write('>>>> Joining game\n');
        for (var i = 0; i < clients; i++) {
            sockets[i].write(board.printFormattedBoard());
        }
        sockets[0].write('>>>> Your turn select postion (0-8):');
        sockets[1].write('>>>> Wait for player1...\n');
    }

    
    socket.on('data', function(data){  //data is message from client
        // Check who sent the message
        if (sockets[0] === socket) {
            for(var i = 0; i < 9; i++) {
                if(data === String(i) + '\n') {
                    board.insert('X', i);
                    if(board.isTerminal()) {
                        const winner = board.isTerminal().winner;
                        sockets[0].write(board.printFormattedBoard());
                        sockets[1].write(board.printFormattedBoard());
                        if(winner === 'X') {
                            sockets[0].write('You Win'); 
                            sockets[1].write('You Lose'); 
                        } else if (winner === 'O') {
                            sockets[0].write('You Lose'); 
                            sockets[1].write('You Win');
                        }
                    }else {
                        sockets[0].write(board.printFormattedBoard());
                        sockets[0].write('>>>> Wait for player2...\n');
                        sockets[1].write(board.printFormattedBoard());
                        sockets[1].write('>>>> Your turn select postion (0-8):');
                    }
                    
                } 
            }
            
        } else if (sockets[1] === socket) {
            for(var i = 0; i < 9; i++) {
                if(data === String(i) + '\n') {
                    board.insert('O', i);
                    if(board.isTerminal()) {
                        const winner = board.isTerminal().winner;
                        sockets[0].write(board.printFormattedBoard());
                        sockets[1].write(board.printFormattedBoard());
                        if(winner === 'X') {
                            sockets[0].write('You Win'); 
                            sockets[1].write('You Lose'); 
                        } else if (winner === 'O') {
                            sockets[0].write('You Lose'); 
                            sockets[1].write('You Win');
                        }
                    } else {
                        sockets[1].write(board.printFormattedBoard());
                        sockets[1].write('>>>> Wait for player1...\n');
                        sockets[0].write(board.printFormattedBoard());
                        sockets[0].write('>>>> Your turn select postion (0-8):');
                    }
                    
                }
            }
        }
        
       
        
	});



    socket.on('close', function() {
        sockets.splice(sockets.indexOf(socket), 1);
        console.log(`Closed: ${socket.remoteAddress}:${socket.remotePort}`);
    })

});

server.listen(8000);