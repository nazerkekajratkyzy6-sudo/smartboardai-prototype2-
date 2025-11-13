import React, { useState } from 'react';
import TeacherBoard from './pages/TeacherBoard';
import StudentBoard from './pages/StudentBoard';

export default function App(){
  const [mode, setMode] = useState(null);
  return (
    <div>
      {!mode ? (
        <div style={{padding:40}}>
          <h2>SmartBoard.AI — Выбери режим</h2>
          <div style={{display:'flex',gap:12,marginTop:20}}>
            <button onClick={()=>setMode('teacher')} style={{padding:12}}>Учитель</button>
            <button onClick={()=>setMode('student')} style={{padding:12}}>Ученик</button>
          </div>
        </div>
      ):(mode==='teacher' ? <TeacherBoard/> : <StudentBoard/>)}
    </div>
  );
}
