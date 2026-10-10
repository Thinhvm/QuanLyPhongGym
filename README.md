# Gym Manager — Quản lý phòng gym

Website tiếng Việt, giao diện kem–xanh ngọc, dành cho một chủ phòng tập. Chạy trên GitHub Pages, dữ liệu trên Firebase Authentication + Cloud Firestore + Storage.

**Bản nâng cấp mới:** xem [doc/UPGRADE.md](doc/UPGRADE.md) để triển khai ảnh hội viên, danh mục gói tháng, cảnh báo 7 ngày và thống kê tháng/quý/năm. Hướng dẫn nâng cấp thay thế các mô tả gói 30 ngày/nhắc 3 ngày còn lưu trong phần tài liệu lịch sử bên dưới; dữ liệu hội viên cũ không tự chuyển hạn. Cần Publish cả `firestore.rules` và `storage.rules`, kiểm tra CORS ảnh trước khi dùng dữ liệu thật. Mã đã sửa trên máy, chưa commit/push hoặc thay đổi cấu hình cloud.

## Đã có trong mã nguồn
- Đăng nhập Email/Password, giới hạn một UID quản lý.
- Thêm/sửa/xóa hồ sơ, tìm kiếm tên không dấu hoặc số điện thoại, lọc trạng thái, sắp xếp và phân trang.
- Gói 30 ngày; nhắc trước 3 ngày, đến hạn hôm nay, quá hạn.
- Gia hạn và ghi nhận tiền trong cùng giao dịch Firestore, mã giao dịch chống lưu lặp.
- Lịch sử thu tiền giữ lại khi xóa thành viên; hồ sơ sửa không thay đổi khoản thu cũ.
- Bảng tổng quan, trang cảnh báo, lịch sử thu tiền, thiết lập; giao diện điện thoại.
- Bản minh họa qua `?demo=1`: dữ liệu giả trong bộ nhớ, không đọc/ghi Firestore, tải lại sẽ đặt lại.

Không có điểm danh, tự thanh toán, Zalo/email, thông báo khi website đã đóng, hoặc kế toán đối soát công nợ. Cảnh báo là trạng thái trong web, tự cập nhật khi đang mở.

## 1. Chuẩn bị Firebase (bắt buộc trước dữ liệu thật)
Project đã cấu hình: `quanlyphonggym-5d548`. UID quản lý: `OCeRxZjl97dKea1iQvnaxZJMUjo1`.

1. Mở Firebase Console, chọn project.
2. Authentication → Sign-in method → bật **Email/Password**. Trong Users, kiểm tra tài khoản dùng đăng nhập có UID đúng như trên. Không tạo tài khoản khác thay cho tài khoản này nếu muốn giữ UID.
3. Build → Firestore Database → Create database → chọn **Cloud Firestore**, database mặc định `(default)`, chế độ production. Chọn vị trí phù hợp; vị trí có tác động độ trễ và không dễ thay đổi sau khi tạo.
4. Firestore → Rules: sao lưu quy tắc cũ nếu đã có; sao chép **toàn bộ nội dung `firestore.rules`** rồi Publish. Không dùng `allow read, write: if true` hoặc mở quyền cho mọi người đăng nhập.
5. Authentication → Settings → Authorized domains: thêm `thinhvm.github.io` (chỉ tên miền, không đường dẫn, không `https://`). Nếu chạy máy cá nhân thêm `localhost` nếu chưa có. Nếu đăng nhập ở bản xem trước, thêm tên miền của bản xem trước khi cần; không thay đổi authDomain đang có.
6. Cấu hình web nằm ở `src/firebase-config.js`. API key Firebase web không phải khóa quản trị. Không đưa password, private key, service-account JSON hoặc token GitHub vào repository.

Có thể xuất bản rules bằng CLI thay vì bước 4: sau khi cài Firebase CLI và tự đăng nhập `firebase login`, chạy `firebase deploy --only firestore:rules --project quanlyphonggym-5d548`. Lệnh này thay đổi rules thật, cần kiểm tra trước khi chạy.

## 2. Đưa mã nguồn lên GitHub và bật Pages
Repository: https://github.com/Thinhvm/QuanLyPhongGym

**Cách A — Git trên máy cá nhân (giữ được tệp workflow ẩn)**
Cài Git và Node.js 22 hoặc phiên bản LTS tương thích. Giải nén bộ mã nguồn. Mở terminal trong thư mục có `package.json` và `.github`.

Nếu repository vẫn trống, chạy:
```bash
git init
git branch -M main
git add .
git commit -m "feat: add gym management website"
git remote add origin https://github.com/Thinhvm/QuanLyPhongGym.git
git push -u origin main
```
Git sẽ yêu cầu bạn xác thực tài khoản. Không chia sẻ token cho người khác. Nếu repository có thay đổi mới, clone trước, sao chép các tệp vào bản clone và kiểm tra diff; không dùng force push.

Trong GitHub repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**. Sau đó vào **Actions → Publish Gym Manager → Run workflow → main** nếu lần chạy đầu chưa tự triển khai. Đợi các bước build/deploy xanh.

