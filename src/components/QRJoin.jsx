import React from 'react';
import QRCode from 'qrcode.react';

export default function QRJoin({roomId, small}){
  const url = roomId ? `${window.location.origin}?room=${roomId}` : window.location.origin;
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{fontSize:12,color:'#666'}}>{small? 'Сканируй QR' : 'Подключение по QR'}</div>
      <div style={{padding:6,background:'#fff',borderRadius:8}}>
        <QRCode value={url} size={small?64:128} />
      </div>
    </div>
  );
}
