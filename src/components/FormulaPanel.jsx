import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { v4 as uuidv4 } from 'uuid';

export default function FormulaPanel({ onInsert }){
  const [expr,setExpr] = useState('');
  return (
    <div>
      <h4>Формула (LaTeX)</h4>
      <input value={expr} onChange={e=>setExpr(e.target.value)} placeholder="Напр. \\frac{a}{b}" style={{width:'100%'}} />
      <div style={{marginTop:8}}><BlockMath math={expr || ' '} /></div>
      <button className="button" style={{marginTop:8}} onClick={()=> onInsert && onInsert({ id: uuidv4(), text: `Формула: ${expr}` })}>Вставить</button>
    </div>
  );
}
