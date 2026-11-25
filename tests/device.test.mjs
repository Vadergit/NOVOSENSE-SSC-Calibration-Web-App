import {test} from 'node:test';import assert from 'node:assert/strict';import {Device,decode2860,decode2300,decodeSnapshot,profiles} from '../device.mjs';
test('2860 signed ADC and temperature',()=>{const v=decode2860([255,255,255,0,128,0],1,0,3);assert.equal(v.pressureRaw,-1);assert.equal(v.tempC,25.5);assert.equal(v.pressureCal,null)});
test('2300 raw mode and unsigned format',()=>{assert.equal(decode2300([255,255,255,0,0],2,1,1).pressureRaw,-1);assert.equal(decode2300([255,255,255,0,0],6,1,1).pressureRaw,16777215)});
test('snapshot reads only documented customer range',async()=>{const calls=[];const b={read:async(a,r,n)=>{calls.push([a,r,n]);const v=new Uint8Array(n);if(r===0xd9)v[0]=1;if(r<=0xd9&&r+n>0xd9)v[0xd9-r]=1;return v}};const d=new Device(b,'nsa2860x',0x6d);await d.identify();const s=await d.snapshot();assert.equal(s.registers.length,57);assert.equal(s.physicalNvmVerified,false);assert.ok(calls.every(c=>c[1]===2||c[1]>=0xa1&&c[1]+c[2]-1<=0xd9))});
test('unsupported model/address blocked',()=>assert.throws(()=>new Device({},'nsa2302',0x6d)));
test('invalid chip ID rejected',async()=>{const d=new Device({read:async()=>[0]},'nsa2860x',0x6d);await assert.rejects(d.identify())});
test('snapshot incomplete rejected',()=>assert.throws(()=>decodeSnapshot('nsa2300',[0])));
