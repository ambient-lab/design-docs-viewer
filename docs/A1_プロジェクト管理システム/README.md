# A1 プロジェクト管理システム - README

## システム概要

A1プロジェクト管理システムは、プロジェクト情報の登録・更新・照会・検索を行うWebアプリケーションです。Next.js 14のApp Routerアーキテクチャで構築されており、Server ComponentsとClient Componentsを活用した最新のReact開発手法により、プロジェクトデータの効率的な管理を実現します。

### 主な特徴

- **App Router**: Next.js 14のファイルベースルーティング
- **Server Components**: サーバーサイドレンダリングによる高速な初期表示
- **Client Components**: インタラクティブなUIコンポーネント
- **データアクセス**: Prisma ORMによるタイプセーフなデータベース操作
- **バリデーション**: Zod + React Hook Formによる型安全な入力検証
- **API Routes**: RESTful APIによるデータ操作

---

## 機能一覧

### 画面機能（オンライン処理）

| 画面ID | 画面名 | 機能概要 | ルート |
|--------|--------|----------|--------|
| WA10101 | ログイン画面 | システムへのログイン認証 | `/auth/login` |
| WA10102 | メニュー画面 | 各機能へのナビゲーション | `/dashboard` |
| WA10201 | プロジェクト検索画面 | プロジェクトの一覧検索・表示 | `/projects` |
| WA10202 | プロジェクト詳細画面 | プロジェクト情報の詳細表示 | `/projects/[id]` |
| WA10203 | プロジェクト登録画面 | 新規プロジェクトの登録 | `/projects/new` |
| WA10204 | プロジェクト更新画面 | 既存プロジェクト情報の更新 | `/projects/[id]/edit` |
| WA10205 | プロジェクトアップロード画面 | CSVファイルによる一括登録 | `/projects/upload` |
| WA10206 | プロジェクトダウンロード画面 | プロジェクトデータのCSV出力 | `/projects/download` |

### バッチ処理（Cron Job）

| バッチID | バッチ名 | 処理概要 | エンドポイント |
|----------|----------|----------|---------------|
| BA1060101 | プロジェクト一括登録バッチ | CSVファイルからプロジェクトを一括登録 | `/api/cron/project-bulk-register` |
| BA1070101 | プロジェクト一括出力バッチ | プロジェクトデータをCSVファイルに出力 | `/api/cron/project-bulk-export` |

---

## システムアーキテクチャ

### アーキテクチャ概要図

```
┌─────────────────────────────────────────────────────────────┐
│                        プレゼンテーション層                    │
├─────────────────────────────────────────────────────────────┤
│  App Router Pages (Server Components)                      │
│  - プロジェクト検索ページ (app/projects/page.tsx)             │
│  - プロジェクト詳細ページ (app/projects/[id]/page.tsx)        │
│  - プロジェクト登録ページ (app/projects/new/page.tsx)         │
│  - プロジェクト更新ページ (app/projects/[id]/edit/page.tsx)   │
│  - アップロードページ (app/projects/upload/page.tsx)          │
│  - ダウンロードページ (app/projects/download/page.tsx)        │
│                                                             │
│  Client Components                                          │
│  - フォームコンポーネント (components/projects/*)             │
│  - 検索フィルター (components/search/*)                      │
│  - データテーブル (components/tables/*)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         API Routes層                         │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints (Route Handlers)                             │
│  - GET    /api/projects         (プロジェクト検索)           │
│  - GET    /api/projects/[id]    (プロジェクト詳細)           │
│  - POST   /api/projects         (プロジェクト登録)           │
│  - PUT    /api/projects/[id]    (プロジェクト更新)           │
│  - DELETE /api/projects/[id]    (プロジェクト削除)           │
│  - POST   /api/projects/upload  (ファイルアップロード)        │
│  - GET    /api/projects/download (CSVダウンロード)          │
│                                                             │
│  Cron Job Endpoints                                         │
│  - POST /api/cron/project-bulk-register                     │
│  - POST /api/cron/project-bulk-export                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         ビジネスロジック層                      │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (lib/services/*)                             │
│  - projectService.ts      (プロジェクト操作)                 │
│  - searchService.ts       (検索処理)                         │
│  - uploadService.ts       (ファイルアップロード)              │
│  - downloadService.ts     (ファイルダウンロード)              │
│  - batchService.ts        (バッチ処理)                       │
│                                                             │
│  Validation (lib/validations/*)                             │
│  - projectSchema.ts       (Zodスキーマ定義)                  │
│                                                             │
│  Utils (lib/utils/*)                                        │
│  - csv.ts                 (CSV処理)                          │
│  - formatter.ts           (データフォーマット)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        データアクセス層                         │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM (lib/prisma/*)                                  │
│  - prisma/client          (自動生成クライアント)              │
│  - repositories/          (リポジトリパターン)                │
│    - projectRepository.ts                                   │
│    - organizationRepository.ts                              │
│    - codeRepository.ts                                      │
│    - systemAccountRepository.ts                             │
│                                                             │
│  Prisma Schema (prisma/schema.prisma)                       │
│  - Project (プロジェクト情報モデル)                           │
│  - Organization (組織情報モデル)                              │
│  - Code (コード情報モデル)                                    │
│  - SystemAccount (アカウント情報モデル)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         データベース層                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL / SQLite                                        │
│  - PROJECT (プロジェクトテーブル)                              │
│  - ORGANIZATION (組織テーブル)                                │
│  - CODE (コードテーブル)                                       │
│  - SYSTEM_ACCOUNT (アカウントテーブル)                         │
│  - その他マスタテーブル                                        │
└─────────────────────────────────────────────────────────────┘
```

