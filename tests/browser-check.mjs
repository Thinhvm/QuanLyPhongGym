import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}),args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const cloudWrites=[];page.on('request',r=>{if(r.method()==='POST'&&r.url().includes('firestore.googleapis.com'))cloudWrites.push(r.url());});
const evidence=new URL('../doc/',import.meta.url);
const base=process.env.TEST_URL||'http://127.0.0.1:5173/';
await page.goto(base+'?demo=1');await page.locator('tbody tr').first().waitFor();
assert.equal(await page.locator('tbody tr').count(),8);assert.equal(await page.locator('.stat-value').allTextContents().then(x=>x.join(',')),'08,06,03,02');
await page.locator('#search').fill('dang');assert.equal(await page.locator('tbody tr').count(),1);assert.match(await page.locator('tbody').innerText(),/Đặng Quốc Huy/);await page.locator('#search').fill('');
await page.locator('#status-filter').selectOption('overdue');assert.equal(await page.locator('tbody tr').count(),2);await page.locator('#status-filter').selectOption('all');
await page.locator('#add-member').click();await page.locator('#member-form [name=name]').fill('Nguyễn Browser Test');await page.locator('#member-form [name=phone]').fill('0909998888');await page.locator('#member-form [name=notes]').fill('<img src=x onerror=alert(1)>');await page.locator('#member-form button[type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});assert.equal(await page.locator('tbody tr').count(),9);
await page.getByRole('button',{name:'Sửa Nguyễn Browser Test',exact:true}).click();await page.locator('#member-form [name=name]').fill('Nguyễn Updated Test');await page.locator('#member-form button[type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
await page.getByRole('button',{name:'Gia hạn Nguyễn Updated Test',exact:true}).click();const preview=await page.locator('#renew-preview').innerText();assert.match(preview,/hạn cũ/);await page.locator('#renew-form button[type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
await page.getByRole('button',{name:'Chi tiết Nguyễn Updated Test',exact:true}).click();assert.equal(await page.locator('.history-list li').count(),2);assert.match(await page.locator('.modal-body').innerText(),/<img src=x onerror=alert\(1\)>/);assert.equal(await page.locator('.modal-body img').count(),0);
await page.getByRole('button',{name:'Xóa thành viên',exact:true}).click();await page.getByRole('button',{name:'Không xóa',exact:true}).click();assert.equal(await page.locator('tbody tr').count(),9);
await page.getByRole('button',{name:'Chi tiết Nguyễn Updated Test',exact:true}).click();await page.getByRole('button',{name:'Xóa thành viên',exact:true}).click();await page.locator('#delete-form button[type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});assert.equal(await page.locator('tbody tr').count(),8);
await page.locator('a[data-route=payments]').click();assert.match(await page.locator('#view').innerText(),/Thành viên đã xóa/);assert.equal(await page.locator('tbody tr').count(),10);
await page.locator('a[data-route=alerts]').click();await page.waitForFunction(()=>document.querySelector('#page-title').textContent==='Cảnh báo gia hạn');assert.equal(await page.locator('tbody tr').count(),5);
await page.locator('a[data-route=members]').click();await page.locator('#add-member').click();await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.id),'add-member');
await page.locator('a[data-route=overview]').click();await page.screenshot({path:new URL('desktop-tested.png',evidence).pathname});
for(const [width,height] of [[375,812],[768,1024],[812,375],[1440,900]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
 const small=await page.locator('button:visible').evaluateAll(els=>els.filter(e=>{const r=e.getBoundingClientRect();return r.width<43.9||r.height<43.9;}).map(e=>e.outerHTML));assert.deepEqual(small,[],`small targets ${width}`);
 if(width===375)await page.screenshot({path:new URL('mobile-tested.png',evidence).pathname});
}
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#view').evaluate(e=>getComputedStyle(e).animationName),'none');
await page.reload();await page.locator('tbody tr').first().waitFor();assert.equal(await page.locator('tbody tr').count(),8);
await page.goto(base);assert.equal(await page.locator('#login-screen').isVisible(),true);assert.equal(await page.locator('#app-shell').isVisible(),false);await page.setViewportSize({width:1440,height:900});await page.screenshot({path:new URL('login-tested.png',evidence).pathname});
await page.locator('#toggle-password').click();assert.equal(await page.locator('#password').getAttribute('type'),'text');await page.locator('#toggle-password').click();
// Mock failed authentication, without sending owner's credentials or touching production.
await page.route('**/identitytoolkit.googleapis.com/**',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:{message:'INVALID_LOGIN_CREDENTIALS',code:400}})}));
await page.locator('[name=email]').fill('example@test.invalid');await page.locator('#password').fill('invalid-test-password');await page.locator('#login-form button[type=submit]').click();await page.locator('#login-error').filter({hasText:'Email hoặc mật khẩu không đúng.'}).waitFor();
assert.deepEqual(errors,[]);assert.deepEqual(cloudWrites,[]);
fs.writeFileSync(new URL('browser-results.json',evidence).pathname,JSON.stringify({passed:true,base,journeys:['summary','accent search','status filter','add','edit','renew','history','XSS literal','cancel delete','confirm delete','retained payments','alerts','Escape focus','reload reset','login guard','mock invalid login'],viewports:['375x812','768x1024','812x375','1440x900'],pageErrors:errors,firestorePosts:cloudWrites,productionAuthorizedLogin:'not tested',securityRulesEmulator:'not run'},null,2));
console.log('PASS: browser journeys, responsive layouts, XSS, login guard; no Firestore writes.');await browser.close();
