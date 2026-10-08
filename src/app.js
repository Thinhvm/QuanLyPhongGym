import { createIcons, dumbbell, arrowRight, shieldCheck, eye, layoutDashboard, users, bell, wallet, settings2, logOut, plus, flaskConical, badgeCheck, clock3, triangleAlert, bellRing, arrowUpRight, search, ellipsis, chevronLeft, chevronRight, x, trash } from 'https://cdn.jsdelivr.net/npm/lucide@latest/dist/esm/lucide.js';

const icons = { 
  Dumbbell: dumbbell, 
  ArrowRight: arrowRight, 
  ShieldCheck: shieldCheck, 
  Eye: eye, 
  LayoutDashboard: layoutDashboard, 
  Users: users, 
  Bell: bell, 
  Wallet: wallet, 
  Settings2: settings2, 
  LogOut: logOut, 
  Plus: plus, 
  FlaskConical: flaskConical, 
  BadgeCheck: badgeCheck, 
  Clock3: clock3, 
  TriangleAlert: triangleAlert, 
  BellRing: bellRing, 
  ArrowUpRight: arrowUpRight, 
  Search: search, 
  Ellipsis: ellipsis, 
  ChevronLeft: chevronLeft, 
  ChevronRight: chevronRight, 
  X: x, 
  Trash2: trash 
};

import { today, TZ, addDays, daysLeft, status, LABELS, formatDate, money, filterMembers, validateMember, validatePayment, renewExpiry } from './logic.js';
import { login, logout, watchAuth, liveStore, friendlyError } from './data.js';
import { createDemoStore } from './demo.js';
import { firebaseConfig, ADMIN_UID } from './firebase-config.js';

const $ = selector => document.querySelector(selector);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => `<i data-lucide="${name}"></i>`;
const demo = new URLSearchParams(location.search).get('demo') === '1';
const store = demo ? createDemoStore() : liveStore;
let data={members:[],payments:[]}, ready=false, loggedIn=demo, unsubscribe=null, query='', filter='all', sort='expiry', page=1, modalBusy=false, originalForm='', returnFocus=null;
const modal=$('#modal');
const route=()=>['overview','members','alerts','payments','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'overview';

function refreshIcons(){createIcons({icons,attrs:{'aria-hidden':'true'}});}
function toast(text,error=false){const el=$('#toast');el.textContent=text;el.classList.toggle('error',error);el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4000);}
function dayText(m){const n=daysLeft(m.expiresAt);return n<0?`Quá hạn ${-n} ngày`:n===0?'Đến hạn hôm nay':`Còn ${n} ngày`;}
function badge(m){const s=status(m.expiresAt);return `<span class="badge ${s}">${LABELS[s]}</span>`;}
function initials(name){return name.trim().split(/\s+/).slice(-2).map(s=>s[0]).join('').toUpperCase();}
function memberRow(m){return `<tr><td><div class="member-info"><span class="avatar">${esc(initials(m.name))}</span><div><strong>${esc(m.name)}</strong><small>${esc(m.phone)}</small></div></div></td><td data-label="HẾT HẠN" class="expiry">${formatDate(m.expiresAt)}<small>${dayText(m)}</small></td><td data-label="TRẠNG THÁI">${badge(m)}</td><td class="fee-col" data-label="PHÍ / 30 NGÀY">${money(m.monthlyFee)}</td><td><div class="row-actions"><button data-action="edit" data-id="${esc(m.id)}" aria-label="Sửa ${esc(m.name)}">Sửa</button><button class="renew" data-action="renew" data-id="${esc(m.id)}" aria-label="Gia hạn ${esc(m.name)}">Gia hạn</button><button class="detail" data-action="detail" data-id="${esc(m.id)}" aria-label="Chi tiết ${esc(m.name)}" title="Chi tiết">${icon('ellipsis')}</button></div></td></tr>`;}
function stats(){const active=data.members.filter(m=>status(m.expiresAt)!=='overdue').length;const attention=data.members.filter(m=>['soon','today'].includes(status(m.expiresAt))).length;const late=data.members.length-active;return `<section class="stats" aria-label="Thống kê thành viên">${[['Tổng thành viên',data.members.length,'Danh sách phòng tập','users',''],['Đang còn hạn',active,'Gồm cả đến hạn hôm nay','badge-check',''],['Sắp đến hạn',attention,'Trong 3 ngày tới và hôm nay','clock-3','warn'],['Đã quá hạn',late,'Cần theo dõi gia hạn','triangle-alert','bad']].map(([label,n,foot,i,c])=>`<article class="stat ${c}"><div class="stat-top"><span>${label}</span>${icon(i)}</div><div class="stat-value">${n.toString().padStart(2,'0')}</div><div class="stat-foot">${foot}</div></article>`).join('')}</section>`;}
function empty(title,text,action=false){return `<div class="empty">${icon('users')}<h3>${title}</h3><p>${text}</p>${action?'<button class="primary" data-action="add">Thêm thành viên đầu tiên</button>':''}</div>`;}