### レイヤー別責務

| レイヤー | 責務 | 主要コンポーネント |
|----------|------|-------------------|
| **プレゼンテーション層** | ルーティング、UI表示、ユーザー操作 | Server Components, Client Components |
| **API Routes層** | HTTPリクエスト処理、レスポンス生成 | Route Handlers, Middleware |
| **ビジネスロジック層** | 業務ロジック、データ検証、トランザクション制御 | Services, Validation Schemas |
| **データアクセス層** | データベースアクセス、クエリ実行 | Prisma Client, Repositories |
| **データベース層** | データ永続化 | PostgreSQL/SQLite |

---

## ディレクトリ構成

```
.
├── app/                                # Next.js App Router
│   ├── (auth)/                        # 認証グループ
│   │   └── login/
│   │       └── page.tsx              # ログイン画面
│   │
│   ├── (main)/                        # メイン機能グループ
│   │   ├── dashboard/
│   │   │   └── page.tsx              # メニュー画面
│   │   │
│   │   └── projects/
│   │       ├── page.tsx              # プロジェクト検索画面
│   │       ├── [id]/
│   │       │   ├── page.tsx          # プロジェクト詳細画面
│   │       │   └── edit/
│   │       │       └── page.tsx      # プロジェクト更新画面
│   │       ├── new/
│   │       │   └── page.tsx          # プロジェクト登録画面
│   │       ├── upload/
│   │       │   └── page.tsx          # アップロード画面
│   │       └── download/
│   │           └── page.tsx          # ダウンロード画面
│   │
│   ├── api/                           # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth認証
│   │   │
│   │   ├── projects/
│   │   │   ├── route.ts              # GET/POST /api/projects
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET/PUT/DELETE /api/projects/[id]
│   │   │   ├── upload/
│   │   │   │   └── route.ts          # POST /api/projects/upload
│   │   │   └── download/
│   │   │       └── route.ts          # GET /api/projects/download
│   │   │
│   │   └── cron/
│   │       ├── project-bulk-register/
│   │       │   └── route.ts          # BA1060101
│   │       └── project-bulk-export/
│   │           └── route.ts          # BA1070101
│   │
│   ├── layout.tsx                     # ルートレイアウト
│   └── providers.tsx                  # プロバイダー設定
│
├── components/                        # React コンポーネント
│   ├── ui/                           # UI基本コンポーネント
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── projects/                      # プロジェクト関連コンポーネント
│   │   ├── ProjectForm.tsx           # プロジェクトフォーム
│   │   ├── ProjectList.tsx           # プロジェクト一覧
│   │   ├── ProjectDetail.tsx         # プロジェクト詳細
│   │   ├── ProjectSearchForm.tsx     # 検索フォーム
│   │   └── ProjectTable.tsx          # データテーブル
│   │
│   ├── search/                        # 検索コンポーネント
│   │   ├── SearchFilter.tsx
│   │   └── SearchResults.tsx
│   │
│   └── common/                        # 共通コンポーネント
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── ErrorMessage.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                               # ビジネスロジック・ユーティリティ
│   ├── services/                      # サービス層
│   │   ├── projectService.ts
│   │   ├── searchService.ts
│   │   ├── uploadService.ts
│   │   ├── downloadService.ts
│   │   └── batchService.ts
│   │
│   ├── repositories/                  # リポジトリ層
│   │   ├── projectRepository.ts
│   │   ├── organizationRepository.ts
│   │   ├── codeRepository.ts
│   │   └── systemAccountRepository.ts
│   │
│   ├── validations/                   # バリデーションスキーマ
│   │   ├── projectSchema.ts
│   │   ├── searchSchema.ts
│   │   └── uploadSchema.ts
│   │
│   ├── utils/                         # ユーティリティ
│   │   ├── csv.ts                    # CSV処理
│   │   ├── formatter.ts              # データフォーマット
│   │   ├── date.ts                   # 日付処理
│   │   └── validator.ts              # バリデーション
│   │
│   ├── types/                         # TypeScript型定義
│   │   ├── project.ts
│   │   ├── api.ts
│   │   └── common.ts
│   │
│   ├── hooks/                         # カスタムフック
│   │   ├── useProjects.ts            # React Query hooks
│   │   ├── useProjectForm.ts
│   │   └── useSearch.ts
│   │
│   └── prisma.ts                      # Prismaクライアント
│
├── prisma/                            # Prisma ORM
│   ├── schema.prisma                  # データベーススキーマ
│   ├── migrations/                    # マイグレーションファイル
│   └── seed.ts                        # シードデータ
│
├── public/                            # 静的ファイル
│   ├── images/
│   └── files/
│
├── middleware.ts                      # Next.js ミドルウェア
├── next.config.js                     # Next.js 設定
├── tailwind.config.ts                 # Tailwind CSS 設定
├── tsconfig.json                      # TypeScript 設定
└── package.json                       # 依存関係
```

