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
 await page.locator('#settingsOpen').click();await page.locator('#settingsTheme').selectOption('dark');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 assert.deepEqual(errors,[]);
 console.log('Browser smoke: 8 tasks, calibration, AFE, verification, NVM lock, archive, bridge, logging, theme passed');
}finally{await browser.close()}
