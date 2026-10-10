import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, runTransaction, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { firebaseConfig, ADMIN_UID } from './firebase-config.js';
import { getStorage, ref, uploadBytes, getBlob } from 'firebase/storage';
import { validateMember, validatePayment, renewExpiry, validatePlan, DEFAULT_PLANS } from './logic.js';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage=getStorage(app);
function guard(){if(auth.currentUser?.uid!==ADMIN_UID)throw new Error('Bạn không có quyền quản lý.');if(!navigator.onLine)throw new Error('Đang ngoại tuyến. Kết nối mạng rồi thử lại.');}
export const watchAuth = fn => onAuthStateChanged(auth, async user => { if(user && user.uid !== ADMIN_UID){await signOut(auth);fn(null,'Tài khoản này không được cấp quyền quản lý.');}else fn(user); });
export async function login(email,password){await setPersistence(auth,browserSessionPersistence);const result=await signInWithEmailAndPassword(auth,email,password);if(result.user.uid!==ADMIN_UID){await signOut(auth);throw new Error('Tài khoản này không được cấp quyền quản lý.');}}
export const logout=()=>signOut(auth);
export const friendlyError = error => {
  const code=error?.code;
  return ({'auth/invalid-credential':'Email hoặc mật khẩu không đúng.', 'auth/invalid-email':'Email không hợp lệ.', 'auth/user-disabled':'Tài khoản đã bị vô hiệu hóa.', 'auth/operation-not-allowed':'Hãy bật đăng nhập Email/Password trong Firebase Authentication.', 'auth/too-many-requests':'Đăng nhập quá nhiều lần. Vui lòng thử lại sau.', 'auth/network-request-failed':'Không kết nối được Firebase. Kiểm tra mạng rồi thử lại.', 'permission-denied':'Không có quyền truy cập. Hãy kiểm tra UID và xuất bản firestore.rules trong Firebase.', 'unavailable':'Firebase tạm thời không khả dụng. Kiểm tra mạng rồi thử lại.', 'failed-precondition':'Kiểm tra đã tạo Cloud Firestore (database mặc định) trong Firebase Console.'})[code] || (code ? 'Không thể hoàn tất yêu cầu. Kiểm tra cấu hình Firebase và thử lại.' : error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
};
export const liveStore = {
  async uploadPhoto(blob){guard();const path=`member-photos/${ADMIN_UID}/${crypto.randomUUID()}.jpg`;await uploadBytes(ref(storage,path),blob,{contentType:'image/jpeg'});return path;},
  async photo(path){guard();return getBlob(ref(storage,path),1048576);},
  async savePlan(id,input){guard();const plan=validatePlan(input);await runTransaction(db,async tx=>{const refs=DEFAULT_PLANS.map(p=>doc(db,'plans',p.id)),snaps=[];for(const r of refs)snaps.push(await tx.get(r));const r=doc(db,'plans',id),s=await tx.get(r);for(let i=0;i<refs.length;i++){if(!snaps[i].exists()&&DEFAULT_PLANS[i].id!==id){const {id:unused,...preset}=DEFAULT_PLANS[i];tx.set(refs[i],{...preset,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}}tx.set(r,{...plan,createdAt:s.exists()?s.data().createdAt:serverTimestamp(),updatedAt:serverTimestamp()});});},
  listen(fn,onError){
    guard();let members=null,payments=null,plans=null,failed=false;
    const emit=()=>{if(!failed&&members&&payments&&plans)fn({members,payments,plans:plans.length?plans:structuredClone(DEFAULT_PLANS)});};
    const error=e=>{failed=true;onError(e);};
    const a=onSnapshot(collection(db,'members'),snap=>{members=snap.docs.map(d=>({id:d.id,...d.data()}));emit();},error);
    const b=onSnapshot(collection(db,'payments'),snap=>{payments=snap.docs.map(d=>({id:d.id,...d.data()}));emit();},error);
    const c=onSnapshot(collection(db,'plans'),snap=>{plans=snap.docs.map(d=>({id:d.id,...d.data()}));emit();},error);
    return()=>{a();b();c();};
  },
  async add(input,id,receipt={}){
    guard();const m=validateMember(input),paidAt=receipt.paidAt||m.joinedAt,amount=validatePayment(paidAt,receipt.amount??m.monthlyFee);
    const memberRef=doc(db,'members',id),paymentRef=doc(db,'payments',id);
    await runTransaction(db,async tx=>{
      const existing=await tx.get(paymentRef);if(existing.exists())return;
      const member=await tx.get(memberRef);if(member.exists())throw new Error('Mã thành viên đã tồn tại.');
      tx.set(memberRef,{...m,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      tx.set(paymentRef,{memberId:id,memberName:m.name,paidAt,amount,oldExpiry:m.joinedAt,newExpiry:m.expiresAt,kind:'initial',createdAt:serverTimestamp()});
    });
  },
  async edit(id,input){
    guard();const data={...validateMember(input),photoPath:input.photoPath||''},ref=doc(db,'members',id);
    await runTransaction(db,async tx=>{const snap=await tx.get(ref);if(!snap.exists())throw new Error('Thành viên không còn tồn tại.');tx.update(ref,{...data,updatedAt:serverTimestamp()});});
  },
  async renew(id,date,amount,operationId,plan){
    guard();const selected=plan?validatePlan(plan):null,n=validatePayment(date,amount),memberRef=doc(db,'members',id),paymentRef=doc(db,'payments',operationId);
    await runTransaction(db,async tx=>{
      const receipt=await tx.get(paymentRef);if(receipt.exists())return;
      const snap=await tx.get(memberRef);if(!snap.exists())throw new Error('Thành viên không còn tồn tại.');
      const m=snap.data();if(date<m.joinedAt)throw new Error('Ngày đóng tiền không được trước ngày bắt đầu.');
      const months=selected?.months||m.planMonths,newExpiry=renewExpiry(m.expiresAt,date,months);
      const packageData=selected?{planId:plan.id,planName:selected.name,planMonths:selected.months,monthlyFee:selected.price}:{};
      tx.update(memberRef,{...packageData,expiresAt:newExpiry,updatedAt:serverTimestamp()});
      tx.set(paymentRef,{memberId:id,memberName:m.name,paidAt:date,amount:n,oldExpiry:m.expiresAt,newExpiry,kind:'renewal',createdAt:serverTimestamp()});
    });
  },
  async remove(id){guard();await deleteDoc(doc(db,'members',id));}
};
