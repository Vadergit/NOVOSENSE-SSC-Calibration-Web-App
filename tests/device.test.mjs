import {test} from 'node:test';import assert from 'node:assert/strict';import {Device,decode2860,decode2300,decodeSnapshot,profiles,afe2860} from '../device.mjs';
test('2860 signed ADC and temperature',()=>{const v=decode2860([255,255,255,0,128,0],1,0,3);assert.equal(v.pressureRaw,-1);assert.equal(v.tempC,25.5);assert.equal(v.pressureCal,null)});
test('2300 raw mode and unsigned format',()=>{assert.equal(decode2300([255,255,255,0,0],2,1,1).pressureRaw,-1);assert.equal(decode2300([255,255,255,0,0],6,1,1).pressureRaw,16777215)});
test('snapshot reads only documented customer range',async()=>{const calls=[];const b={read:async(a,r,n)=>{calls.push([a,r,n]);const v=new Uint8Array(n);if(r===0xd9)v[0]=1;if(r<=0xd9&&r+n>0xd9)v[0xd9-r]=1;return v}};const d=new Device(b,'nsa2860x',0x6d);await d.identify();const s=await d.snapshot();assert.equal(s.registers.length,57);assert.equal(s.physicalNvmVerified,false);assert.ok(calls.every(c=>c[1]===2||c[1]>=0xa1&&c[1]+c[2]-1<=0xd9))});
test('unsupported model/address blocked',()=>assert.throws(()=>new Device({},'nsc9264',0x6d)));
test('invalid chip ID rejected',async()=>{const d=new Device({read:async()=>[0]},'nsa2860x',0x6d);await assert.rejects(d.identify())});
test('snapshot incomplete rejected',()=>assert.throws(()=>decodeSnapshot('nsa2300',[0])));

test('AFE mask preserves unrelated configuration bits',()=>{assert.deepEqual(afe2860([0x13,0xc4,0x82],64,true,true,true),[0xa3,0xc7,0x83]);assert.throws(()=>afe2860([0,0,0],3,false,false,false))});
import {decode2302,decodeCoefficients2860,status2860,averageSamples} from '../device.mjs';
test('2860 coefficients fixed point, unsigned S0, mode and clamp',()=>{const a=new Uint8Array(57);a[0xa9-0xa1]=128;a[0xaf-0xa1]=128;a[0xbf-0xa1]=255;a[0xd9-0xa1]=129;const c=decodeCoefficients2860(a);assert.equal(c.OFFSET0,-1);assert.equal(c.S0,1);assert.equal(c.T0_C,24);assert.equal(c.locked,true);assert.equal(c.clampHighFraction,1);});
test('2302 ADC modes remain distinct',()=>{assert.equal(decode2302([255,255,255,0,0],2,1,1).pressureRaw,-1);assert.equal(decode2302([255,255,255,0,0],2,1,0).tempRaw,-1);assert.equal(decode2302([0,0,0,0,0],2,1,2).pressureRaw,null);});
test('status bit7 fault and mean',()=>{assert.equal(status2860(0x83).faults.length,1);assert.equal(averageSamples([{pressureRaw:1},{pressureRaw:3}]).pressureRaw,2);});
test('2302 shadow identity and range',async()=>{const b={read:async(a,r,n)=>{const v=new Uint8Array(n);if(r===1||r===0xa0)v[0]=7;return v}};const dev=new Device(b,'nsa2302',0x7f);await dev.identify();assert.equal((await dev.snapshot()).registers.length,29)});

test('fresh sample averaging refuses wrong mode',async()=>{const dev=new Device({},'nsa2860x',0x6d);dev.sample=async()=>({pressureCal:42,pressureRaw:null});await assert.rejects(dev.collect(1,true),/RAW_P/)});
test('fresh sample averaging preserves extrema',async()=>{const dev=new Device({},'nsa2860x',0x6d);let n=0;dev.sample=async()=>({pressureRaw:++n,tempRaw:20});const m=await dev.collect(3,true,true);assert.equal(m.pressureRaw,2);assert.equal(m.pressureRawMin,1);assert.equal(m.pressureRawMax,3);});