---

## データモデル概要

### Prisma Schema定義

```prisma
model Project {
  id              Int       @id @default(autoincrement())
  projectName     String    @db.VarChar(64)
  projectType     String    @db.Char(2)
  projectClass    String    @db.Char(2)
  salesAmount     Decimal?  @db.Decimal(10, 0)
  startDate       DateTime?
  endDate         DateTime?
  clientId        Int?
  projectManager  String?   @db.VarChar(64)
  note            String?   @db.VarChar(512)
  version         Int       @default(1)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization? @relation(fields: [organizationId], references: [id])
  organizationId  Int?

  @@map("PROJECT")
}

model Organization {
  id              Int       @id @default(autoincrement())
  organizationName String   @db.VarChar(64)
  projects        Project[]

  @@map("ORGANIZATION")
}

model Code {
  id              Int       @id @default(autoincrement())
  codeType        String    @db.VarChar(20)
  codeValue       String    @db.VarChar(20)
  codeName        String    @db.VarChar(100)

  @@unique([codeType, codeValue])
  @@map("CODE")
}

model SystemAccount {
  id              Int       @id @default(autoincrement())
  userId          String    @unique @db.VarChar(64)
  userName        String    @db.VarChar(64)
  password        String    @db.VarChar(255)

  @@map("SYSTEM_ACCOUNT")
}
```

### 主要テーブル

| テーブル物理名 | テーブル論理名 | 説明 |
|---------------|---------------|------|
| PROJECT | プロジェクト | プロジェクト基本情報 |
| ORGANIZATION | 組織 | 組織マスタ |
| CODE | コード | 汎用コードマスタ |
| SYSTEM_ACCOUNT | システムアカウント | ユーザーアカウント情報 |

---

## 設計ドキュメント

### 詳細設計書

| ドキュメント | 説明 | リンク |
|-------------|------|--------|
| **画面設計書** | 画面仕様、画面遷移、画面項目定義 | [01_画面設計書.md](./01_画面設計書.md) |
| **バッチ設計書** | バッチ仕様、処理フロー、テーブル移送表 | [02_バッチ設計書.md](./02_バッチ設計書.md) |
| **帳票設計書** | 帳票仕様、帳票レイアウト、項目定義 | [03_帳票設計書.md](./03_帳票設計書.md) |
| **ファイルIF設計書** | ファイルインターフェース仕様、レイアウト | [04_ファイルIF設計書.md](./04_ファイルIF設計書.md) |
| **メッセージ設計書** | メッセージ定義、エラーメッセージ一覧 | [05_メッセージ設計書.md](./05_メッセージ設計書.md) |
| **データモデル設計書** | テーブル定義、ER図、採番ルール | [06_データモデル設計書.md](./06_データモデル設計書.md) |
| **ジョブフロー設計書** | バッチジョブフロー、スケジュール定義 | [07_ジョブフロー設計書.md](./07_ジョブフロー設計書.md) |
| **テスト仕様書** | 単体テスト仕様、テストケース定義 | [08_テスト仕様書.md](./08_テスト仕様書.md) |

### 共通設計書

