# Đánh giá trải nghiệm — Gym Manager

Rà soát mã nguồn index.html, src/app.js và src/styles.css trước kiểm thử trình duyệt.

## Tổng thể
Giao diện quản trị theo phong cách thể thao đen–cam phù hợp lựa chọn B; bảng thành viên và kỳ gia hạn là trọng tâm, ảnh chỉ ở đăng nhập. Không có biểu đồ xu hướng giả hoặc thông báo thu tiền tự động. Bố cục quen thuộc có chủ đích, không trang trí quá mức.

## Điểm heuristic (đánh giá thiết kế, không chứng nhận)
| Tiêu chí | Điểm /4 | Ghi nhận |
|---|---:|---|
| Trạng thái hệ thống | 3 | Đồng bộ, lỗi, lưu và toast rõ; chờ dữ liệu còn dạng chữ |
| Ngôn ngữ nghiệp vụ | 3 | Tiếng Việt, phí/gia hạn; thiết lập có thuật ngữ Firebase |
| Kiểm soát và thoát | 3 | Hủy/Escape, xác nhận xóa; không có hoàn tác xóa |
| Nhất quán | 3 | Nút và biểu mẫu cùng hệ thống |
| Phòng ngừa lỗi | 3 | Ngày/số tiền/UID, giao dịch, chặn lưu lặp |
| Nhận biết | 3 | Nhãn điều hướng, lịch sử trong chi tiết |
| Hiệu suất thao tác | 2 | Tìm kiếm/phân trang; không thao tác hàng loạt hoặc phím tắt |
| Tối giản | 3 | 4 số liệu nghiệp vụ, không ảnh trên bảng |
| Khôi phục lỗi | 3 | Giữ biểu mẫu, thông báo khắc phục, thử lại kết nối |
| Hướng dẫn | 2 | Trợ giúp cạnh trường; cần README cấu hình |
| Tổng | 28/40 | Nền tảng tốt |

## Điểm mạnh
- Gia hạn có thông tin hạn cũ/ngày thu/hạn mới ngay cùng biểu mẫu.
- Cảnh báo phân biệt hôm nay với quá hạn; trạng thái có chữ, không chỉ màu.
- Xóa nằm trong chi tiết, được xác nhận và lịch sử tiền giữ lại.

## Vấn đề ưu tiên
1. P1: nhãn tìm kiếm dùng sr-only nhưng chưa có CSS tương ứng; cần ẩn đúng cho thị giác, giữ tên truy cập, căn icon không chồng nhãn.
2. P1: nút hiện mật khẩu chỉ 40px; tăng vùng chạm tối thiểu 44px.
3. P2: lịch sử không cho sửa khoản thu; chủ phòng tập cần biết đây là sổ bất biến, không phải công nợ/đối soát kế toán. Giải thích trong README và giao diện.
4. P2: chưa có hướng dẫn cấu hình Firebase/GitHub; cần README theo thứ tự rõ ràng.

## Cognitive load
4 thẻ số liệu là ngưỡng hợp lý. Có 5 mục điều hướng cùng cấp và 6 lựa chọn trạng thái trong dropdown: hai điểm vượt 4 lựa chọn nhưng không đồng thời với luồng biểu mẫu, mức tải vừa phải. Nhóm biểu mẫu hồ sơ tách thông tin/liên hệ/phí/ngày/ghi chú; gia hạn chỉ 2 trường.

## Personas và hành trình cảm xúc
Alex: tìm kiếm và gia hạn nhanh; không có batch là giới hạn phạm vi, không cần thêm. Sam: native dialog/focus/nhãn tốt, cần sửa sr-only và kiểm tra bàn phím. Casey: bảng chuyển thẻ và mặc định ngày/tiền giảm nhập; nút mật khẩu cần đủ lớn. Chủ phòng tập được trấn an ở thao tác nguy hiểm nhờ xác nhận và ghi rõ giữ lịch sử.

## Câu hỏi cân nhắc cho tương lai
Có cần hoàn tác hồ sơ xóa hoặc đối soát khoản thu? Không đưa thêm tính năng vào bản hiện tại khi chưa yêu cầu.

## Hành động
Sửa P1 trước kiểm tra kỹ thuật, sau đó kiểm thử luồng thực tế và viết README. Không còn P0 trong rà soát nguồn; kết nối production cần chủ tài khoản hoàn tất cấu hình và đăng nhập.
