import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function GamesPanel({ onAdd }){
  return (
    <div>
      <h4>Игры</h4>
      <button onClick={()=> onAdd && onAdd({ id: uuidv4(), text: 'Ребус: ⚡️🌞 + 🌿 = ?' })} className="button">Добавить ребус</button>
      <div style={{height:8}} />
      <button onClick={()=> onAdd && onAdd({ id: uuidv4(), text: 'Ложь/Истина: Земля круглая?' })} className="button" style={{marginTop:8}}>Ложь/Истина</button>
      <div style={{height:8}} />
      <button onClick={()=> onAdd && onAdd({ id: uuidv4(), text: 'Сәйкестендіру: A→1, B→2' })} className="button" style={{marginTop:8}}>Сәйкестендіру</button>
    </div>
  );
}
