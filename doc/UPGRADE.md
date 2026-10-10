# Bản nâng cấp quản lý phòng gym

## Đã bổ sung
- Giao diện kem–xanh ngọc, menu ngang, bố cục điện thoại.
- Ảnh hội viên: chọn ảnh điện thoại hoặc nút Chụp ảnh (camera gốc tùy trình duyệt). JPG/PNG/WebP tối đa 5 MB; tự thu nhỏ thành JPEG cạnh dài tối đa 800px và tối đa 1 MB. HEIC cần đổi sang JPG.
- Danh mục gói: 1 tháng 250.000đ, 2 tháng 500.000đ, 3 tháng 700.000đ; thêm/sửa thời lượng và giá, ngừng mở đăng ký. Gói 4 tháng chưa tự đặt giá; chủ phòng nhập giá phù hợp.
- Cảnh báo trước 7 ngày, hôm nay và quá hạn. Bấm thẻ cảnh báo để lọc nhóm; bấm nhãn trạng thái để mở đúng hồ sơ theo mã hội viên.
- Tổng quan và Thu tiền có thống kê theo tháng/quý/năm, bảng tiền thu từng tháng, số hội viên đăng ký mới và lượt gia hạn.
- Số tiền thực thu và ngày thực thu nhập độc lập với ngày bắt đầu tập và giá niêm yết.
- Quyền quản lý thống nhất UID đã xác nhận kết thúc MUjo1. Sửa lỗi biến chưa khai báo ở mã cũ.

## Bắt buộc áp dụng Firebase trước khi dùng dữ liệu thật
Không thay mật khẩu, UID hay cấu hình Firebase hiện có. Không mở quyền công khai.

1. Firebase Console → Firestore Database → Rules: sao lưu rules hiện có, dán toàn bộ `firestore.rules` của dự án và Publish. Các collection members/payments/plans chỉ chủ phòng được truy cập. Nếu chưa Publish rules mới, website có thể báo lỗi khi đọc danh mục gói.
2. Firebase Console → Storage → Rules: sao lưu rules hiện có, dán toàn bộ `storage.rules` và Publish. Ảnh chỉ đọc/tạo theo tài khoản chủ phòng, không có URL công khai với token dài hạn.
3. Firebase Authentication → Settings → Authorized domains: kiểm tra `thinhvm.github.io` và `localhost` nếu chạy thử máy cá nhân.
4. Ảnh dùng tải Blob có xác thực; Firebase Storage cần cấu hình CORS cho nguồn website. Nếu upload thành công nhưng không xem được ảnh và trình duyệt báo CORS, dùng Google Cloud CLI đã đăng nhập của chủ tài khoản:

```powershell
gcloud storage buckets update gs://quanlyphonggym-5d548.firebasestorage.app --cors-file=doc/storage-cors.json
```

Lệnh thay cấu hình bucket, chủ tài khoản kiểm tra trước khi chạy. Mẫu CORS chỉ dành cho GitHub Pages hiện tại và localhost cổng 5173. Nếu tên miền/cổng khác phải sửa danh sách. Không thay Storage Rules thành công khai để chữa lỗi CORS.

Có thể triển khai rules qua Firebase CLI sau khi chủ tài khoản tự đăng nhập:

```powershell
firebase deploy --only firestore:rules,storage --project quanlyphonggym-5d548
```

Quy tắc mới giới hạn chức năng ngoài phạm vi ứng dụng; nếu cùng Firebase project/bucket có hệ thống khác, cần hợp nhất rules thay vì dán ghi đè các quyền hệ thống đó.

## Xem thử trên máy và xuất bản

```powershell
npm ci
npm test
npm run dev
```

Mở http://localhost:5173/?demo=1 để thử không ghi Firebase. Chỉ dùng dữ liệu thật khi bỏ `demo` và đăng nhập đúng chủ phòng. Không mở index.html trực tiếp bằng file://.

Đã sửa mã trên máy, chưa commit/push hoặc Publish rules/CORS thay chủ tài khoản. GitHub Actions hiện có sẽ build và triển khai Pages sau khi commit/push được chủ tài khoản cho phép. Kiểm tra `git status` và diff trước, không dùng force push hoặc đẩy node_modules/dist. Nguồn cần thêm tệp mới: `src/features.js`, `storage.rules`, `tests/upgrade.test.js`, `tests/upgrade-browser.mjs`, tài liệu này và storage-cors.json.

