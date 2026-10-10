export const TZ = 'Asia/Ho_Chi_Minh';
export const PERIOD = 30;
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
export function daysLeft(expiry, at = today()) { return Math.round((dateValue(expiry) - dateValue(at)) / 86400000); }
export function status(expiry, at = today()) { const n = daysLeft(expiry, at); return n < 0 ? 'overdue' : n === 0 ? 'today' : n <= 3 ? 'soon' : 'active'; }
export function renewExpiry(expiry, paymentDate) { dateValue(expiry); dateValue(paymentDate); return addDays(expiry > paymentDate ? expiry : paymentDate, PERIOD); }
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
  return { name, phone, notes, monthlyFee, joinedAt: input.joinedAt, expiresAt: input.expiresAt };
}
export function validatePayment(date, amount, at = today()) { dateValue(date); if (date > at) throw new Error('Ngày đóng tiền không được ở tương lai.'); return validateAmount(amount); }
export function filterMembers(members, query, filter, sort, at = today()) {
  const q = normalize(query);
  return members.filter(m => {
    const s = status(m.expiresAt, at);
    return normalize(`${m.name} ${m.phone}`).includes(q) && (filter === 'all' || filter === s || (filter === 'attention' && s !== 'active'));
  }).sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'vi') : a.expiresAt.localeCompare(b.expiresAt) || a.name.localeCompare(b.name, 'vi'));
}
