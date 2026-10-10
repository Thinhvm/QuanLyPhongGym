import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, status, renewExpiry, validateMember, validatePayment, dateValue, filterMembers } from '../src/logic.js';
const member = { name: 'Đặng Minh', phone: '0901234567', monthlyFee: 300000, joinedAt: '2026-10-01', expiresAt: '2026-10-31', notes: '' };
test('30 days across months, leap year and year end', () => {
  assert.equal(addDays('2026-10-08', 30), '2026-11-07');
  assert.equal(addDays('2024-02-01', 30), '2024-03-02');
  assert.equal(addDays('2026-12-15', 30), '2027-01-14');
});
test('inclusive expiry warning boundaries', () => {
  for (const [date, expected] of [['2026-10-16','active'],['2026-10-15','soon'],['2026-10-09','soon'],['2026-10-08','today'],['2026-10-07','overdue']]) assert.equal(status(date,'2026-10-08'), expected);
});
test('renew active, today and overdue', () => {
  assert.equal(renewExpiry('2026-10-20','2026-10-08'),'2026-11-19');
  assert.equal(renewExpiry('2026-10-08','2026-10-08'),'2026-11-07');
  assert.equal(renewExpiry('2026-10-01','2026-10-08'),'2026-11-07');
});
test('invalid date and bounds rejected', () => {
  for (const date of ['2026-02-30','2026-13-01','8/10/2026','1999-01-01','2101-01-01','']) assert.throws(() => dateValue(date));
});
test('profile validation and amount', () => {
  assert.deepEqual(validateMember(member),{...member,avatar:''});
  for (const change of [{name:'A'}, {phone:'abc'}, {monthlyFee:0}, {monthlyFee:1.5}, {monthlyFee:100000001}, {notes:'a'.repeat(1001)}, {expiresAt:'2026-09-01'}]) assert.throws(()=>validateMember({...member,...change}));
});
test('future payment rejected',()=>{ assert.throws(()=>validatePayment('2026-10-09',300000,'2026-10-08')); assert.equal(validatePayment('2026-10-08',300000,'2026-10-08'),300000); });
test('accent-insensitive search and status filter',()=>{
  assert.equal(filterMembers([member],'dang','all','name','2026-10-08').length,1);
  assert.equal(filterMembers([member],'0901','active','expiry','2026-10-08').length,1);
  assert.equal(filterMembers([member],'','attention','expiry','2026-10-08').length,0);
});