function membersView(){
 const currentRoute=route(),effectiveFilter=currentRoute==='alerts'&&filter==='all'?'attention':filter;
 const list=filterMembers(data.members,query,effectiveFilter,sort);const pages=Math.max(1,Math.ceil(list.length/10));page=Math.min(page,pages);
 const warnings=data.members.filter(m=>status(m.expiresAt)!=='active').length;
 const options=[['all','Tất cả trạng thái'],['active','Còn hạn'],['soon','Sắp hết hạn'],['today','Đến hạn hôm nay'],['overdue','Quá hạn'],['attention','Cần chú ý']];
 return `${currentRoute==='overview'?stats()+`<div class="attention">${icon(warnings?'bell-ring':'shield-check')}<div><strong>${warnings?`${warnings} thành viên cần chú ý kỳ gia hạn`:'Các kỳ gia hạn đang trong tầm kiểm soát'}</strong><p>${warnings?'Theo dõi thành viên sắp hết hạn, đến hạn hôm nay và đã quá hạn.':'Chưa có thành viên nào cần nhắc đóng tiền.'}</p></div><button data-action="alerts">Xem cảnh báo ${icon('arrow-up-right')}</button></div>`:''}<section class="panel"><div class="panel-head"><div><h2>${currentRoute==='alerts'?'Theo dõi kỳ gia hạn':'Danh sách thành viên'}</h2><small>${list.length} thành viên ${query?'phù hợp tìm kiếm':'trong danh sách'}</small></div><span class="eyebrow">GÓI 30 NGÀY</span></div><div class="filters"><label class="search-wrap"><span class="sr-only">Tìm thành viên</span>${icon('search')}<input id="search" type="search" placeholder="Tìm tên hoặc số điện thoại…" value="${esc(query)}" aria-label="Tìm tên hoặc số điện thoại"></label><label>Trạng thái<select id="status-filter">${options.map(([v,t])=>`<option value="${v}" ${v===effectiveFilter?'selected':''}>${t}</option>`).join('')}</select></label><label>Sắp xếp<select id="sort"><option value="expiry" ${sort==='expiry'?'selected':''}>Hạn gần nhất</option><option value="name" ${sort==='name'?'selected':''}>Tên A–Z</option></select></label></div>${list.length?`<table class="table"><thead><tr><th>THÀNH VIÊN</th><th>NGÀY HẾT HẠN</th><th>TRẠNG THÁI</th><th class="fee-col">PHÍ / 30 NGÀY</th><th>THAO TÁC</th></tr></thead><tbody>${list.slice((page-1)*10,page*10).map(memberRow).join('')}</tbody></table>`:empty(data.members.length?'Không có thành viên phù hợp':'Bắt đầu danh sách phòng tập',data.members.length?'Thử đổi từ khóa hoặc chọn trạng thái khác.':'Thêm thành viên đầu tiên để theo dõi kỳ gia hạn.',!data.members.length)}<div class="pagination"><span>${list.length?`${(page-1)*10+1}–${Math.min(page*10,list.length)} /${list.length}`:'0 thành viên'}</span><div><button data-action="prev" aria-label="Trang trước" ${page<=1?'disabled':''}>${icon('chevron-left')}</button><span style="align-self:center">${page} / ${pages}</span><button data-action="next" aria-label="Trang sau" ${page>=pages?'disabled':''}>${icon('chevron-right')}</button></div></div></section>`;
}

