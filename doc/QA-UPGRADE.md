# Rà soát chất lượng bản nâng cấp

## Trải nghiệm (đánh giá nguồn trước kiểm tra kỹ thuật)
Giao diện công cụ quản trị dùng cùng một họ chữ sans, màu kem–xanh ngọc đã được chọn, không dùng trang quảng cáo/animation trang trí. Tổng thu nổi bật, hai thẻ phụ giải thích số đăng ký và lượt gia hạn, bảng có giá trị rõ ràng thay vì biểu đồ chỉ mã màu. Cảnh báo nhãn trạng thái mở đúng ID, danh mục gói tách khỏi thao tác hội viên.

Điểm Nielsen tham khảo: trạng thái hệ thống 3, ngôn ngữ thực tế 3, quyền thoát 3, nhất quán 3, ngăn lỗi 3, nhận biết 3, hiệu suất thao tác 2, thẩm mỹ phù hợp công cụ 3, phục hồi lỗi 3, trợ giúp 3 = 29/40. Không phải chứng nhận usability.

Ưu điểm: mặc định gói/giá giảm nhập liệu, xem trước hạn; ngày thu độc lập; cancel/escape/dirty confirmation; không trộn số người với lượt gia hạn. Tải nhận thức vừa: 6 mục menu có nhãn, các gói nằm trong select; nhóm dữ liệu rõ. Không có keyboard shortcuts/bulk actions (P2 ngoài phạm vi). Biểu mẫu dùng modal để giữ cùng mẫu thao tác dự án; không thêm flow onboarding.

Các điểm ưu tiên đã xử lý: P1 UID rules sai; P1 ảnh cũ không bỏ được do trường không lưu rỗng; P1 gói mẫu biến mất khi tạo gói đầu tiên; P1 cảnh báo không mở đúng mã; lỗi runtime biến u không khai báo; nhãn gói 30 ngày gây nhầm đã cập nhật giao diện. Thẻ sắp đến hạn và quá hạn có liên kết lọc nhóm.

Persona: chủ phòng thao tác nhiều có search không dấu và mặc định giá nhưng chưa bulk; người dùng bàn phím có focus/label/native controls/Escape, báo cáo bảng đọc được; điện thoại có trường chọn ảnh/capture và nút tối thiểu 44px nhưng camera thật cần thử.

## Rà soát kỹ thuật và chi tiết
Điểm tham khảo: khả năng truy cập 3, hiệu năng 2, responsive 3, theme 3, mẫu giao diện 3 = 14/20. Chỉ giao diện light được yêu cầu, không có toggle dark. Token màu chính đồng nhất, còn một số màu trạng thái cố định từ dự án. Build Firebase chunk khoảng 686KB (gzip 170KB), P2 hiệu năng; không cản hoạt động. Layout không có animation kích thước và tôn trọng reduced motion. Google Fonts swap/system fallback; chỉ ảnh đăng nhập và ảnh hội viên.

Kiểm thử ảnh upload/preview/save/remove ở demo, không có ảnh thật gửi ra Firebase. Ảnh gRPC phụ thuộc Node đã vá bằng override cùng major 1.14.6, npm audit báo 0 lỗ hổng tại lần kiểm tra. Không force hạ cấp Firebase.

Phiên xem trước: duy nhất một fetch me, conditional app path, 401/network không crash; badge fixed skeleton và ảnh icon đúng, label thay theo đăng nhập. GitHub không gọi phiên xem trước.

## Bằng chứng chức năng
- Unit: tháng lịch cuối tháng/leap/year, cảnh báo 7/8 ngày, legacy 30 ngày, giá/duration sai, thống kê theo paidAt và kind, history sau delete, photo path/HTTPS, demo khoản thu ngày khác joinedAt, plan add/disable, bỏ ảnh, idempotency.
- Edge browser: thêm/sửa/ngừng gói, ảnh sai định dạng→ảnh hợp lệ→lưu→bỏ, camera capture attribute, thêm thực thu 450000 khác giá gói 500000, gia hạn thực thu 600000 khác giá gói 700000; tổng 3850000 trên fixture 2800000, một đăng ký và chín gia hạn; tháng/quý/năm/empty year; ID deep link và missing ID; XSS literal; no overflow 375/768/812 landscape/1440; 44px button targets; reduced motion; login guard. Không có page errors hay yêu cầu ghi production.
- npm run build thành công; git diff --check không lỗi whitespace.
- Hình giao diện điện thoại/máy tính được kiểm tra trực quan, các màn hình chỉ số/tables không tràn ngang. Ảnh screenshot là fixture minh họa, không dữ liệu phòng gym.

## Giới hạn / bước chủ tài khoản cần thực hiện
Không có Java/Firebase emulator/gcloud sẵn trên máy trong lần kiểm tra. Chưa chứng nhận Rules runtime, CORS live, owner login/Firestore/Storage thật hoặc camera native điện thoại. Cần Publish rules và kiểm tra CORS theo UPGRADE.md; không mở quyền công khai. Do lịch sử cũ không đổi, số liệu chỉ chính xác theo receipts đã lưu; không hoàn tiền/correction ledger. Có thể có ảnh orphan do storage/firestore không atomic. Không tự commit/push/deploy ngoài yêu cầu. Đây là điều kiện trước vận hành, không tuyên bố hoàn tất kết nối cloud.
