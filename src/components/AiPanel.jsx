import React, { useState } from 'react';
import { askAI } from '../services/openaiService';
import { v4 as uuidv4 } from 'uuid';

export default function AiPanel({ onInsert }){
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState('');

  const run = async (type)=>{
    if(!text.trim()) return alert('Введите тему или задачу');
    setLoading(true);
    try{
      let prompt='';
      if(type==='formula') prompt = `Создай 3 формулы по теме: ${text} с краткими пояснениями в LaTeX.`;
      else if(type==='steps') prompt = `Реши пошагово: ${text}. Объясни каждый шаг.`;
      else if(type==='rebus') prompt = `Придумай ребус для школьников на тему: ${text}.`;
      else prompt = text;
      const ans = await askAI(prompt);
      setLast(ans);
      const el = { id: uuidv4(), text: ans };
      onInsert && onInsert(el);
    }catch(e){
      alert('Ошибка ИИ: ' + e.message);
    }finally{ setLoading(false); }
  };

  return (
    <div>
      <h4>ИИ-панель</h4>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Тема / задача" style={{width:'100%',height:80}} />
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button className="button" onClick={()=>run('formula')} disabled={loading}>Формула</button>
        <button className="button" onClick={()=>run('steps')} disabled={loading}>Пошагово</button>
        <button className="button" onClick={()=>run('rebus')} disabled={loading}>Ребус</button>
        <button className="button" onClick={()=>run('other')} disabled={loading}>Другой</button>
      </div>
      {loading ? <p>Генерация...</p> : last && <div className="ai-output" style={{marginTop:8}}>{last}</div>}
    </div>
  );
}
