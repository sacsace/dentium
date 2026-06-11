# Dentium (India) — 프로그램 개발 현황

> **브랜드:** Dentium  
> **인도 법인:** Implantium India Private Limited  
> **프로젝트 폴더명:** Dentium India  
> **버전:** 1.0.0  
> **작성 기준:** 2026-06-10  
> **사이트 언어:** English (단일 언어)  
> **공식 도메인:** [https://www.dentium.in](https://www.dentium.in)  
> **참고 사이트:** [dentium.com](https://www.dentium.com/en/index.php) · [dentium.co.in](https://dentium.co.in/)

---

## 1. 프로젝트 개요

의료·치과 B2B 기업 **Implantium India Private Limited**를 위한 프리미엄 동적 웹사이트입니다.  
브랜드 사이트, B2B 쇼핑몰, 블로그/뉴스룸, 이벤트, 관리자 CMS를 하나의 Next.js 애플리케이션으로 통합했습니다.

| 구분 | 내용 |
|------|------|
| **목적** | Dentium 공식 인도 웹사이트(dentium.in) + B2B 주문/견적 플랫폼 (운영: Implantium India Private Limited) |
| **대상 사용자** | 치과의사·클리닉(B2B), 관리자(CMS) |
| **개발 상태** | **MVP 완료** — 로컬 개발·데모 가능, 프로덕션 배포 전 DB·도메인·결제 연동 필요 |

---

## 2. 개발 진행 요약

```
[████████████████░░░░] 약 85% — MVP 기능 구현 완료
```

| 영역 | 상태 | 비고 |
|------|------|------|
| 공개 사이트 (UI/페이지) | ✅ 완료 | 25+ 페이지, 밝은 톤 UI |
| 관리자 CMS | ✅ 완료 | CRUD + 대시보드 |
| B2B 인증/회원가입 | ✅ 완료 | GSTIN, DCI, PAN 등 인도 필드 |
| 장바구니 / 주문 / 견적 | ✅ 기본 완료 | 결제 게이트웨이 미연동 |
| SEO | ✅ 완료 | sitemap, robots, JSON-LD, OG |
| DB 시드 (dentium.co.in 기준) | ✅ 완료 | 제품·블로그·이벤트·오피스 |
| 결제 연동 | ⏳ 미구현 | Razorpay/Stripe 예정 |
| 이메일/SMS 알림 | ⏳ 미구현 | — |
| 다국어 (i18n) | ⏳ 미구현 | 영어 단일 |
| Popup Banner CMS | ⏳ 스키마만 | UI/API 미구현 |
| Admin UI 밝은 톤 | ⏳ 미적용 | 다크 사이드바 유지 |

---

## 3. 기술 스택

| 계층 | 기술 |
|------|------|
| **Framework** | Next.js 15.5 (App Router) |
| **UI** | React 19, TypeScript, Tailwind CSS 3.4 |
| **애니메이션** | Framer Motion 11 |
| **DB** | PostgreSQL + Prisma ORM 6 |
| **인증** | JWT (httpOnly Cookie, jose) |
| **상태 관리** | Zustand (장바구니) |
| **폼/검증** | React Hook Form, Zod |
| **이미지** | next/image, sharp |

---

## 4. 완료된 기능

### 4.1 공개 사이트 (`src/app/(site)/`)

| 페이지 | 경로 | 상태 | 설명 |
|--------|------|------|------|
| 홈 | `/` | ✅ | 히어로 슬라이더, 통계, 카테고리, 제품, 이벤트, 블로그, 뉴스레터 |
| About | `/about` | ✅ | CMS 연동 미션/비전 |
| Products | `/products` | ✅ | 카테고리·검색 필터, Login for Price |
| Product Detail | `/products/[slug]` | ✅ | 갤러리, 스펙, 장바구니, 견적 요청 |
| Shop | `/shop` | ✅ | B2B 쇼핑 필터 |
| Cart | `/shop/cart` | ✅ | 견적 모드 지원 |
| Blog / News | `/blog` | ✅ | type 필터 (blog/news) |
| Blog Detail | `/blog/[slug]` | ✅ | SEO, 조회수 |
| Events | `/events` | ✅ | 지역 필터 (North/West/South/East) |
| Event Detail | `/events/[slug]` | ✅ | — |
| Global Network | `/global-network` | ✅ | DB 오피스 목록 |
| Contact | `/contact` | ✅ | 문의 폼 (careers/partnership type) |
| Video Library | `/video-library` | ✅ | 정적 목록 |
| Dentium Study | `/dentium-study` | ✅ | 교육 콘텐츠 |
| Downloads | `/downloads` | ✅ | — |
| Gallery | `/gallery` | ✅ | — |
| FAQs | `/faqs` | ✅ | FAQ JSON-LD |
| Careers | `/careers` | ✅ | — |
| Terms / Privacy | `/terms`, `/privacy` | ✅ | — |
| Order Tracking | `/order-tracking` | ✅ | noindex |
| Login / Register | `/auth/*` | ✅ | B2B 2단계 가입 |
| My Account | `/account` | ✅ | 주문 내역, noindex |

### 4.2 UI/UX

- **메가 메뉴:** hover 시 전체 서브메뉴 패널, 라임 액센트 (`#C5D926`)
- **디자인 톤:** 밝은 블루-화이트 (`#FAFBFD`, `#F0F5FC`), 글래스 헤더
- **홈 애니메이션:** Ken Burns, parallax, Framer Motion 섹션 진입
- **반응형:** 모바일 햄버거 메뉴, 그리드 레이아웃

### 4.3 B2B 기능

- 로그인 시에만 가격 표시 (`showPrice`, Login for Price UI)
- 회원가입: GSTIN, DCI Number, PAN, State, City, Pincode
- 장바구니 (Zustand, localStorage persist)
- 주문 생성 API
- 견적 요청 API

### 4.4 관리자 CMS (`/admin`)

| 메뉴 | 경로 | 기능 |
|------|------|------|
| Dashboard | `/admin` | 통계 요약 |
| Products | `/admin/products` | CRUD, SEO 필드, 이미지 |
| Categories | `/admin/categories` | 계층 카테고리 |
| Blog / News | `/admin/posts` | BLOG/NEWS 타입 |
| Events | `/admin/events` | 지역(region) 필드 |
| Banners | `/admin/banners` | 메인 히어로 배너 |
| Orders | `/admin/orders` | 주문 상태 관리 |
| Quote Requests | `/admin/quotes` | 견적 문의 |
| Inquiries | `/admin/inquiries` | Contact 폼 |
| Users | `/admin/users` | B2B 사용자 |
| Global Offices | `/admin/offices` | 글로벌 네트워크 |
| Settings | `/admin/settings` | 사이트·연락처·**SEO** 설정 |

**관리자 계정 (시드):**

- URL: `http://localhost:3000/admin`
- ID: `root`
- Password: `admin123`

### 4.5 SEO

| 항목 | 파일/경로 |
|------|-----------|
| 메타데이터 빌더 | `src/lib/seo.ts` |
| JSON-LD 스키마 | `src/lib/seo-schemas.ts` |
| Sitemap | `/sitemap.xml` |
| Robots | `/robots.txt` |
| Organization / WebSite | 전역 + 홈 |
| Product / Article / Event / FAQ | 상세 페이지 |
| CMS SEO 연동 | Admin Settings → 홈 title/description/keywords |

### 4.6 API (`src/app/api/`)

```
auth/       login, register, logout, me
contact/    문의 접수
orders/     주문 생성
quotes/     견적 요청
upload/     이미지 업로드
admin/      products, categories, posts, events, banners,
            orders, inquiries, users, settings, offices
```

---

## 5. 데이터베이스 (Prisma)

### 모델

| 모델 | 용도 |
|------|------|
| `User` | B2B 회원 + Admin (역할: USER/ADMIN/SUPER_ADMIN) |
| `Category` | 제품/포스트 카테고리 (계층) |
| `Product` | 제품, SEO, 가격, 스펙(JSON) |
| `Post` | Blog / News |
| `Event` | 세미나·이벤트 |
| `Banner` | 메인 히어로 |
| `PopupBanner` | ⚠️ 스키마만 존재, UI 미구현 |
| `GlobalOffice` | 글로벌 네트워크 |
| `SiteSettings` | 사이트·SEO·연락처 |
| `ContactInquiry` | 문의 |
| `Order` / `OrderItem` | 주문 |
| `QuoteRequest` / `QuoteItem` | 견적 |

### 시드 데이터 (`npm run db:seed`)

- dentium.co.in 기준 연락처·주소·제품(Bright/SuperLine)·블로그·이벤트·글로벌 오피스
- 관리자 계정 자동 생성

---

## 6. 프로젝트 구조

```
Dentium India/
├── prisma/
│   ├── schema.prisma      # DB 스키마
│   └── seed.ts            # 초기 데이터
├── public/
│   ├── icon.svg           # 파비콘
│   └── uploads/           # 업로드 이미지
├── scripts/
│   ├── setup-db.ps1       # Windows DB 자동 설정
│   └── check-db.mjs       # DB 연결 확인
├── src/
│   ├── app/
│   │   ├── (site)/        # 공개 페이지 + layout (Header/Footer)
│   │   ├── admin/         # CMS (별도 layout)
│   │   ├── api/           # REST API
│   │   ├── layout.tsx     # Root (metadata, fonts)
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── admin/         # AdminSidebar, DataTable, AdminForm
│   │   ├── home/          # Hero, Stats, Parallax, Sections
│   │   ├── layout/        # Header (mega menu), Footer
│   │   ├── products/      # ProductCard, AddToCart
│   │   ├── seo/           # JsonLd
│   │   └── ui/            # Button, PageHeader, AnimatedSection
│   ├── lib/
│   │   ├── seo.ts         # SEO 유틸
│   │   ├── seo-schemas.ts # JSON-LD
│   │   ├── site-config.ts # dentium.co.in 상수
│   │   ├── navigation.ts  # 메가 메뉴 구조
│   │   ├── prisma.ts
│   │   └── auth.ts
│   └── store/
│       └── cart.ts        # Zustand 장바구니
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 7. 환경 설정 및 실행

### 7.1 필수 환경 변수 (`.env`)

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dentium_india?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ADMIN_EMAIL="root"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_APP_URL="https://www.dentium.in"
NEXT_PUBLIC_APP_NAME="Dentium"
```

로컬 개발 시에도 위 URL을 쓰면 sitemap·canonical·OG URL이 프로덕션 도메인으로 생성됩니다. 로컬 전용으로 쓰려면 `http://localhost:3000`으로 변경하세요.

### 7.2 설치 및 실행

```powershell
cd "D:\Software Project\Dentium India"
npm install

# DB 설정 (Windows — PostgreSQL 비밀번호 입력)
npm run db:setup

# 또는 수동
npm run db:push
npm run db:seed
npm run db:check

# 개발 서버 (NODE_ENV=production 이면 해제 필수)
$env:NODE_ENV=$null
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

### 7.3 npm scripts

| Script | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run clean` | `.next` 캐시 삭제 |
| `npm run db:setup` | Windows DB 자동 설정 |
| `npm run db:check` | DB 연결 테스트 |
| `npm run db:push` | Prisma 스키마 → DB |
| `npm run db:seed` | 시드 데이터 |
| `npm run db:studio` | Prisma Studio GUI |

### 7.4 프로덕션 빌드

```powershell
$env:NODE_ENV="production"
npm run build
npm start
```

---

## 8. 알려진 이슈 및 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| `Cannot find module './5611.js'` | `.next` 캐시 손상, dev 서버 중복 | `npm run clean` 후 dev 재시작 |
| `routes-manifest.json` ENOENT | 위와 동일 + NODE_ENV 충돌 | `$env:NODE_ENV=$null` 설정 |
| Prisma `Authentication failed` | `.env` DB 비밀번호 불일치 | `npm run db:setup` 또는 DATABASE_URL 수정 |
| 홈 데이터 비어 있음 | DB 미연결 | DB 연결 후 seed 실행 |
| `bg-white/92` CSS 오류 | Tailwind @apply opacity | `.glass-menu` 순수 CSS로 수정됨 |
| React duplicate key | 동일 href 중복 | `key={link.label}` 로 수정됨 |
| Windows NODE_ENV=production | dev/production 캐시 혼선 | dev 전 `$env:NODE_ENV=$null` |

---

## 9. 미구현 / 향후 개발 항목

### 우선순위 높음
- [ ] **결제 게이트웨이** (Razorpay — 인도 시장)
- [ ] **이메일 알림** (주문 확인, 견적, 회원가입)
- [ ] **프로덕션 배포** (Vercel/AWS + PostgreSQL 호스팅)
- [ ] `NEXT_PUBLIC_APP_URL=https://www.dentium.in` 설정

### 우선순위 중간
- [ ] Popup Banner CMS (스키마 `PopupBanner` 활용)
- [ ] Admin UI 밝은 톤 통일
- [ ] 비밀번호 재설정 실제 이메일 연동
- [ ] 주문 추적 실시간 연동
- [ ] 이미지 CDN (S3/Cloudinary)
- [ ] SMS OTP (회원가입)

### 우선순위 낮음
- [ ] 다국어 i18n
- [ ] 실제 YouTube/Vimeo 영상 embed
- [ ] E2E 테스트 (Playwright)
- [ ] CI/CD 파이프라인

---

## 10. 배포 체크리스트

- [ ] PostgreSQL 프로덕션 DB 준비
- [ ] `.env` 프로덕션 값 설정 (JWT_SECRET 변경 필수)
- [ ] `NEXT_PUBLIC_APP_URL=https://www.dentium.in`
- [ ] `npm run build` 성공 확인
- [ ] `/sitemap.xml`, `/robots.txt` 확인
- [ ] Google Search Console 등록
- [ ] HTTPS 적용
- [ ] 관리자 비밀번호 변경

---

## 11. 라이선스

Private — Implantium India Private Limited (Dentium brand, India)

---

## 12. 변경 이력 (요약)

| 날짜 | 내용 |
|------|------|
| 2026-06 | 프로젝트 초기 구축 (Next.js 15, Prisma, CMS) |
| 2026-06 | dentium.co.in 콘텐츠·B2B 필드·메가 메뉴 반영 |
| 2026-06 | 홈 동적 섹션, 밝은 UI 톤 적용 |
| 2026-06 | SEO 전면 적용 (sitemap, robots, JSON-LD, OG) |
| 2026-06 | DB 설정 스크립트, 캐시/빌드 이슈 문서화 |
