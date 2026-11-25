import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:8000/');
 await page.locator('[data-gw-task="calibration"]').waitFor();
 assert.equal(await page.locator('.gw-choice').count(),8);
 await page.locator('[data-gw-task="calibration"]').click();
 await page.locator('[data-preset="quick"]').click();
 await page.locator('#gwNext').click();
 await page.locator('#afeLow').fill('-1000');await page.locator('#afeHigh').fill('1000');await page.locator('#afeCalc').click();
 assert.match(await page.locator('#afeResult').innerText(),/idealGain/);
 await page.locator('#gwNext').click();await page.locator('#synthetic').click();await page.locator('#gwNext').click();
 await page.locator('#compute').click();assert.match(await page.locator('#fitResult').innerText(),/residuals/);
 assert.equal(await page.locator('#fitRam').isDisabled(),true);
 await page.locator('#gwNext').click();await page.locator('#checkAdd').click();
 await page.locator('[data-key="raw"]').fill('5000');await page.locator('[data-key="reference"]').fill('50');await page.locator('#checkRun').click();
 assert.match(await page.locator('#verifyResults').innerText(),/innerhalb/);
 await page.locator('[data-step="9"]').click();assert.equal(await page.locator('#nvmWrite').isDisabled(),true);
 await page.locator('[data-step="10"]').click();await page.locator('#finishSave').click();
 await page.locator('#guidedHomeTop').click();await page.locator('[data-gw-task="archive"]').click();assert.equal(await page.locator('[data-archive]').count(),1);
 await page.locator('#guidedHomeTop').click();await page.locator('[data-gw-task="bridge"]').click();await page.locator('#bridgeCalc').click();assert.match(await page.locator('#bridgeResult').innerText(),/span_mV_V/);
 await page.locator('#guidedHomeTop').click();await page.locator('[data-gw-task="testlog"]').click();await page.locator('#logRaw').fill('1234');await page.locator('#logAdd').click();assert.match(await page.locator('.novo-table').innerText(),/1['’]?234/);
 await page.locator('#settingsOpen').click();await page.locator('#settingsTheme').selectOption('dark');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('#settingsOpen').click();
 await page.locator('#guidedHomeTop').click();await page.locator('#gwConnectionToggle').click();
 assert.equal(await page.locator('#adapter option').count(),5);
 await page.locator('#model').selectOption('nsa2860x');
 await page.locator('#adapter').selectOption('promicro');
 assert.match(await page.locator('.gw-page').innerText(),/NOVO-I2C-5/);
 await page.route('**/api/adapter',async route=>{const b=route.request().postDataJSON();await route.fulfill({json:{ok:true,result:b.action==='close'?{closed:true}:{board:'evm',versionBytes:[8],mode:0}}})});
 await page.locator('#adapter').selectOption('evm');await page.locator('#usb').click();
 await page.locator('#boardInfo').waitFor();assert.match(await page.locator('#boardInfo').innerText(),/versionBytes/);
 assert.equal(await page.locator('#hwRead').isDisabled(),true);
 await page.locator('#disconnect').click();await page.locator('#boardInfo').waitFor({state:'detached'});

 const labPage=await browser.newPage({viewport:{width:1440,height:900}});const labErrors=[];
 labPage.on('pageerror',e=>labErrors.push(e.message));labPage.on('dialog',d=>d.type()==='prompt'?d.accept('EEPROM TEST'):d.accept());
 await labPage.addInitScript(()=>{
  const regs=new Uint8Array(256);regs[0xd9]=1;regs[2]=3;regs[0x30]=3;
  const hex=a=>Array.from(a,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();let ctrl;
  window.testChipCode=100;window.testWrites=[];
  const port={open:async()=>{},close:async()=>{},readable:new ReadableStream({start(c){ctrl=c}}),writable:new WritableStream({write(raw){
    const [id,cmd,addr,r,n,old,next]=new TextDecoder().decode(raw).trim().split(' ');let reply='';
    if(cmd==='HELLO')reply='NOVO-I2C-5';
    else if(cmd==='INFO')reply='ESP32-C3';
    else if(cmd==='R'){const rr=parseInt(r,16);if(rr===6){const v=window.testChipCode;regs[6]=v>>16;regs[7]=v>>8;regs[8]=v}reply=hex(regs.slice(rr,rr+Number(n)))}
    else if(cmd==='W'){const rr=parseInt(r,16),count=Number(n);if(hex(regs.slice(rr,rr+count))!==old)throw Error('unexpected compare mismatch');regs.set(Uint8Array.from(next.match(/../g),x=>parseInt(x,16)),rr);window.testWrites.push(cmd);reply='RAM_PATCH_READBACK'}
    else if(cmd==='P'){window.testWrites.push(cmd);reply='EEPROM_DONE_POWER_CYCLE_REQUIRED'}
    else throw Error('unexpected command '+cmd);
    ctrl.enqueue(new TextEncoder().encode(id+' OK '+reply+'\n'));
  }})};
  Object.defineProperty(navigator,'serial',{configurable:true,value:{requestPort:async()=>port,addEventListener(){}}});
 });
 await labPage.goto('http://127.0.0.1:8000/?model=nsa2860x');
 await labPage.locator('#gwConnectionToggle').click();await labPage.locator('#usb').click();
 await labPage.locator('#boardInfo').waitFor();
 await labPage.locator('#guidedHomeTop').click();await labPage.locator('[data-gw-task="inspect"]').click();
 assert.equal(await labPage.locator('#labProgram').isDisabled(),true);
 await labPage.locator('#labBaseline').click();await labPage.locator('#labOriginal:not([disabled])').waitFor();
 await labPage.locator('#labEdit').fill('{"S0":1}');await labPage.locator('#labPreview').click();
 await labPage.locator('#labApply:not([disabled])').waitFor();
 await labPage.locator('#labApply').click();await labPage.locator('#gwMessage').getByText('RAM-Register vollständig rückgelesen.').waitFor();
 assert.equal(await labPage.locator('#labProgram').isDisabled(),true);
 await labPage.locator('#labTarget').fill('100');await labPage.locator('#labTolerance').fill('2');await labPage.locator('#labCheck').click();
 await labPage.waitForFunction(()=>document.querySelector('#labChecks').textContent.includes('"expected": 100'));
 await labPage.evaluate(()=>window.testChipCode=200);
 await labPage.locator('#labTarget').fill('200');await labPage.locator('#labTolerance').fill('2');await labPage.locator('#labCheck').click();
 await labPage.locator('#labProgram:not([disabled])').waitFor();
 await labPage.locator('#labProgram').click();await labPage.waitForFunction(()=>!!localStorage.getItem('novo-pending-eeprom'));
 await labPage.locator('#labCold:not([disabled])').waitFor();
 assert.equal(await labPage.locator('#labProgram').isDisabled(),true);
 await labPage.locator('#labCold').click();await labPage.waitForFunction(()=>!localStorage.getItem('novo-pending-eeprom'));
 assert.deepEqual(await labPage.evaluate(()=>window.testWrites),['W','P']);
 assert.deepEqual(labErrors,[]);
 console.log('Mocked serial lab: baseline, W readback, two measured checks, P one-shot and cold compare passed');

 assert.deepEqual(errors,[]);
 console.log('Browser smoke: 8 tasks, calibration, AFE, verification, NVM lock, archive, bridge, logging, theme passed');
}finally{await browser.close()}
