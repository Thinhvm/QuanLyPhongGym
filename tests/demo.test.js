import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoStore } from '../src/demo.js';
import { today, addDays } from '../src/logic.js';
test('add/edit/renew idempotent/delete preserve payment history',async()=>{
 const store=createDemoStore();let data;store.listen(d=>data=d);const count=data.members.length;
 const m={name:'Đặng Test',phone:'0901234567',monthlyFee:300000,joinedAt:today(),expiresAt:addDays(today(),30),notes:''};
 await store.add(m,'test-id');await store.add(m,'test-id');assert.equal(data.members.length,count+1);assert.equal(data.payments.filter(p=>p.id==='test-id').length,1);
 await store.edit('test-id',{...m,name:'Đặng Updated'});assert.equal(data.members.find(m=>m.id==='test-id').name,'Đặng Updated');
 await store.renew('test-id',today(),300000,'renew-id');await store.renew('test-id',today(),300000,'renew-id');assert.equal(data.members.find(m=>m.id==='test-id').expiresAt,addDays(today(),60));assert.equal(data.payments.filter(p=>p.id==='renew-id').length,1);
 await store.remove('test-id');assert.equal(data.members.length,count);assert.equal(data.payments.filter(p=>p.memberId==='test-id').length,2);
 await assert.rejects(store.renew('missing',today(),300000,'another'));
 await assert.rejects(store.add({...m,monthlyFee:0},'invalid'));
});
test('separate demo stores do not persist changes',async()=>{let a,b;const s=createDemoStore();s.listen(d=>a=d);await s.remove(a.members[0].id);createDemoStore().listen(d=>b=d);assert.equal(b.members.length,a.members.length+1);});
