const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let boards = {}; // { roomId: { boards: {id: {elements:[]}}, currentBoardId } }

io.on('connection', socket => {
  console.log('client connected', socket.id);

  socket.on('join-room', ({roomId, boardId, user})=>{
    socket.join(roomId);
    if(!boards[roomId]) {
      boards[roomId] = { boards: {}, currentBoardId: null, users: {} };
    }
    if(boardId && !boards[roomId].boards[boardId]) {
      boards[roomId].boards[boardId] = { elements: [] };
      if(!boards[roomId].currentBoardId) boards[roomId].currentBoardId = boardId;
    }
    boards[roomId].users[socket.id] = user || {name:'guest'};
    // emit current state
    io.to(socket.id).emit('room-state', boards[roomId]);
  });

  socket.on('board:update', ({roomId, boardId, data})=>{
    if(boards[roomId] && boards[roomId].boards[boardId]) {
      boards[roomId].boards[boardId].elements = data.elements;
      socket.to(roomId).emit('board:update', { boardId, data });
    }
  });

  socket.on('switch-board', ({roomId, boardId})=>{
    if(boards[roomId]) {
      boards[roomId].currentBoardId = boardId;
      io.to(roomId).emit('switch-board', boardId);
    }
  });

  socket.on('create-board', ({roomId, boardId})=>{
    if(!boards[roomId]) boards[roomId] = { boards: {}, currentBoardId: null, users: {} };
    boards[roomId].boards[boardId] = { elements: [] };
    boards[roomId].currentBoardId = boardId;
    io.to(roomId).emit('room-state', boards[roomId]);
  });

  socket.on('disconnect', ()=>{
    if(boards) {
      for(const r in boards){
        if(boards[r].users && boards[r].users[socket.id]) delete boards[r].users[socket.id];
      }
    }
    console.log('client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, ()=> console.log('Socket server listening on', PORT));
