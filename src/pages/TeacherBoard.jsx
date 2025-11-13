import React, { useEffect, useState } from 'react';
import socket from '../socketClient';
import AiPanel from '../components/AiPanel';
import FormulaPanel from '../components/FormulaPanel';
import GamesPanel from '../components/GamesPanel';
import QRJoin from '../components/QRJoin';
import { v4 as uuidv4 } from 'uuid';

export default function TeacherBoard(){
  const [roomId,setRoomId] = useState(()=>'room-'+Math.random().toString(36).slice(2,8));
  const [boards,setBoards] = useState({}); // {id: {title, elements}}
  const [current,setCurrent] = useState(null);
  const [theme,setTheme] = useState('default');

  useEffect(()=>{
    // create initial board
    const id = 'board-'+uuidv4().slice(0,6);
    setBoards({[id]:{title:'Main', elements:[]}});
    setCurrent(id);
    socket.emit('create-board',{roomId, boardId:id});
    socket.on('room-state', state=>{
      // ignore for now
    });
    socket.on('board:update', ({boardId, data})=>{
      setBoards(b=> ({...b, [boardId]: { ...(b[boardId]||{}), elements: data.elements }}));
    });
    socket.on('switch-board', bid=> setCurrent(bid));
    return ()=> socket.off();
  },[]);

  const addBoard = ()=>{
    const id = 'board-'+uuidv4().slice(0,6);
    setBoards(b=> ({...b, [id]:{title:'New', elements:[]}}));
    setCurrent(id);
    socket.emit('create-board',{roomId, boardId:id});
  };

  const addElement = (el)=>{
    const next = [...(boards[current]?.elements||[]), el];
    setBoards(b=> ({...b, [current]: {...b[current], elements: next}}));
    socket.emit('board:update',{roomId, boardId: current, data: { elements: next }});
  };

  const switchBoard = (id)=>{
    setCurrent(id);
    socket.emit('switch-board',{roomId, boardId: id});
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="icon active">🏫</div>
        <div className="icon">➕</div>
      </aside>
      <main className="main">
        <div className="header">
          <div>
            <h3>SmartBoard.AI — Учитель</h3>
            <div className="small">Room: {roomId}</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="button" onClick={addBoard}>Новая доска</button>
            <QRJoin roomId={roomId} />
          </div>
        </div>

        <div className="board-area">
          <div className="canvas">
            <h4>Boards</h4>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {Object.keys(boards).map(id=> (
                <div key={id} style={{padding:10,borderRadius:8,background: id===current? 'linear-gradient(135deg,#7a73ff,#57c6ff)':'#fff', color:id===current?'#fff':'#222', cursor:'pointer'}} onClick={()=>switchBoard(id)}>{boards[id].title}</div>
              ))}
            </div>
            <div style={{marginTop:18}}>
              {boards[current]?.elements?.length===0 ? <div className="small">Элементы отсутствуют</div> : boards[current].elements.map(e=> <div key={e.id} className="card">{e.text}</div>)}
            </div>
          </div>
          <aside className="sidepanel">
            <div className="card">
              <h4>Тема оформления</h4>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <div className="theme-preview" style={{background:'linear-gradient(90deg,#fef3c7,#ffd6b8)',borderRadius:8,cursor:'pointer'}} onClick={()=>setTheme('pastel')}>Pastel</div>
                <div className="theme-preview" style={{background:'linear-gradient(90deg,#e7f6ff,#dfe7ff)',borderRadius:8,cursor:'pointer'}} onClick={()=>setTheme('default')}>Light</div>
              </div>
            </div>

            <div style={{marginTop:12}} className="card">
              <h4>Игры и Формулы</h4>
              <GamesPanel onAdd={addElement} />
              <FormulaPanel onInsert={addElement} />
            </div>

            <div style={{marginTop:12}} className="card">
              <AiPanel onInsert={addElement} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
