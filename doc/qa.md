# Kiểm tra chất lượng Gym Manager

## Kết quả đã xác minh
- 9 kiểm thử Node đạt: ngày 30 ngày qua tháng/năm/năm nhuận, cảnh báo 3/1/0/-1 ngày, gia hạn còn hạn/quá hạn/hôm nay, dữ liệu sai, tìm không dấu, idempotency và giữ lịch sử.
- Chromium chạy cả dev và production: tổng quan 8/6/3/2 từ fixture; tìm không dấu; lọc quá hạn; thêm; sửa; gia hạn; 2 khoản thu trong chi tiết; hủy xóa; xác nhận xóa; giữ lịch sử; cảnh báo 5 thành viên; Escape trả focus; tải lại đặt lại demo; login che dữ liệu; lỗi login giả lập.
- Chuỗi HTML trong ghi chú hiển thị nguyên văn, không tạo thẻ hoặc chạy JavaScript.
- Kiểm tra 375x812, 768x1024, 812x375, 1440x900: không tràn ngang, nút >=44px, reduced motion tắt animation.
- Không pageerror, không POST Firestore trong test; không dùng password thật.
- Screenshot desktop/mobile/login được quan sát; hierarchy, spacing và màu đen–cam khớp design.
- Build Vite thành công, base './'; SDK Firebase tách chunk, app khoảng 39KB minified; ảnh PNG login ~1,1MB còn là P2 hiệu năng ở mạng yếu, không nằm trên bảng quản lý.
- User module: một shared session fetch trên /apps/{id}/, không gọi ở GitHub; 401/network fallback; badge icon + text logged-out, icon-only logged-in; link và icon đúng.
- Rules reviewed: UID exact, deny-default, member field checks and timestamp consistency, payments immutable, getAfter member expiry; collections agree with adapter.

## Vấn đề và xử lý
P1 nhãn sr-only thiếu CSS: đã sửa. P1 vùng chạm password và logout hẹp: đã sửa và kiểm thử. Import toàn bộ icon gây bundle nặng: chỉ import 23 icon, tách Firebase. Test chuyển route đọc dữ liệu quá sớm: chờ tiêu đề route mới rồi assert. Không còn P0/P1 cục bộ được phát hiện.

## Điểm audit /20 (không chứng nhận WCAG)
Accessibility 3, Performance 2, Responsive 4, Theming 3, Anti-patterns 3 = 15/20. Một số nền semantic còn màu trực tiếp, font metadata nhỏ, chưa screen-reader thật. Không chạy trên thiết bị vật lý, Safari hoặc Firefox; chưa có Lighthouse/axe. Không tuyên bố đạt WCAG toàn bộ.

## Giới hạn bắt buộc
Không truy cập account GitHub/Firebase để push, bật Pages, tạo database, publish rules hoặc thay authorized domains. Chưa login thành công/ghi Firestore production. Emulator rules chưa chạy (bộ phụ thuộc không cài ổn định trong môi trường), review nguồn không thay runtime proof. Owner cần làm theo README và kiểm thử trước dùng vận hành. Sổ payments không hỗ trợ sửa sai/hoàn tiền; dashboard phù hợp dữ liệu nhỏ/vừa, listener đọc toàn bộ.