| ドキュメント | 説明 | リンク |
|-------------|------|--------|
| **開発標準** | UI標準、コーディング規約、テスト標準 | [../共通/開発標準.md](../共通/開発標準.md) |
| **コード設計書** | 共通コード定義、コード体系 | [../共通/コード設計書.md](../共通/コード設計書.md) |
| **ドメイン定義書** | 共通ドメイン定義、データ型定義 | [../共通/ドメイン定義書.md](../共通/ドメイン定義書.md) |
| **セキュリティ対応表** | セキュリティ要件、対策一覧 | [../共通/セキュリティ対応表.md](../共通/セキュリティ対応表.md) |

---

## 技術仕様

### フレームワーク・ライブラリ

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | Next.js | 14.x | React フルスタックフレームワーク |
| 言語 | TypeScript | 5.x | 型安全な開発 |
| UI フレームワーク | React | 18.x | UIコンポーネント |
| スタイリング | Tailwind CSS | 3.x | ユーティリティファーストCSS |
| ORM | Prisma | 5.x | データベースアクセス |
| データフェッチング | React Query (TanStack Query) | 5.x | サーバー状態管理 |
| フォーム | React Hook Form | 7.x | フォーム管理 |
| バリデーション | Zod | 3.x | スキーマバリデーション |
| 認証 | NextAuth.js | 4.x | 認証・認可 |
| データベース | PostgreSQL | 15.x | 本番環境DB |
| テストDB | SQLite | - | 開発・テスト環境DB |

### 開発環境

| 項目 | 内容 |
|------|------|
| **Node.js** | 20.x LTS |
| **パッケージマネージャー** | pnpm / npm / yarn |
| **IDE** | VS Code (推奨) |
| **バージョン管理** | Git |
| **テストフレームワーク** | Vitest, React Testing Library |
| **E2Eテスト** | Playwright |
| **リンター** | ESLint |
| **フォーマッター** | Prettier |

---

## 画面遷移概要

```
┌─────────────────┐
│  /auth/login    │
│  ログイン画面    │◀─── 未認証アクセス
└────────┬────────┘
         │ ログイン成功
         ▼
┌─────────────────┐
│  /dashboard     │
│  メニュー画面    │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│検索 │  │登録 │  │更新 │  │UP   │  │DOWN │
│/projects│/new │  │/edit│  │/upload│/download│
└──┬──┘  └─────┘  └─────┘  └─────┘  └─────┘
   │
   ▼
┌─────┐
│詳細 │
│/[id]│
└─────┘
```

### ルーティング戦略

- **認証**: NextAuth.jsによるミドルウェアベース認証
- **セッション管理**: JWTトークンベースセッション
- **データフェッチング**: Server Componentsでのサーバーサイドフェッチ
- **クライアント状態**: React Queryによるキャッシュ管理
- **楽観的更新**: React Queryのoptimistic updatesを活用

---

## API Routes設計

### RESTful APIエンドポイント

```typescript
// プロジェクト一覧・検索
GET    /api/projects?page=1&limit=10&search=keyword
Response: { data: Project[], total: number, page: number }

// プロジェクト詳細取得
GET    /api/projects/[id]
Response: { data: Project }

// プロジェクト新規登録
POST   /api/projects
Body:  { projectName, projectType, ... }
Response: { data: Project }

// プロジェクト更新
PUT    /api/projects/[id]
Body:  { projectName, projectType, version, ... }
Response: { data: Project }

// プロジェクト削除
DELETE /api/projects/[id]
Response: { success: boolean }

// CSVアップロード
POST   /api/projects/upload
Body:  FormData (CSV file)
Response: { success: boolean, count: number, errors: [] }

// CSVダウンロード
GET    /api/projects/download?filter=...
Response: CSV File Stream

// Cron Job - 一括登録
POST   /api/cron/project-bulk-register
Header: Authorization: Bearer [CRON_SECRET]
Response: { success: boolean, count: number }

// Cron Job - 一括出力
POST   /api/cron/project-bulk-export
Header: Authorization: Bearer [CRON_SECRET]
Response: { success: boolean, filePath: string }
```

### エラーレスポンス形式

```typescript
{
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_ERROR",
    message: "エラーメッセージ",
    details?: any
  }
}
```

---

## バッチ処理概要

### Cron Job実装パターン

Next.jsのApp Routerでは、Vercel Cronまたはexternal cron serviceを使用してバッチ処理を実装します。

```typescript
// app/api/cron/project-bulk-register/route.ts
export async function POST(request: Request) {
  // Cron secretによる認証
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // バッチ処理実行
  const result = await batchService.bulkRegister();

  return Response.json({
    success: true,
    count: result.count,
    timestamp: new Date().toISOString()
  });
}
```

### バッチジョブフロー