function paymentsView(){const list=[...data.payments].sort((a,b)=>b.paidAt.localeCompare(a.paidAt));const month=today().slice(0,7);const total=list.filter(p=>p.paidAt.startsWith(month)).reduce((s,p)=>s+p.amount,0);const pages=Math.max(1,Math.ceil(list.length/10));page=Math.min(page,pages);return `<section class="panel"><div class="panel-head"><div><h2>Lịch sử thu tiền</h2><small>Khoản thu đã ghi nhận · Không phải công nợ</small></div><div class="ledger-meta"><small>Tháng ${month.slice(5)}/${month.slice(0,4)}</small><strong class="ledger-total">${money(total)}</strong></div></div>${list.length?`<table class="table"><thead><tr><th>THÀNH VIÊN</th><th>NGÀY THU</th><th>HẠN MỚI</th><th>LOẠI</th><th>SỐ TIỀN</th></tr></thead><tbody>${list.slice((page-1)*10,page*10).map(p=>`<tr><td><strong>${esc(p.memberName)}</strong><small style="display:block">${data.members.some(m=>m.id===p.memberId)?'Đã ghi nhận':'Thành viên đã xóa'}</small></td><td data-label="NGÀY THU">${formatDate(p.paidAt)}</td><td data-label="HẠN MỚI">${formatDate(p.newExpiry)}</td><td data-label="LOẠI">${p.kind==='initial'?'Đăng ký mới':'Gia hạn'}</td><td data-label="SỐ TIỀN"><strong>${money(p.amount)}</strong></td></tr>`).join('')}</tbody></table>`:empty('Chưa có khoản thu','Khoản thu xuất hiện khi thêm thành viên hoặc gia hạn.')}<div class="pagination"><span>${list.length} khoản thu</span><div><button data-action="prev" aria-label="Trang trước" ${page<=1?'disabled':''}>${icon('chevron-left')}</button><span style="align-self:center">${page} / ${pages}</span><button data-action="next" aria-label="Trang sau" ${page>=pages?'disabled':''}>${icon('chevron-right')}</button></div></div><div class="inline-note">Lịch sử được giữ lại khi xóa thành viên. Sửa hồ sơ không thay đổi các khoản thu cũ.</div></section>`;}

function settingsView(){return `<div class="settings-grid"><section class="panel settings-card"><h2>Quy tắc phòng tập</h2><dl><dt>Thời hạn gói tập</dt><dd>30 ngày</dd><dt>Cảnh báo sắp hết hạn</dt><dd>Trước 3 ngày, kèm cảnh báo riêng hôm nay</dd><dt>Gia hạn khi còn hạn</dt><dd>Cộng 30 ngày từ hạn cũ</dd><dt>Gia hạn khi đã quá hạn</dt><dd>Cộng 30 ngày từ ngày đóng tiền mới</dd><dt>Múi giờ tính ngày</dt><dd>${TZ} (giờ Việt Nam)</dd><dt>Ngày hết hạn</dt><dd>Vẫn còn hiệu lực trong ngày hết hạn; hôm sau là quá hạn.</dd></dl></section><section class="panel settings-card"><h2>Kết nối & quyền truy cập</h2><dl><dt>Chế độ</dt><dd>${demo?'Minh họa — không lưu vào Firebase':'Firebase — dữ liệu thật'}</dd><dt>Firebase project</dt><dd>${firebaseConfig.projectId}</dd><dt>Quản trị</dt><dd>Một tài khoản đã cấp quyền theo UID</dd><dt>UID quản lý</dt><dd>${ADMIN_UID}</dd><dt>Bảo mật</dt><dd>Cần xuất bản firestore.rules trước khi sử dụng dữ liệu thật.</dd></dl><p class="helper" style="margin-top:24px">Không có điểm danh hoặc gửi thông báo ra ngoài. Cảnh báo cập nhật khi website đang mở.</p></section></div>`;}

