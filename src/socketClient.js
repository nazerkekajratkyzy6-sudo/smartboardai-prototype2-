import { io } from 'socket.io-client';
const URL = (typeof window!=='undefined' && window.location.hostname==='localhost') ? 'http://localhost:3001' : (window.location.origin);
const socket = io(URL, { autoConnect:true });
export default socket;
