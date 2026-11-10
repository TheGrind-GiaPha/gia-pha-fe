# VGMS Frontend — Gia Phả Management System

Frontend khung cho **VGMS**, dựng theo proposal:

- **React + TypeScript + Vite**
- **React Router** cho routing
- **TanStack Query** cho server state
- **Axios** cho API client
- **Tailwind CSS** + **Lucide React** cho UI

> Trạng thái: **Skeleton**. Đã có layout, routing, trang Tổng quan, trang Dòng họ gọi API thật, các trang placeholder cho Person/Tree/Approval/Events/Settings. Auth, Person, Tree, Approval workflow sẽ làm ở các task tiếp theo.

---

## 1. Stack

| Thành phần   | Công nghệ                        |
| ------------ | -------------------------------- |
| Build        | Vite 8                           |
| UI           | React 19 + TypeScript            |
| Routing      | React Router 7                   |
| Server state | TanStack Query 5                 |
| HTTP         | Axios                            |
| Styling      | Tailwind CSS 3                   |
| Icons        | Lucide React                     |
| Test         | Vitest + Testing Library + jsdom |
| Lint         | Oxlint                           |
| Format       | Prettier                         |

---

## 2. Cấu trúc

```
gia-pha-fe/
├── src/
│   ├── app/
│   │   └── router.tsx               # Khai báo route
│   ├── components/
│   │   ├── layout/AppLayout.tsx     # Sidebar + header + Outlet
│   │   └── ui/                      # Button, Card, Badge, PageHeader...
│   ├── features/
│   │   ├── auth/LoginPage.tsx       # Placeholder, chờ task Auth/JWT
│   │   ├── clans/ClansPage.tsx      # Gọi GET/POST /api/clans
│   │   ├── dashboard/               # Tổng quan
│   │   ├── persons/                 # Placeholder
│   │   ├── tree/                    # Placeholder
│   │   ├── approvals/               # Placeholder
│   │   ├── events/                  # Placeholder
│   │   ├── settings/                # Placeholder
│   │   └── not-found/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance
│   │   │   ├── clans.ts             # API calls
│   │   │   └── errors.ts            # ProblemDetails → message
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── styles/index.css             # Tailwind + design tokens
│   ├── test/setup.ts
│   ├── types/clan.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .prettierrc
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
└── package.json
```

---

## 3. Chạy dự án

### 3.1. Cài dependencies

```powershell
cd C:\Users\ThienNLH3\Desktop\TheGrind-GiaPha\gia-pha-fe
npm install
```

### 3.2. Cấu hình API

Copy `.env.example` thành `.env`:

```powershell
Copy-Item .env.example .env
```

Nội dung:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3.3. Chạy backend trước

Backend repo: `C:\Users\ThienNLH3\Desktop\TheGrind-GiaPha\gia-pha-be`

```powershell
cd C:\Users\ThienNLH3\Desktop\TheGrind-GiaPha\gia-pha-be
dotnet run --project APIs/GiaPha.APIs.csproj
```

API chạy ở `http://localhost:5000`; Swagger ở `/swagger`.

### 3.4. Chạy frontend

```powershell
cd C:\Users\ThienNLH3\Desktop\TheGrind-GiaPha\gia-pha-fe
npm run dev
```

Mở <http://localhost:5173>.

---

## 4. Routes hiện có

| Route        | Màn hình                | Trạng thái        |
| ------------ | ----------------------- | ----------------- |
| `/`          | Tổng quan               | Có, gọi API clans |
| `/clans`     | Danh sách + tạo dòng họ | Có, gọi API thật  |
| `/persons`   | Thành viên              | Placeholder       |
| `/tree`      | Cây phả hệ              | Placeholder       |
| `/approvals` | Duyệt đề xuất           | Placeholder       |
| `/events`    | Sự kiện & giỗ           | Placeholder       |
| `/settings`  | Cài đặt dòng họ         | Placeholder       |
| `/login`     | Đăng nhập               | Placeholder       |

---

## 5. Scripts

```powershell
npm run dev        # chạy dev server
npm run build      # typecheck + build production
npm run preview    # xem bản build
npm run lint       # oxlint
npm run test       # vitest watch
npm run test:run   # vitest chạy một lần
npm run format     # prettier
```

---

## 6. API integration

`src/lib/api/client.ts`:

```ts
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
})
```

`src/features/clans/ClansPage.tsx` dùng:

- `useQuery(['clans', search])` → `GET /api/clans?search=...`
- `useMutation(createClan)` → `POST /api/clans`
- `queryClient.invalidateQueries({ queryKey: ['clans'] })` sau khi tạo

---

## 7. Những gì chưa làm (cố ý)

- Auth/JWT, login thật, refresh token.
- Clan selector toàn cục (chọn dòng họ đang làm việc).
- Person CRUD + quan hệ + đời/chi.
- Cây phả hệ (React Flow/d3).
- ChangeRequest + Approval workflow + audit.
- Sự kiện/giỗ + lịch âm + .ics.
- Phả đồ/phả ký PDF.
- Import Excel/Word.
- Upload ảnh.

---

## 8. Quy ước Git

- `main`: nhánh ổn định.
- `develop`: nhánh tích hợp.
- `feature/<ten-task>`: nhánh tính năng.
- Commit message: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

Repo: <https://github.com/TheGrind-GiaPha/gia-pha-fe>