## Cách tính và tương thích dữ liệu cũ
- Tháng lịch: 31/01/2026 + 1 tháng = 28/02/2026. Bắt đầu 10/10/2026 + 1 tháng = hết hạn 10/11/2026, còn hiệu lực trong ngày hết hạn. Gia hạn nối từ hạn cũ nếu còn hạn, nếu hết hạn nối từ ngày thu mới.
- Không tự chuyển hạn hội viên cũ. Hồ sơ chưa có gói mới tiếp tục gia hạn 30 ngày; chọn gói tháng khi gia hạn để chuyển sang tháng lịch.
- Sửa hồ sơ/giá/gói không tự đổi ngày hết hạn, không sửa khoản thu lịch sử. Khi thực nhận tiền phải dùng Gia hạn.
- Hội viên mới thống kê theo khoản thu `initial` và ngày thu; đếm riêng mã hội viên. Không phải số hồ sơ còn trong danh sách hiện tại hoặc số người theo ngày bắt đầu tập. Gia hạn thống kê theo số khoản `renewal`, không phải số người duy nhất. Thu nhập ở đây là tiền thu gộp, chưa trừ chi phí/hoàn tiền, không phải lợi nhuận.
- Lịch sử được giữ khi xóa hồ sơ. Nếu trước đây ghi sai ngày/số tiền hoặc chỉ nhập hồ sơ mà không có khoản thu, thống kê không tự suy đoán/sửa lại. Không chỉnh khoản thu cũ trong ứng dụng; chưa có quy trình bù trừ/hoàn tiền.
- Ngừng gói không xóa gói khỏi hội viên cũ; dữ liệu gói đã lưu trong hồ sơ không bị thay tự động khi sửa bảng giá.
- Ảnh mới lưu riêng trong Storage. Bỏ/thay ảnh chỉ bỏ liên kết trên hồ sơ; ảnh cũ không tự xóa khỏi bucket. Upload thành công nhưng lưu hồ sơ thất bại có thể để lại ảnh chưa liên kết. Chủ phòng quản lý/xóa thủ công nếu cần, có xác nhận; cần theo dõi dung lượng/chi phí Firebase.

## Bằng chứng kiểm thử
Đã chạy test nghiệp vụ/hồi quy, build production và hành trình Edge minh họa: thêm/sửa/ngừng gói, ảnh sai định dạng/xem trước/lưu/bỏ ảnh, khoản thu khác giá gói, gia hạn tháng lịch, thống kê tháng/quý/năm với tổng kiểm chứng, link cảnh báo đúng mã hội viên và mã không tồn tại, XSS hiển thị chữ, không tràn ngang 375/768/812/1440, giảm chuyển động và màn hình đăng nhập. Không phát sinh ghi Firestore/Storage production.

Audit phụ thuộc đã xử lý bản gRPC cũ bằng override 1.14.6 (cùng phiên bản lớn); npm audit báo 0 lỗ hổng tại lần chạy kiểm tra. Bundle Firebase còn cảnh báo kích thước lớn, không cản build; không phải cam kết không có lỗi bảo mật.

**Chưa kiểm thử**: đăng nhập chủ phòng thật, đọc/ghi Firebase thật, rules bằng emulator, cấu hình CORS thật, bật camera trên điện thoại thật. Sau Publish rules, chủ phòng kiểm tra bằng một khoản giao dịch có chủ đích, không ghi dữ liệu giả vào database vận hành. Kiểm tra tài khoản khác bị từ chối và ảnh không đọc được khi chưa đăng nhập.

## Khôi phục
Mã trước nâng cấp đã sao lưu tại thư mục cùng cấp `QuanLyPhongGym.history/20261010_093705` (không gồm .git/node_modules/dist). Không tự xóa dữ liệu Firebase hoặc force reset Git. Việc khôi phục mã cần đồng bộ lại rules phù hợp, không xóa các trường/collection mới tùy tiện.