```
BA1060101: プロジェクト一括登録
┌──────────────────────────────────────┐
│ 1. ファイル読込 (S3/ローカル)          │
│    - CSVファイル取得                  │
│    - ヘッダー検証                     │
└───────────┬──────────────────────────┘
            ▼
┌──────────────────────────────────────┐
│ 2. データ検証 (Zod Schema)            │
│    - 型チェック                       │
│    - 必須チェック                     │
│    - 業務ルールチェック               │
└───────────┬──────────────────────────┘
            ▼
┌──────────────────────────────────────┐
│ 3. データベース登録 (Prisma)          │
│    - トランザクション制御             │
│    - 一括createMany処理               │
└───────────┬──────────────────────────┘
            ▼
┌──────────────────────────────────────┐
│ 4. 処理結果出力                       │
│    - ログ出力 (Vercel Logs)           │
│    - エラーレポート生成               │
└──────────────────────────────────────┘
```

---

## セキュリティ対策

### 実装済みセキュリティ機能

| 脅威 | 対策 | 実装箇所 |
|------|------|----------|
| **SQLインジェクション** | Prismaパラメータ化クエリ | Prisma Client |
| **XSS** | React自動エスケープ | JSX自動処理 |
| **CSRF** | SameSite Cookie, CSRFトークン | NextAuth.js, Middleware |
| **認証・認可** | JWT セッション、ミドルウェア認証 | NextAuth.js, middleware.ts |
| **パスワード** | bcrypt暗号化 | NextAuth.js Credentials |
| **ファイルアップロード** | ファイルタイプ・サイズ検証 | Zod Schema, Multer |
| **環境変数保護** | .env.local, サーバーサイド限定 | Next.js環境変数 |
| **API Rate Limiting** | レート制限ミドルウェア | Vercel Edge Config |

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## エラーハンドリング

### エラー種別と対応

| エラー種別 | HTTPステータス | 対応 |
|-----------|---------------|------|
| **バリデーションエラー** | 400 | エラーメッセージ表示（フォーム内） |
| **認証エラー** | 401 | ログイン画面へリダイレクト |
| **認可エラー** | 403 | アクセス拒否画面表示 |
| **データ不存在** | 404 | 404 Not Foundページ |
| **楽観ロックエラー** | 409 | 再取得促進メッセージ |
| **サーバーエラー** | 500 | error.tsxエラーバウンダリ |

### エラーバウンダリ実装

```typescript
// app/error.tsx (Error Boundary)
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  )
}
```

---

## テスト方針

### テストレベル

| レベル | 対象 | ツール | カバレッジ目標 |
|--------|------|--------|---------------|
| **単体テスト** | Components, Services, Utils | Vitest, React Testing Library | 80%以上 |
| **統合テスト** | API Routes, Database | Vitest, Prisma Mock | 主要パス100% |
| **E2Eテスト** | ユーザーフロー全体 | Playwright | 業務シナリオ100% |

### テストコード例

```typescript
// __tests__/services/projectService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { projectService } from '@/lib/services/projectService';

describe('ProjectService', () => {
  it('should create project successfully', async () => {
    const newProject = {
      projectName: 'Test Project',
      projectType: '01',
      projectClass: '01'
    };

    const result = await projectService.create(newProject);

    expect(result).toBeDefined();
    expect(result.projectName).toBe('Test Project');
  });
});
```

---

## 運用・保守

### ログ管理

| ログ種別 | 実装方法 | 保存先 |
|---------|---------|--------|
| **アプリケーションログ** | console.log/error | Vercel Logs / CloudWatch |
| **アクセスログ** | Next.js Analytics | Vercel Analytics |
| **エラーログ** | Error Boundary | Sentry / Vercel Logs |
| **バッチログ** | Cron Job実行ログ | Vercel Cron Logs |

### 環境変数管理

```env
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
CRON_SECRET="your-cron-secret"
```

### デプロイメント

- **開発環境**: `npm run dev` (localhost:3000)
- **ビルド**: `npm run build`
- **本番実行**: `npm run start`
- **Vercelデプロイ**: `vercel deploy --prod`

---

## 関連リンク

### プロジェクトリソース

- [設計書トップ](../README.md)
- [共通設計書](../共通/)
- [B1 顧客管理システム](../B1_顧客管理システム/)

### 外部ドキュメント

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 更新履歴

| 日付 | バージョン | 更新内容 | 更新者 |
|------|-----------|---------|--------|
| 2025-11-27 | 2.0.0 | Next.js 14 App Router版へ全面改訂 | システム管理者 |
| 2025-11-27 | 1.0.0 | 初版作成（Spring Boot版） | システム管理者 |

---

**Document End**
