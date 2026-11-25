// Same-origin native service for the original RS485 boards.
export const adapters=Object.freeze({
 esp32:{name:'ESP32-C3 SuperMini',firmware:'ESP32-C3',transport:'DIY · USB / I²C'},
 promicro:{name:'Arduino Pro Micro',firmware:'ATmega32U4',transport:'DIY · USB / I²C'},
 evm:{name:'NOVOSENSE NSX2860_EVM',transport:'RS485 · 250 kBd · Mark/Space'},
 cal32:{name:'NOVOSENSE NSA2860_CAL32',transport:'RS485 · 250 kBd · 8N1'},
 nsa2302evm:{name:'NOVOSENSE NSA2302 Evaluation System',transport:'RS485 · Befehlsprotokoll noch offen'}
});
export const isDiy=k=>k==='esp32'||k==='promicro';
export const nativeAvailable=()=>location.protocol==='http:'&&location.hostname==='127.0.0.1';
export class NativeBridge {
 constructor(kind){this.kind=kind;this.closed=true;this.log=[];this.info=null;this.port=null;}
 async call(action,body={}){
  if(!nativeAvailable())throw Error('Originalboard benötigt die lokale Web-App: http://127.0.0.1:8765/');
  const resp=await fetch('/api/adapter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...body}),signal:AbortSignal.timeout(6500)});
  let reply;try{reply=await resp.json()}catch{throw Error('Lokaler NOVOSENSE-Adapterdienst nicht gestartet')}
  if(!resp.ok||!reply.ok)throw Error(reply.error||'Adapterfehler');
  return reply.result;
 }
 async connect(){this.info=await this.call('open',{board:this.kind});this.closed=false;return this.info;}
 async close(){if(this.closed)return;try{await this.call('close')}finally{this.closed=true;this.info=null;}}
 async read(_address,reg,count){if(this.closed||this.kind!=='evm')throw Error('Kein EVM-Lesekanal');const r=await this.call('read',{reg,count});if(!Array.isArray(r.bytes)||r.bytes.length!==count||r.bytes.some(x=>!Number.isInteger(x)||x<0||x>255))throw Error('Registerantwort ungültig');return Uint8Array.from(r.bytes);}
 async version(){return this.call('version')}
 async enter(){return this.call('enter',{confirm:'POWER_CYCLE_TEST_DUT'})}
 async fetchLog(){this.log=(await this.call('log')).log;return this.log;}
 async request(){throw Error('RAM-/NVM-Schreibzugriff via Originalboard nicht freigegeben')}
}