function render(){
 if(!loggedIn)return;
 const r=route();const titles={overview:['Tổng quan phòng tập','Mọi thành viên. Mọi kỳ gia hạn. Trong tầm kiểm soát.'],members:['Quản lý thành viên','Hồ sơ thành viên và thời hạn gói tập tại một nơi.'],alerts:['Cảnh báo gia hạn','Ưu tiên những kỳ đóng tiền cần bạn chú ý.'],payments:['Theo dõi thu tiền','Lịch sử đăng ký mới và gia hạn gói tập.'],settings:['Thiết lập phòng tập','Quy tắc gói tập và thông tin kết nối.']};
 $('#page-title').textContent=titles[r][0];$('#page-subtitle').textContent=titles[r][1];$('#header-date').textContent=`${formatDate(today())} / GIỜ VIỆT NAM`;
 document.querySelectorAll('[data-route]').forEach(a=>{a.classList.toggle('active',a.dataset.route===r);a.setAttribute('aria-current',a.dataset.route===r?'page':'false');});
 $('#nav-alert-count').textContent=data.members.filter(m=>status(m.expiresAt)!=='active').length;
 $('#add-member').hidden = r === 'settings' || r === 'payments'; 
 $('#view').innerHTML=r==='settings'?settingsView():!ready?empty('Đang chờ dữ liệu', $('#connection-error').hidden?'Đang kết nối an toàn với Firebase…':'Hãy xử lý lỗi kết nối rồi nhấn Thử lại.'):r==='payments'?paymentsView():membersView();refreshIcons();
}

function connect(){unsubscribe?.();ready=false;$('#connection-error').hidden=true;render();try{unsubscribe=store.listen(d=>{data=d;ready=true;$('#sync-status').textContent=demo?'Dữ liệu minh họa · Không lưu':'Đã đồng bộ với Firebase';render();},e=>{ready=false;data={members:[],payments:[]};$('#connection-message').textContent=friendlyError(e);$('#connection-error').hidden=false;$('#sync-status').textContent='Chưa đồng bộ';render();});}catch(e){$('#connection-message').textContent=friendlyError(e);$('#connection-error').hidden=false;render();}}

function showApp(){loggedIn=true;$('#login-screen').hidden=true;$('#app-shell').hidden=false;$('#demo-banner').hidden=!demo;connect();}

$('#login-form').addEventListener('submit',async e=>{e.preventDefault();const button=e.target.querySelector('button[type=submit]');button.disabled=true;button.textContent='Đang đăng nhập…';$('#login-error').textContent='';try{await login(e.target.email.value.trim(),e.target.password.value);e.target.password.value='';}catch(error){$('#login-error').textContent=friendlyError(error);}finally{button.disabled=false;button.innerHTML=`Đăng nhập ${icon('arrow-right')}`;refreshIcons();}});
$('#toggle-password').onclick=()=>{const p=$('#password');p.type=p.type==='password'?'text':'password';$('#toggle-password').setAttribute('aria-label',p.type==='password'?'Hiện mật khẩu':'Ẩn mật khẩu');};
$('#logout').onclick=async()=>{if(demo){location.href=location.pathname;return;}try{await logout();}catch(e){toast(friendlyError(e),true);}};
$('#retry').onclick=connect;

function head(title){return `<div class="modal-head"><h2 id="modal-title">${title}</h2><button type="button" data-action="close" aria-label="Đóng hộp thoại">${icon('x')}</button></div>`;}
function openModal(content){returnFocus=document.activeElement;$('#modal-content').innerHTML=content;modal.showModal();modalBusy=false;originalForm=formState();refreshIcons();}
function formState(){const form=modal.querySelector('form');return form?JSON.stringify([...new FormData(form)]):'';}
function closeModal(force=false){if(modalBusy)return;if(!force&&originalForm&&formState()!==originalForm&&!confirm('Bạn có thay đổi chưa lưu. Bỏ thay đổi và đóng?'))return;modal.close();returnFocus?.focus();}
modal.addEventListener('cancel',e=>{e.preventDefault();closeModal();});
modal.addEventListener('click',e=>{if(e.target===modal){const rect=modal.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeModal();}});

