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
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."       # firebaseConfig.storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."  # firebaseConfig.messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID="..."               # firebaseConfig.appId
LIBRETRANSLATE_URL="https://libretranslate.com"           # Có thể thay bằng self-host
# LIBRETRANSLATE_API_KEY="..."                            # Nếu server yêu cầu API key
```

> **Lưu ý:** đảm bảo cấu hình CORS và quy tắc bảo mật Firestore/Storage phù hợp với ứng dụng của bạn.

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
