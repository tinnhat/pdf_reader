# My PDF Desk

Ứng dụng Next.js đọc PDF cá nhân với các tính năng đồng bộ tiến độ, ghi chú và dịch văn bản theo thời gian thực. Front-end được xây dựng bằng Next.js 15, TypeScript và Tailwind CSS; backend API chạy ngay trên Next App Router và sử dụng MongoDB cho lưu trữ.

## Tính năng chính

- 📚 **Thư viện tài liệu cá nhân**: thêm PDF từ máy người dùng hoặc dùng sẵn mẫu `sample.pdf`.
- 📖 **Theo dõi tiến độ đọc**: đồng bộ vào MongoDB, phát luồng realtime bằng MongoDB change stream (SSE).
- 📝 **Ghi chú theo trang**: lưu note gắn với từng tài liệu.
- 🌐 **Dịch nhanh**: gọi API [LibreTranslate](https://libretranslate.com/) thông qua route `/api/translate`.
- 🧪 **Kiểm thử**: Vitest kiểm tra helper dựng payload gọi LibreTranslate.

## Cấu trúc thư mục nổi bật

```
app/
  api/                # Next.js API routes (progress, notes, translate, SSE)
  layout.tsx
  page.tsx            # Trang chính của ứng dụng
components/
  layout/
  library/
  notes/
  pdf/
  translation/
lib/
  repositories/       # Thao tác MongoDB
  server/             # Helper cho API dịch
  constants.ts, env.ts, mongodb.ts, types.ts
hooks/
  useReadingProgress.ts, useNotes.ts
```

Mỗi file React client đều có chú thích mô tả nhiệm vụ chính.

## Cấu hình môi trường

Tạo file `.env.local` ở thư mục gốc với các biến sau:

```bash
MONGODB_URI="mongodb://localhost:27017/pdf_reader"
MONGODB_DB="pdf_reader"
# Endpoint LibreTranslate, có thể dùng dịch vụ public hoặc tự host
LIBRE_TRANSLATE_URL="https://libretranslate.de/translate"
```

> 🔁 **Realtime**: Change Stream chỉ hoạt động nếu MongoDB chạy ở chế độ replica set (kể cả single-node). Xem tài liệu MongoDB để khởi động `mongod --replSet`.

## Thiết lập & chạy dự án

```bash
npm install
npm run dev
```

- Mặc định ứng dụng lắng nghe tại `http://localhost:3000`.
- Chọn tài liệu ở cột trái, tiến độ và ghi chú sẽ tự đồng bộ.

## Kiểm thử

Chạy toàn bộ test bằng Vitest:

```bash
npm run test
```

## Ghi chú triển khai

- API `/api/progress/stream` sử dụng Server-Sent Events (SSE) để nhận thay đổi từ MongoDB change stream, giúp tiến độ cập nhật realtime giữa nhiều phiên làm việc.
- Component `PdfReader` dùng [react-pdf](https://github.com/wojtekmaj/react-pdf). Nếu bạn triển khai trên môi trường hạn chế CSP, hãy cấu hình lại `pdfjs.GlobalWorkerOptions.workerSrc` trong component.
- Dịch vụ LibreTranslate không yêu cầu API key mặc định nhưng bạn nên tự triển khai hoặc cấu hình auth nếu dùng bản public.
