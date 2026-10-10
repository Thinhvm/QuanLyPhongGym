export const TZ = 'Asia/Ho_Chi_Minh';
export const PERIOD = 30;
export const DEFAULT_PLANS = [1,2,3].map((months,i)=>({id:`default-${months}`,name:`Gói ${months} tháng`,months,price:[250000,500000,700000][i],active:true}));
export function validateMonths(value) { const n=Number(value); if(!Number.isInteger(n)||n<1||n>24)throw new Error('Thời lượng phải từ 1 đến 24 tháng.'); return n; }
export function validatePlan(input) { const name=String(input.name||'').trim(); if(name.length<2||name.length>80)throw new Error('Tên gói cần từ 2 đến 80 ký tự.'); return {name,months:validateMonths(input.months),price:validateAmount(input.price),active:input.active!==false}; }
export const LABELS = { active: 'Còn hạn', soon: 'Sắp hết hạn', today: 'Đến hạn hôm nay', overdue: 'Quá hạn' };
export function today() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function dateValue(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Ngày phải có định dạng YYYY-MM-DD.');
  const n = Date.parse(s + 'T00:00:00Z');
  if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== s || s < '2000-01-01' || s > '2100-12-31') throw new Error('Ngày không hợp lệ (2000–2100).');
  return n;
}
export function addDays(s, count) { return new Date(dateValue(s) + count * 86400000).toISOString().slice(0, 10); }
export function addMonths(s, count) { const d=new Date(dateValue(s)),n=validateMonths(count),day=d.getUTCDate(); d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));const result=d.toISOString().slice(0,10);dateValue(result);return result; }
export function daysLeft(expiry, at = today()) { return Math.round((dateValue(expiry) - dateValue(at)) / 86400000); }
export function status(expiry, at = today()) { const n = daysLeft(expiry, at); return n < 0 ? 'overdue' : n === 0 ? 'today' : n <= 7 ? 'soon' : 'active'; }
export function renewExpiry(expiry, paymentDate, months) { dateValue(expiry); dateValue(paymentDate); const base=expiry > paymentDate ? expiry : paymentDate;return months ? addMonths(base,months) : addDays(base,PERIOD); }
export function formatDate(s) { if (!s) return '—'; return new Intl.DateTimeFormat('vi-VN', { timeZone: 'UTC' }).format(new Date(dateValue(s))); }
export const money = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
export const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
export function validateAmount(v) { const n = Number(v); if (!Number.isSafeInteger(n) || n < 1 || n > 100000000) throw new Error('Số tiền phải là số nguyên từ 1 đến 100.000.000 đồng.'); return n; }
export function validateMember(input) {
  const name = String(input.name || '').trim();
  const phone = String(input.phone || '').trim();
  const notes = String(input.notes || '').trim();
  if (name.length < 2 || name.length > 100) throw new Error('Họ tên phải có từ 2 đến 100 ký tự.');
  if (!/^[+\d ()-]{7,20}$/.test(phone) || phone.replace(/\D/g, '').length < 7) throw new Error('Số điện thoại cần có ít nhất 7 chữ số (tối đa 20 ký tự).');
  if (notes.length > 1000) throw new Error('Ghi chú tối đa 1.000 ký tự.');
  const monthlyFee = validateAmount(input.monthlyFee);
  dateValue(input.joinedAt); dateValue(input.expiresAt);
  if (input.expiresAt < input.joinedAt) throw new Error('Ngày hết hạn không được trước ngày bắt đầu.');
<<<<<<< HEAD
  const result={ name, phone, avatar, notes, monthlyFee, joinedAt: input.joinedAt, expiresAt: input.expiresAt };
  if(avatar&&!/^https:\/\//i.test(avatar))throw new Error('Đường dẫn ảnh phải dùng HTTPS.');
  if(input.photoPath){if(!/^member-photos\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/.test(input.photoPath))throw new Error('Đường dẫn ảnh lưu trữ không hợp lệ.');result.photoPath=input.photoPath;}
  if(input.planId){result.planId=String(input.planId);result.planName=String(input.planName||'').trim();result.planMonths=validateMonths(input.planMonths);if(result.planId.length>100||result.planName.length<2||result.planName.length>80)throw new Error('Gói tập không hợp lệ.');}
  return result;
=======
  return { name, phone, notes, monthlyFee, joinedAt: input.joinedAt, expiresAt: input.expiresAt };
>>>>>>> 5062899f6b9ad9f85ad35417e8c90d91dbc29773
}
export function validatePayment(date, amount, at = today()) { dateValue(date); if (date > at) throw new Error('Ngày đóng tiền không được ở tương lai.'); return validateAmount(amount); }
export function summarize(payments,mode='month',year=Number(today().slice(0,4)),period=Number(today().slice(5,7))) {
  year=Number(year);period=Number(period);if(!Number.isInteger(year)||year<2000||year>2100||!['month','quarter','year'].includes(mode)||!Number.isInteger(period)||period<1||period>(mode==='quarter'?4:12))throw new Error('Kỳ thống kê không hợp lệ.');
  const first=mode==='year'?1:mode==='quarter'?(period-1)*3+1:period,count=mode==='year'?12:mode==='quarter'?3:1;
  const buckets=Array.from({length:count},(_,i)=>{const month=`${year}-${String(first+i).padStart(2,'0')}`;const list=payments.filter(p=>p.paidAt?.slice(0,7)===month);return {month,total:list.reduce((s,p)=>s+Number(p.amount||0),0),newMembers:new Set(list.filter(p=>p.kind==='initial').map(p=>p.memberId)).size,renewals:list.filter(p=>p.kind==='renewal').length,receipts:list.length};});
  const selected=payments.filter(p=>buckets.some(b=>p.paidAt?.slice(0,7)===b.month));
  return {buckets,total:buckets.reduce((s,b)=>s+b.total,0),newMembers:new Set(selected.filter(p=>p.kind==='initial').map(p=>p.memberId)).size,renewals:selected.filter(p=>p.kind==='renewal').length,receipts:selected.length};
}
export function filterMembers(members, query, filter, sort, at = today()) {
  const q = normalize(query);
  return members.filter(m => {
    const s = status(m.expiresAt, at);
<<<<<<< HEAD
    return normalize(`${m.name}${m.phone}`).includes(q) && (filter === 'all' || filter === s || (filter === 'attention' && s !== 'active') || (filter === 'upcoming' && ['soon','today'].includes(s)));
=======
    return normalize(`${m.name} ${m.phone}`).includes(q) && (filter === 'all' || filter === s || (filter === 'attention' && s !== 'active'));
>>>>>>> 5062899f6b9ad9f85ad35417e8c90d91dbc29773
  }).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'vi') : a.expiresAt.localeCompare(b.expiresAt) || a.name.localeCompare(b.name, 'vi'));
}
