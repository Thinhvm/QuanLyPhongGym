import { today, addDays, validateMember, validatePayment, renewExpiry } from './logic.js';
export function createDemoStore() {
  const at = today();
  let members = [['Nguyễn Hoàng Nam','0901234001',12],['Trần Minh Anh','0901234002',3],['Lê Tuấn Kiệt','0901234003',-5],['Phạm Ngọc Linh','0901234004',0],['Đặng Quốc Huy','0901234005',2],['Võ Thanh Tùng','0901234006',18],['Bùi Khánh Vy','0901234007',-2],['Huỳnh Gia Bảo','0901234008',24]].map(([name,phone,days],i)=>({ id:`demo-${i}`,name,phone,monthlyFee:350000,joinedAt:addDays(at,-40),expiresAt:addDays(at,days),notes:'Dữ liệu minh họa, không phải thành viên thật.' }));
  let payments = members.map((m,i)=>({id:`payment-${i}`,memberId:m.id,memberName:m.name,paidAt:addDays(at,-i),amount:m.monthlyFee,oldExpiry:addDays(m.expiresAt,-30),newExpiry:m.expiresAt,kind:'renewal',createdAt:new Date().toISOString()}));
  const listeners = new Set();
  const notify=()=>listeners.forEach(fn=>fn({members:structuredClone(members),payments:structuredClone(payments)}));
  return {
    listen(fn){listeners.add(fn);notify();return()=>listeners.delete(fn);},
    async add(input,operationId){
      if(payments.some(p=>p.id===operationId)) return;
      const m=validateMember(input);validatePayment(m.joinedAt,m.monthlyFee);
      members.push({...m,id:operationId});payments.push({id:operationId,memberId:operationId,memberName:m.name,paidAt:m.joinedAt,amount:m.monthlyFee,oldExpiry:m.joinedAt,newExpiry:m.expiresAt,kind:'initial',createdAt:new Date().toISOString()});notify();
    },
    async edit(id,input){const index=members.findIndex(m=>m.id===id);if(index<0)throw new Error('Thành viên không còn tồn tại.');members[index]={...members[index],...validateMember(input)};notify();},
    async renew(id,date,amount,operationId){
      const n=validatePayment(date,amount);if(payments.some(p=>p.id===operationId))return;
      const m=members.find(m=>m.id===id);if(!m)throw new Error('Thành viên không còn tồn tại.');if(date<m.joinedAt)throw new Error('Ngày đóng tiền không được trước ngày bắt đầu.');
      const newExpiry=renewExpiry(m.expiresAt,date);
      payments.push({id:operationId,memberId:id,memberName:m.name,paidAt:date,amount:n,oldExpiry:m.expiresAt,newExpiry,kind:'renewal',createdAt:new Date().toISOString()});m.expiresAt=newExpiry;notify();
    },
    async remove(id){members=members.filter(m=>m.id!==id);notify();}
  };
}
