# PDF Sync Reader

Ứng dụng web đọc PDF cá nhân xây dựng với Next.js 15, Tailwind CSS 4 và Firebase. Người dùng có thể đăng nhập bằng Firebase Authentication, tải tài liệu lên Firebase Storage, đọc với đồng bộ tiến độ thời gian thực qua Firestore, ghi chú và sử dụng LibreTranslate để dịch nhanh nội dung ghi chú.

## Tính năng chính

- 🔐 **Đăng nhập Firebase Authentication** (Google OAuth mặc định).
- ☁️ **Lưu trữ PDF trên Firebase Storage** với upload trực tiếp từ trình duyệt.
- 🔄 **Đồng bộ tiến độ đọc** theo thời gian thực với Firestore (ghi nhận trang hiện tại và tổng số trang).
- 📝 **Quản lý ghi chú** cho từng tài liệu và từng trang, đồng bộ giữa các phiên.
- 🌐 **Tích hợp LibreTranslate** để dịch tự động ghi chú sang ngôn ngữ tùy chọn.
- 🎯 Giao diện hiện đại, sử dụng Tailwind CSS với dark mode thân thiện.

## Chuẩn bị môi trường

1. Tạo project Firebase và bật các dịch vụ:
   - Authentication (Google Sign-In hoặc phương thức bạn muốn hỗ trợ).
   - Firestore Database (chế độ production).
   - Firebase Storage.
2. Lấy cấu hình Web App trong Firebase Console:
   1. Mở [Firebase Console](https://console.firebase.google.com/), chọn project của bạn.
   2. Vào **Project settings** (biểu tượng bánh răng) ➜ tab **General**.
   3. Trong mục **Your apps**, tạo ứng dụng Web (nếu chưa có) và copy khối `firebaseConfig`.
   4. Mỗi trường trong `firebaseConfig` tương ứng trực tiếp với các biến môi trường dưới đây.
3. Tạo file `.env.local` ở thư mục gốc với các biến sau (dán giá trị vừa sao chép):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."           # firebaseConfig.projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."       # firebaseConfig.storageBucket (ví dụ: pdfeader-8d28b.appspot.com)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."  # firebaseConfig.messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID="..."               # firebaseConfig.appId
LIBRETRANSLATE_URL="https://libretranslate.com"           # Có thể thay bằng self-host
# LIBRETRANSLATE_API_KEY="..."                            # Nếu server yêu cầu API key
```

> **Lưu ý:**
> - Biến `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` phải là **tên bucket** (kết thúc bằng `.appspot.com`) lấy từ Firebase Console.
>   Nếu bạn dán nhầm domain tải xuống dạng `*.firebasestorage.app`, SDK sẽ báo lỗi ngay khi khởi tạo để bạn sửa lại.
> - Đảm bảo cấu hình CORS và quy tắc bảo mật Firestore/Storage phù hợp với ứng dụng của bạn.

### Thiết lập CORS cho Firebase Storage (khắc phục lỗi upload bị chặn)

Khi upload PDF từ trình duyệt, Firebase Storage cần cho phép origin `http://localhost:3000`. Nếu gặp lỗi CORS tương tự
`Response to preflight request doesn't pass access control check`, hãy cấu hình CORS cho bucket:

1. Cài [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) và chạy `gcloud auth login`.
2. Xuất cấu hình mẫu:

   ```bash
   cp config/storage-cors.json.template storage-cors.json
   ```

3. Mở file `storage-cors.json` vừa tạo, cập nhật trường `origin` để bao gồm tất cả domain bạn dùng (ví dụ: `http://localhost:3000`
   và domain production).
4. Áp dụng cấu hình cho bucket Firebase Storage (thường có dạng `<project-id>.appspot.com`):

   ```bash
   gsutil cors set storage-cors.json gs://<project-id>.appspot.com
   ```

5. Đợi vài phút rồi thử upload lại trên web app.

Nếu bạn dùng nhiều môi trường, lặp lại thao tác với từng bucket tương ứng. Firebase Storage mới với domain
`firebasestorage.app` vẫn sử dụng bucket đích `.appspot.com` nên đảm bảo biến môi trường `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
đúng với giá trị hiển thị trong Firebase Console. Khi dùng đúng SDK (`getStorage` + `uploadBytes`) và cấu hình đúng bucket,
việc upload thông thường không cần thêm thao tác CORS thủ công.

## Thiết lập Firebase Authentication

1. Trong Firebase Console, mở phần **Build → Authentication → Sign-in method**.
   - Bật nhà cung cấp **Google** (hoặc các provider khác mà bạn dùng) và thiết lập **Support email** bắt buộc.
2. Ở cùng trang, kéo xuống mục **Authorized domains** và thêm `localhost` (cho môi trường phát triển) cùng bất kỳ domain triển khai thực tế nào.
3. Nếu sử dụng Google Sign-In, truy cập **Project settings → General → Your apps → Web App** và đảm bảo giá trị `App nickname` cùng `App ID` hiển thị (điều này xác nhận web app đã đăng ký thành công).
4. Khi gặp lỗi `FirebaseError: auth/configuration-not-found`, hãy kiểm tra lại:
   - Provider đã được bật và có support email hợp lệ.
   - Domain hiện tại nằm trong danh sách Authorized domains.
   - Tệp `.env.local` sử dụng đúng thông tin `firebaseConfig` của Web App đang bật Authentication.

## Khắc phục lỗi Firestore realtime (mã 400 khi Listen)

Lỗi `https://firestore.googleapis.com/.../Listen` trả về `400` thường đến từ các nguyên nhân sau:

1. **App Check**: nếu đã bật App Check enforcement cho Web App, cần tích hợp SDK App Check vào ứng dụng hoặc tắt enforcement cho
   đến khi cấu hình xong.
2. **API key restriction**: đảm bảo API key dùng trong `.env.local` cho phép domain `http://localhost:3000`.
3. **Quy tắc Firestore**: xác nhận người dùng đăng nhập có quyền đọc/ghi qua tab **Firestore Database → Rules**.
4. **Cloud Firestore API**: kiểm tra [Google Cloud Console](https://console.cloud.google.com/apis/library/firestore.googleapis.com)
   để chắc chắn API đã được bật cho project.

Sau khi điều chỉnh, tải lại trang và xem Console trong trình duyệt để xác minh không còn log lỗi 400. Ứng dụng cũng sẽ hiển thị
thông báo chi tiết hơn nếu không thể kết nối Firestore realtime.

## Cài đặt & chạy dự án

```bash
npm install
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000).

## Cấu trúc chính

- `app/page.tsx`: giao diện chính gồm đăng nhập, thư viện PDF, trình đọc, đồng bộ tiến độ và ghi chú.
- `app/api/translate/route.ts`: API route proxy yêu cầu tới LibreTranslate.
- `lib/firebase.ts`: khởi tạo Firebase trên client.

## Kiểm thử

Do giới hạn môi trường trong container nên quá trình cài đặt phụ thuộc vào việc có thể truy cập npm registry. Nếu gặp lỗi 403, hãy kiểm tra lại quyền truy cập mạng hoặc dùng mirror nội bộ.

## Đóng góp

Pull request và góp ý luôn được hoan nghênh! Hãy đảm bảo cập nhật tài liệu nếu bạn thêm/bớt tính năng.
