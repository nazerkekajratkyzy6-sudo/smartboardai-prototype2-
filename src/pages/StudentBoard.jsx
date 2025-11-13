import React, { useEffect, useState } from 'react';
import socket from '../socketClient';
import QRJoin from '../components/QRJoin';

export default function StudentBoard(){
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [currentBoard, setCurrentBoard] = useState(null);
  const [elements, setElements] = useState([]);

  useEffect(()=>{
    socket.on('room-state', state=>{
      // when teacher emits, student receives
      if(state && state.currentBoardId && state.boards && state.boards[state.currentBoardId]){
        setCurrentBoard(state.currentBoardId);
        setElements(state.boards[state.currentBoardId].elements || []);
      }
    });
    socket.on('board:update', ({boardId, data})=>{
      if(boardId===currentBoard) setElements(data.elements || []);
    });
    socket.on('switch-board', bid=> setCurrentBoard(bid));
    return ()=> socket.off();
  },[currentBoard]);

  const join = ()=>{
    if(!roomId || !name) return alert('Введите room и имя');
    socket.emit('join-room',{roomId, user:{name}});
    setJoined(true);
  };

  return (
    <div style={{padding:24}}>
      {!joined ? (
        <div style={{maxWidth:480}}>
          <h3>Присоединиться по QR / коду</h3>
          <div style={{display:'flex',gap:8}}>
            <input placeholder="Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} />
            <input placeholder="Ваше имя" value={name} onChange={e=>setName(e.target.value)} />
            <button onClick={join}>Присоединиться</button>
          </div>
          <div style={{marginTop:12}}><QRJoin roomId="" small={true} /></div>
        </div>
      ) : (
        <div>
          <h3>Вы в комнате: {roomId}</h3>
          <div>Текущая доска: {currentBoard}</div>
          <div style={{marginTop:12}}>
            {elements.map(e=> <div key={e.id} className="card">{e.text}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
