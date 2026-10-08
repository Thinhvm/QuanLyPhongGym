import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, runTransaction, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { firebaseConfig, ADMIN_UID } from './firebase-config.js';
import { validateMember, validatePayment, renewExpiry } from './logic.js';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
function guard(){if(auth.currentUser?.uid!==ADMIN_UID)throw new Error('Bạn không có quyền quản lý.');if(!navigator.onLine)throw new Error('Đang ngoại tuyến. Kết nối mạng rồi thử lại.');}
export const watchAuth = fn => onAuthStateChanged(auth, async user => { if(user && user.uid !== ADMIN_UID){await signOut(auth);fn(null,'Tài khoản này không được cấp quyền quản lý.');}else fn(user); });
export async function login(email,password){await setPersistence(auth,browserSessionPersistence);const result=await signInWithEmailAndPassword(auth,email,password);if(result.user.uid!==ADMIN_UID){await signOut(auth);throw new Error('Tài khoản này không được cấp quyền quản lý.');}}
export const logout=()=>signOut(auth);
export const friendlyError = error => {
  const code=error?.code;
  return ({'auth/invalid-credential':'Email hoặc mật khẩu không đúng.', 'auth/invalid-email':'Email không hợp lệ.', 'auth/user-disabled':'Tài khoản đã bị vô hiệu hóa.', 'auth/operation-not-allowed':'Hãy bật đăng nhập Email/Password trong Firebase Authentication.', 'auth/too-many-requests':'Đăng nhập quá nhiều lần. Vui lòng thử lại sau.', 'auth/network-request-failed':'Không kết nối được Firebase. Kiểm tra mạng rồi thử lại.', 'permission-denied':'Không có quyền truy cập. Hãy kiểm tra UID và xuất bản firestore.rules trong Firebase.', 'unavailable':'Firebase tạm thời không khả dụng. Kiểm tra mạng rồi thử lại.', 'failed-precondition':'Kiểm tra đã tạo Cloud Firestore (database mặc định) trong Firebase Console.'})[code] || (code ? 'Không thể hoàn tất yêu cầu. Kiểm tra cấu hình Firebase và thử lại.' : error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
};
export const liveStore = {
  listen(fn,onError){
    guard();let members=null,payments=null,failed=false;
    const emit=()=>{if(!failed&&members&&payments)fn({members,payments});};
    const error=e=>{failed=true;onError(e);};
    const a=onSnapshot(collection(db,'members'),snap=>{members=snap.docs.map(d=>({id:d.id,...d.data()}));emit();},error);
    const b=onSnapshot(collection(db,'payments'),snap=>{payments=snap.docs.map(d=>({id:d.id,...d.data()}));emit();},error);
    return()=>{a();b();};
  },
  async add(input,id){
    guard();const m=validateMember(input);validatePayment(m.joinedAt,m.monthlyFee);
    const memberRef=doc(db,'members',id),paymentRef=doc(db,'payments',id);
    await runTransaction(db,async tx=>{
      const existing=await tx.get(paymentRef);if(existing.exists())return;
      const member=await tx.get(memberRef);if(member.exists())throw new Error('Mã thành viên đã tồn tại.');
      tx.set(memberRef,{...m,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      tx.set(paymentRef,{memberId:id,memberName:m.name,paidAt:m.joinedAt,amount:m.monthlyFee,oldExpiry:m.joinedAt,newExpiry:m.expiresAt,kind:'initial',createdAt:serverTimestamp()});
    });
  },
  async edit(id,input){
    guard();const data=validateMember(input),ref=doc(db,'members',id);
    await runTransaction(db,async tx=>{const snap=await tx.get(ref);if(!snap.exists())throw new Error('Thành viên không còn tồn tại.');tx.update(ref,{...data,updatedAt:serverTimestamp()});});
  },
  async renew(id,date,amount,operationId){
    guard();const n=validatePayment(date,amount),memberRef=doc(db,'members',id),paymentRef=doc(db,'payments',operationId);
    await runTransaction(db,async tx=>{
      const receipt=await tx.get(paymentRef);if(receipt.exists())return;
      const snap=await tx.get(memberRef);if(!snap.exists())throw new Error('Thành viên không còn tồn tại.');
      const m=snap.data();if(date<m.joinedAt)throw new Error('Ngày đóng tiền không được trước ngày bắt đầu.');
      const newExpiry=renewExpiry(m.expiresAt,date);
      tx.update(memberRef,{expiresAt:newExpiry,updatedAt:serverTimestamp()});
      tx.set(paymentRef,{memberId:id,memberName:m.name,paidAt:date,amount:n,oldExpiry:m.expiresAt,newExpiry,kind:'renewal',createdAt:serverTimestamp()});
    });
  },
  async remove(id){guard();await deleteDoc(doc(db,'members',id));}
};