function profileForm(m){const edit=!!m;const value=m||{name:'',phone:'',monthlyFee:350000,joinedAt:today(),expiresAt:addDays(today(),30),notes:''};openModal(`${head(edit?'Sửa hồ sơ thành viên':'Thêm thành viên')}<form id="member-form" class="modal-body"><div class="form-grid"><label>Họ và tên *<input name="name" minlength="2" maxlength="100" required value="${esc(value.name)}" autocomplete="name"></label><label>Số điện thoại *<input name="phone" type="tel" maxlength="20" required value="${esc(value.phone)}" autocomplete="tel"></label><label>Phí gói 30 ngày (đ) *<input name="monthlyFee" type="number" min="1" max="100000000" step="1" required value="${value.monthlyFee}"></label><label>Ngày bắt đầu *<input name="joinedAt" type="date" min="2000-01-01" max="${today()}" required value="${value.joinedAt}"></label>${edit?`<label class="span-2">Ngày hết hạn *<input name="expiresAt" type="date" min="2000-01-01" max="2100-12-31" required value="${value.expiresAt}"><span class="helper">Điều chỉnh hồ sơ không tạo khoản thu và không sửa lịch sử cũ.</span></label>`:'<div class="preview span-2" id="initial-preview"></div>'}<label class="span-2">Ghi chú<textarea name="notes" rows="3" maxlength="1000">${esc(value.notes)}</textarea></label></div><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button type="button" data-action="close">Hủy</button><button class="primary" type="submit">${edit?'Lưu thay đổi':'Thêm & ghi nhận tiền'}</button></div></form>`);
 const form=$('#member-form'),operationId=crypto.randomUUID();
 function preview(){if(edit)return;try{$('#initial-preview').innerHTML=`Hết hạn: <strong>${formatDate(addDays(form.joinedAt.value,30))}</strong><br><span class="helper">Ghi nhận khoản thu đầu tiên vào ngày bắt đầu, bằng phí gói tập.</span>`;}catch{$('#initial-preview').textContent='Chọn ngày bắt đầu hợp lệ.';}}
 preview();form.joinedAt.addEventListener('input',preview);
 form.addEventListener('submit',async e=>{e.preventDefault();await submitForm(form,async()=>{const fields=Object.fromEntries(new FormData(form));if(!edit)fields.expiresAt=addDays(fields.joinedAt,30);const clean=validateMember(fields);if(edit)await store.edit(m.id,clean);else await store.add(clean,operationId);},edit?'Đã cập nhật hồ sơ.':'Đã thêm thành viên và ghi nhận tiền.');});
}

function renewalForm(m){openModal(`${head('Gia hạn gói tập')}<form id="renew-form" class="modal-body"><p><strong>${esc(m.name)}</strong> · ${esc(m.phone)}</p><p class="helper" style="margin:8px 0 24px">Hạn hiện tại: ${formatDate(m.expiresAt)} · ${dayText(m)}</p><div class="form-grid"><label>Ngày đóng tiền *<input name="paidAt" type="date" min="${m.joinedAt}" max="${today()}" required value="${today()}"></label><label>Số tiền thu (đ) *<input name="amount" type="number" min="1" max="100000000" step="1" required value="${m.monthlyFee}"></label><div id="renew-preview" class="preview span-2"></div></div><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button type="button" data-action="close">Hủy</button><button class="primary" type="submit">Ghi nhận & gia hạn</button></div></form>`);
 const form=$('#renew-form'),operationId=crypto.randomUUID();function preview(){try{const d=form.paidAt.value;$('#renew-preview').innerHTML=`Hạn mới dự kiến: <strong>${formatDate(renewExpiry(m.expiresAt,d))}</strong><br><span class="helper">Cộng 30 ngày từ ${m.expiresAt>=d?'hạn cũ':'ngày đóng tiền'}. Hạn cuối sẽ tính lại theo dữ liệu mới nhất khi lưu.</span>`;}catch{$('#renew-preview').textContent='Chọn ngày đóng tiền hợp lệ.';}}preview();form.paidAt.addEventListener('input',preview);form.addEventListener('submit',async e=>{e.preventDefault();await submitForm(form,async()=>{validatePayment(form.paidAt.value,form.amount.value);await store.renew(m.id,form.paidAt.value,form.amount.value,operationId);},'Đã ghi nhận tiền và gia hạn 30 ngày.');});
}

async function submitForm(form,action,message){if(modalBusy)return;if(!ready){$('#form-error').textContent='Dữ liệu chưa đồng bộ. Hãy đóng và thử lại sau khi kết nối.';return;}modalBusy=true;const btn=form.querySelector('button[type=submit]'),text=btn.textContent;form.querySelectorAll('button').forEach(b=>b.disabled=true);btn.textContent='Đang lưu…';$('#form-error').textContent='';try{await action();modalBusy=false;closeModal(true);toast(message);}catch(e){$('#form-error').textContent=friendlyError(e);form.querySelector(':invalid')?.focus();}finally{modalBusy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);btn.textContent=text;}}