**Cách B — Upload bằng giao diện GitHub**
Giải nén, Add file → Upload files. Tải lên `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `firebase.json`, `firestore.rules`, `README.md`, thư mục `src`, `public`, `tests`. Không tải `node_modules`.
Tạo workflow riêng bằng Add file → Create new file, nhập tên **`.github/workflows/pages.yml`**, dán nội dung file tương ứng từ bộ mã nguồn, rồi commit. Cách này tránh trình chọn tệp bỏ qua thư mục ẩn `.github`. Bật Pages GitHub Actions như Cách A.

Địa chỉ dự kiến sau triển khai thành công:
**https://thinhvm.github.io/QuanLyPhongGym/**
Địa chỉ này chưa được xác nhận hoạt động tại lúc bàn giao. Không mở `index.html` nguồn trực tiếp bằng file://; nguồn cần Vite build.

## 3. Chạy trên máy cá nhân
```bash
npm ci
npm test
npm run dev
```
Mở đường dẫn Vite hiển thị. Thêm `?demo=1` để thử bằng dữ liệu giả. Dùng địa chỉ không có `demo` để đăng nhập Firebase.

Xây dựng và thử bản production:
```bash
npm run build
npm run preview
```
Tệp production trong `dist/`. Vite base tương đối hỗ trợ đường dẫn `/QuanLyPhongGym/`.

## 4. Cách sử dụng và quy tắc ngày
- Thêm thành viên: nhập tên, điện thoại, phí 30 ngày, ngày bắt đầu. Ứng dụng thêm 30 ngày và ghi khoản thu đầu tiên bằng phí gói. Chỉ thêm theo luồng này nếu khoản thu thực sự đã nhận; ngày bắt đầu không được ở tương lai.
- Còn hạn khi gia hạn: cộng 30 ngày từ hạn cũ. Quá hạn: cộng từ ngày đóng tiền mới. Ngày thu không ở tương lai hoặc trước ngày bắt đầu.
- Ngày hết hạn được coi còn hiệu lực trong ngày đó; ngày tiếp theo mới quá hạn. Ngày tính theo `Asia/Ho_Chi_Minh`, không phụ thuộc múi giờ máy tính.
- Ví dụ bắt đầu 08/10/2026 → ngày hết hạn hiển thị 07/11/2026 (cộng 30 ngày). Cần hiểu đây là chênh lệch ngày, không phải tháng lịch.
- Sửa hồ sơ có thể điều chỉnh ngày hết hạn, nhưng không tạo khoản thu. Dùng nút Gia hạn khi nhận tiền.
- Xóa hồ sơ cần xác nhận và không có nút hoàn tác; lịch sử thu tiền không cho sửa/xóa trong ứng dụng. Đây là sổ ghi nhận đơn giản, chưa hỗ trợ hoàn tiền hoặc chỉnh sai khoản thu.
- Hai thao tác gia hạn độc lập được xem là hai khoản thu; mỗi lần chỉ nhấn cho một khoản nhận tiền thật. Giao dịch chỉ chống việc thử lại cùng mã thao tác, không nhận biết hai khoản thu là cùng một ý định.
- Mất mạng: ứng dụng không nhận ghi dữ liệu thật; nối mạng rồi thử lại.

## 5. Kiểm tra sau xuất bản (chủ tài khoản thực hiện)
1. Mở địa chỉ Pages không có `demo`, đăng nhập đúng tài khoản.
2. Nếu lỗi permission-denied, kiểm tra UID và Rules Publish. Nếu lỗi cấu hình, kiểm tra Firestore mặc định/Email Password.
3. Thêm một hồ sơ kiểm tra và ghi nhận khoản thu thử có chủ đích; kiểm tra Firestore `members` và `payments` cùng xuất hiện. Khoản thu không cho xóa qua ứng dụng, nên không tạo bừa dữ liệu giả vào database vận hành.
4. Đăng xuất rồi mở lại: danh sách không được hiển thị trước đăng nhập. Một tài khoản khác phải bị từ chối.
5. Gia hạn, kiểm tra hạn mới và khoản thu; thử trên điện thoại.

## 6. Bảo mật, chi phí và giới hạn kiểm thử
Firestore Rules là lớp bảo mật thật; client UID không đủ nếu rules mở. Các collection khác bị từ chối mặc định. Payments bất biến, create kiểm tra member sau giao dịch. Tài khoản owner có quyền sửa hồ sơ nên đây không phải hệ thống sổ kế toán chống gian lận.

SDK dùng lưu phiên đăng nhập theo tab/browser session; không lưu password hoặc sao lưu dữ liệu thành viên vào localStorage. Demo không lưu lâu dài. Cân nhắc App Check cho Firestore sau khi cấu hình và kiểm thử riêng; chưa bật sẵn để tránh chặn ứng dụng khi chưa có site key. Theo dõi quota/Usage Firebase: mỗi lần mở đọc danh sách thành viên và lịch sử, realtime phát sinh lượt đọc khi thay đổi; phân trang giao diện không giảm toàn bộ lượt đọc. Phù hợp quy mô phòng tập nhỏ/vừa, cần chuyển query phân trang phía server nếu dữ liệu rất lớn. Không cam kết chi phí bằng 0.

Đã kiểm thử 9 bài unit và hành trình Chromium minh họa: thêm/sửa/gia hạn/xóa có xác nhận, giữ lịch sử, tìm kiếm không dấu, lọc, cảnh báo, XSS hiển thị chữ, Escape/focus, 375/768/812/1440px, reduced motion, màn hình đăng nhập và lỗi đăng nhập giả lập. Không ghi dữ liệu production trong quá trình phát triển.
**Chưa kiểm thử đăng nhập thành công bằng mật khẩu của chủ tài khoản, ghi/đọc Firestore thật hoặc Rules bằng emulator**. Rules đã rà soát nguồn, chưa chứng nhận runtime. Website chưa được push vào repository hoặc bật Pages thay bạn vì chưa có quyền tài khoản. Kiểm tra production và áp dụng rules là điều kiện trước sử dụng vận hành.

## Tệp chính
`src/app.js`: giao diện; `src/logic.js`: nghiệp vụ; `src/data.js`: Firebase; `src/demo.js`: minh họa; `src/firebase-config.js`: cấu hình; `src/styles.css`: thiết kế; `firestore.rules`: bảo mật; `.github/workflows/pages.yml`: triển khai.
