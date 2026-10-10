import { today, addDays, validateMember, validatePayment, renewExpiry, validatePlan, DEFAULT_PLANS } from './logic.js';
export function createDemoStore() {
  const at = today();
  let members = [['Nguyễn Hoàng Nam','0901234001',12],['Trần Minh Anh','0901234002',3],['Lê Tuấn Kiệt','0901234003',-5],['Phạm Ngọc Linh','0901234004',0],['Đặng Quốc Huy','0901234005',2],['Võ Thanh Tùng','0901234006',18],['Bùi Khánh Vy','0901234007',-2],['Huỳnh Gia Bảo','0901234008',24]].map(([name,phone,days],i)=>({ id:`demo-${i}`,name,phone,monthlyFee:350000,joinedAt:addDays(at,-40),expiresAt:addDays(at,days),notes:'Dữ liệu minh họa, không phải thành viên thật.' }));
  let payments = members.map((m,i)=>({id:`payment-${i}`,memberId:m.id,memberName:m.name,paidAt:addDays(at,-i),amount:m.monthlyFee,oldExpiry:addDays(m.expiresAt,-30),newExpiry:m.expiresAt,kind:'renewal',createdAt:new Date().toISOString()}));
  const listeners = new Set();
  let plans=structuredClone(DEFAULT_PLANS);const photos=new Map();
  const notify=()=>listeners.forEach(fn=>fn({members:structuredClone(members),payments:structuredClone(payments),plans:structuredClone(plans)}));
  return {
    async uploadPhoto(blob){const path=`member-photos/demo/${crypto.randomUUID()}.jpg`;photos.set(path,blob);return path;},
    async photo(path){if(!photos.has(path))throw new Error('Không tìm thấy ảnh.');return photos.get(path);},
    async savePlan(id,input){const p={id,...validatePlan(input)};const index=plans.findIndex(x=>x.id===id);if(index<0)plans.push(p);else plans[index]=p;notify();},
    listen(fn){listeners.add(fn);notify();return()=>listeners.delete(fn);},
    async add(input,operationId,receipt={}){
      if(payments.some(p=>p.id===operationId)) return;
      const m=validateMember(input),paidAt=receipt.paidAt||m.joinedAt,amount=validatePayment(paidAt,receipt.amount??m.monthlyFee);
      members.push({...m,id:operationId});payments.push({id:operationId,memberId:operationId,memberName:m.name,paidAt,amount,oldExpiry:m.joinedAt,newExpiry:m.expiresAt,kind:'initial',createdAt:new Date().toISOString()});notify();
    },
    async edit(id,input){const index=members.findIndex(m=>m.id===id);if(index<0)throw new Error('Thành viên không còn tồn tại.');members[index]={...members[index],...validateMember(input),photoPath:input.photoPath||''};notify();},
    async renew(id,date,amount,operationId,plan){
      const n=validatePayment(date,amount);if(payments.some(p=>p.id===operationId))return;
      const m=members.find(m=>m.id===id);if(!m)throw new Error('Thành viên không còn tồn tại.');if(date<m.joinedAt)throw new Error('Ngày đóng tiền không được trước ngày bắt đầu.');
      const selected=plan?validatePlan(plan):null,newExpiry=renewExpiry(m.expiresAt,date,selected?.months||m.planMonths);
      if(selected)Object.assign(m,{planId:plan.id,planName:selected.name,planMonths:selected.months,monthlyFee:selected.price});
      payments.push({id:operationId,memberId:id,memberName:m.name,paidAt:date,amount:n,oldExpiry:m.expiresAt,newExpiry,kind:'renewal',createdAt:new Date().toISOString()});m.expiresAt=newExpiry;notify();
    },
    async remove(id){members=members.filter(m=>m.id!==id);notify();}
  };
}