function detail(m){const payments=data.payments.filter(p=>p.memberId===m.id).sort((a,b)=>b.paidAt.localeCompare(a.paidAt));openModal(`${head('Chi tiết thành viên')}<div class="modal-body"><div class="member-info"><span class="avatar">${esc(initials(m.name))}</span><div><h3>${esc(m.name)}</h3><p class="muted">${esc(m.phone)}</p></div></div><dl class="detail-data"><div><dt>Ngày bắt đầu</dt><dd>${formatDate(m.joinedAt)}</dd></div><div><dt>Ngày hết hạn</dt><dd>${formatDate(m.expiresAt)} · ${dayText(m)}</dd></div><div><dt>Phí gói tập</dt><dd>${money(m.monthlyFee)}</dd></div><div><dt>Trạng thái</dt><dd>${badge(m)}</dd></div><div style="grid-column:1/-1"><dt>Ghi chú</dt><dd>${esc(m.notes||'Chưa có ghi chú')}</dd></div></dl><h3>Lịch sử đóng tiền</h3>${payments.length?`<ul class="history-list">${payments.map(p=>`<li><span>${formatDate(p.paidAt)} · ${p.kind==='initial'?'Đăng ký mới':'Gia hạn'}<small>Hạn mới ${formatDate(p.newExpiry)}</small></span><strong>${money(p.amount)}</strong></li>`).join('')}</ul>`:'<p class="helper">Chưa có khoản thu.</p>'}<div class="detail-delete"><button class="danger" data-action="delete" data-id="${esc(m.id)}">${icon('trash-2')}Xóa thành viên</button><p class="helper" style="margin-top:8px">Lịch sử thu tiền được giữ lại.</p></div></div>`);}

function deleteConfirm(m){modal.close();openModal(`${head('Xác nhận xóa thành viên')}<form id="delete-form" class="modal-body"><p>Bạn muốn xóa hồ sơ <strong>${esc(m.name)}</strong> (${esc(m.phone)})?</p><p class="helper" style="margin-top:12px">Không thể khôi phục hồ sơ bằng ứng dụng. Lịch sử thu tiền vẫn được giữ lại.</p><p id="form-error" class="error" role="alert"></p><div class="modal-actions"><button type="button" data-action="close">Không xóa</button><button class="danger" type="submit">Xóa thành viên</button></div></form>`);$('#delete-form').addEventListener('submit',async e=>{e.preventDefault();await submitForm(e.target,()=>store.remove(m.id),'Đã xóa hồ sơ, giữ lại lịch sử thu tiền.');});}

document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;const action=el.dataset.action,m=data.members.find(m=>m.id===el.dataset.id);if(action==='close')return closeModal();if(action==='alerts'){filter='all';query='';page=1;location.hash='alerts';return;}if(action==='add')return profileForm();if(action==='prev'){page--;render();return;}if(action==='next'){page++;render();return;}if(!ready||!m)return;if(action==='edit')profileForm(m);if(action==='renew')renewalForm(m);if(action==='detail')detail(m);if(action==='delete')deleteConfirm(m);});
$('#add-member').onclick=()=>{if(ready)profileForm();};
$('#view').addEventListener('input',e=>{if(e.target.id==='search'){query=e.target.value;page=1;const pos=e.target.selectionStart;render();const input=$('#search');input.focus();try{input.setSelectionRange(pos,pos);}catch{}}});
$('#view').addEventListener('change',e=>{if(e.target.id==='status-filter'){filter=e.target.value;page=1;render();}if(e.target.id==='sort'){sort=e.target.value;page=1;render();}});
window.addEventListener('hashchange',()=>{page=1;filter='all';query='';render();$('#content').focus();});

function network(){ $('#network-banner').hidden=navigator.onLine||demo;render(); }
window.addEventListener('offline',network);window.addEventListener('online',()=>{network();if(loggedIn&&!demo)connect();});
let lastDay=today();setInterval(()=>{if(today()!==lastDay){lastDay=today();render();}},30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});

if(demo)showApp();else watchAuth((user,error)=>{if(user){showApp();}else{loggedIn=false;ready=false;data={members:[],payments:[]};unsubscribe?.();unsubscribe=null;if(modal.open){modalBusy=false;closeModal(true);}$('#app-shell').hidden=true;$('#login-screen').hidden=false;if(error)$('#login-error').textContent=error;}});

// Sửa thành:
if(u){const el=$('#museUserNickname');if(el) el.textContent=u.nickname || u.email?.split('@')[0] || '';$('#museUser').hidden=false;const badgeSpan = document.querySelector('.muse-badge span'); if(badgeSpan) badgeSpan.style.display='none';}
refreshIcons();