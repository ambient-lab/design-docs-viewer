# B1 顧客管理システム

## システム概要

顧客情報を管理するNext.js API Routesベースのシステムです。Next.js 14のApp Routerを使用し、顧客の検索、詳細照会、登録、更新、削除の機能を提供します。

### 主な特徴

- **Next.js 14 API Routes**: App Routerによる型安全なAPI実装
- **Prisma ORM**: タイプセーフなデータベースアクセス
- **Zod Validation**: スキーマベースの入力検証
- **NextAuth.js**: API認証・認可機能

## 主要機能

本システムは以下の5つのAPI機能で構成されています：

| API ID | 機能名 | HTTPメソッド | エンドポイント | 説明 |
|--------|--------|--------------|----------------|------|
| B10101 | 顧客検索API | GET | `/api/customers` | 検索条件に基づいて顧客情報を一覧取得 |
| B10102 | 顧客詳細照会API | GET | `/api/customers/[id]` | 指定された顧客IDの詳細情報を取得 |
| B10103 | 顧客登録API | POST | `/api/customers` | 新規顧客情報を登録 |
| B10104 | 顧客更新API | PUT | `/api/customers/[id]` | 既存顧客情報を更新 |
| B10105 | 顧客削除API | DELETE | `/api/customers/[id]` | 指定された顧客情報を削除 |

## アーキテクチャ

### システム構成

```
API Routes → Service層 → Prisma Client → Database
    ↓           ↓            ↓
  リクエスト  ビジネス    型安全な
  ハンドリング ロジック   データアクセス
```

### 各層の責務

- **API Routes層**: HTTPリクエストの受付、バリデーション、レスポンス返却
- **Service層**: ビジネスロジックの実装とトランザクション制御
- **Prisma Client層**: 型安全なデータベースアクセスとクエリ実行
- **Database**: 顧客情報の永続化

### Next.js API Routes構成

```
app/
└── api/
    └── customers/
        ├── route.ts              # GET (一覧), POST (登録)
        └── [id]/
            └── route.ts          # GET (詳細), PUT (更新), DELETE (削除)
```

## プロジェクト構成

```
src/
├── app/
│   └── api/
│       └── customers/
│           ├── route.ts                    # 顧客一覧・登録API
│           └── [id]/
│               └── route.ts                # 顧客詳細・更新・削除API
├── lib/
│   ├── prisma.ts                          # Prisma Clientシングルトン
│   ├── auth.ts                            # NextAuth設定
│   └── validation/
│       └── customer.ts                     # Zodスキーマ定義
├── services/
│   └── customer.service.ts                 # 顧客ビジネスロジック
├── types/
│   └── customer.ts                         # 顧客型定義
└── prisma/
    ├── schema.prisma                       # Prismaスキーマ
    └── migrations/                         # マイグレーションファイル
```

## 設計書リンク

各APIの詳細設計書は以下を参照してください：

### API設計書
- [B10101_顧客検索API.md](./B10101_顧客検索API.md)
- [B10102_顧客詳細照会API.md](./B10102_顧客詳細照会API.md)
- [B10103_顧客登録API.md](./B10103_顧客登録API.md)
- [B10104_顧客更新API.md](./B10104_顧客更新API.md)
- [B10105_顧客削除API.md](./B10105_顧客削除API.md)

### データベース設計
- [DB設計書](../共通/DB設計書.md) - 顧客テーブル（customers）の詳細

### 共通仕様
- [共通エラーハンドリング](../共通/エラーハンドリング仕様.md)
- [共通バリデーション仕様](../共通/バリデーション仕様.md)

## データモデル

### Prismaスキーマ（Customer）

```prisma
model Customer {
  id           BigInt    @id @default(autoincrement()) @map("customer_id")
  name         String    @db.VarChar(100) @map("customer_name")
  email        String    @unique @db.VarChar(255)
  phoneNumber  String?   @db.VarChar(20) @map("phone_number")
  address      String?   @db.VarChar(255)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@map("customers")
}
```

### テーブル定義

| 項目名 | 物理名 | 型 | 必須 | 説明 |
|--------|--------|-----|------|------|
| 顧客ID | customer_id | BIGINT | ○ | 主キー、自動採番 |
| 顧客名 | customer_name | VARCHAR(100) | ○ | 顧客の名前 |
| メールアドレス | email | VARCHAR(255) | ○ | ユニーク制約 |
| 電話番号 | phone_number | VARCHAR(20) | - | ハイフンなし形式 |
| 住所 | address | VARCHAR(255) | - | 顧客の住所 |
| 作成日時 | created_at | TIMESTAMP | ○ | レコード作成日時 |
| 更新日時 | updated_at | TIMESTAMP | ○ | レコード更新日時 |

## 技術スタック

### コアフレームワーク
- **Next.js**: 14.x (App Router)
- **React**: 18.x
- **TypeScript**: 5.x

### データベース・ORM
- **Prisma ORM**: 5.x
- **データベース**: PostgreSQL 14.x / MySQL 8.x

### バリデーション・認証
- **Zod**: スキーマバリデーション
- **NextAuth.js**: 認証・認可

### 開発ツール
- **ESLint**: コード品質
- **Prettier**: コードフォーマット
- **TypeScript**: 型安全性

## API実装パターン

### Route Handlerの基本構造

```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/customer.service';
import { customerSearchSchema } from '@/lib/validation/customer';

// GET /api/customers - 顧客検索
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = customerSearchSchema.parse({
      name: searchParams.get('name'),
      email: searchParams.get('email'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    });

    const result = await customerService.search(params);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/customers - 顧客登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = customerCreateSchema.parse(body);

    const customer = await customerService.create(validatedData);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
```

### Dynamic Route Handler

```typescript
// app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/customers/[id] - 顧客詳細
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customer = await customerService.findById(BigInt(params.id));
  if (!customer) {
    return NextResponse.json(
      { error: '顧客が見つかりません' },
      { status: 404 }
    );
  }
  return NextResponse.json(customer);
}

// PUT /api/customers/[id] - 顧客更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validatedData = customerUpdateSchema.parse(body);

  const customer = await customerService.update(
    BigInt(params.id),
    validatedData
  );
  return NextResponse.json(customer);
}

// DELETE /api/customers/[id] - 顧客削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await customerService.delete(BigInt(params.id));
  return new NextResponse(null, { status: 204 });
}
```

## 共通仕様

### リクエスト仕様
- Content-Type: `application/json`
- 文字コード: UTF-8
- 日時フォーマット: ISO 8601形式（`yyyy-MM-dd'T'HH:mm:ss.SSSZ`）
- 認証ヘッダー: `Authorization: Bearer {token}`（NextAuth.jsトークン）

### レスポンス仕様
- Content-Type: `application/json`
- 文字コード: UTF-8
- 成功時: HTTPステータス 200/201/204
- エラー時: 適切なHTTPステータスコードとエラーメッセージ

### エラーレスポンス形式

```json
{
  "error": "Bad Request",
  "message": "入力値が不正です",
  "details": [
    {
      "field": "email",
      "message": "有効なメールアドレスを入力してください"
    }
  ],
  "timestamp": "2025-11-27T10:30:45.123Z",
  "path": "/api/customers"
}
```

## バリデーション

### Zodスキーマ定義

```typescript
// lib/validation/customer.ts
import { z } from 'zod';

export const customerCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phoneNumber: z.string().regex(/^\d{10,11}$/).optional(),
  address: z.string().max(255).optional(),
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerSearchSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});
```

### 共通バリデーションルール

- **顧客名**: 必須、1-100文字
- **メールアドレス**: 必須、メール形式、最大255文字、重複不可
- **電話番号**: 任意、数字のみ10-11桁
- **住所**: 任意、最大255文字

詳細は[バリデーション仕様書](../共通/バリデーション仕様.md)を参照してください。

## セキュリティ

### 認証・認可
- **認証**: NextAuth.js による JWT トークン認証
- **認可**: ミドルウェアによるロールベースアクセス制御
- **APIルート保護**: 認証ミドルウェアによる保護

### セキュリティ対策
- **入力値検証**: Zodによる厳密なスキーマ検証
- **SQLインジェクション対策**: Prismaのパラメータバインディング
- **XSS対策**: Next.jsの自動エスケープ機能
- **CSRF対策**: Next.js組み込みのCSRF保護

### 認証実装例

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('認証が必要です');
  }
  return session;
}

// API Routeでの使用
export async function GET(request: NextRequest) {
  await requireAuth(); // 認証チェック
  // ...API処理
}
```

## パフォーマンス考慮事項

### データベース最適化
- **ページネーション**: Prismaのtake/skip機能による効率的なページング
- **インデックス**: customer_id (主キー)、email (ユニーク) に自動インデックス
- **接続プール**: Prisma接続プール管理（デフォルト設定）

### Prisma最適化

```typescript
// 効率的なクエリ例
const customers = await prisma.customer.findMany({
  where: { name: { contains: searchName } },
  select: {
    id: true,
    name: true,
    email: true,
    // 必要なフィールドのみ選択
  },
  take: limit,
  skip: (page - 1) * limit,
});
```

### キャッシング戦略
- **Next.js Cache**: Route Handlerのキャッシング設定
- **Revalidation**: ISR（Incremental Static Regeneration）の活用
- **Redis**: 将来的な分散キャッシュ導入を検討

## テスト戦略

### テストフレームワーク
- **単体テスト**: Vitest / Jest
- **統合テスト**: Vitest + Prisma Test Client
- **APIテスト**: Supertest / MSW (Mock Service Worker)
- **E2Eテスト**: Playwright

### テスト構成

```
tests/
├── unit/
│   └── services/
│       └── customer.service.test.ts
├── integration/
│   └── api/
│       └── customers.test.ts
└── e2e/
    └── customer-flow.spec.ts
```

### カバレッジ目標
- **単体テスト**: 80%以上
- **統合テスト**: 主要フロー100%
- **E2Eテスト**: クリティカルパス100%

## 開発環境セットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. 環境変数の設定

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/customer_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. データベースのセットアップ

```bash
# Prismaマイグレーション実行
npx prisma migrate dev

# Prisma Clientの生成
npx prisma generate
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. Prisma Studioでデータ確認（オプション）

```bash
npx prisma studio
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# 型チェック
npm run type-check

# Lint実行
npm run lint

# テスト実行
npm test

# Prismaマイグレーション
npx prisma migrate dev

# Prisma Studio起動
npx prisma studio
```

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリとの連携
2. 環境変数の設定（DATABASE_URL、NEXTAUTH_SECRET等）
3. 自動デプロイの確認

### データベース接続

- **開発**: ローカルPostgreSQL
- **本番**: Vercel Postgres / Supabase / PlanetScale

## 関連ドキュメント

- [プロジェクト全体構成](../../README.md)
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [NextAuth.js ドキュメント](https://next-auth.js.org/)
- [開発ガイドライン](../共通/開発ガイドライン.md)
- [コーディング規約](../共通/コーディング規約.md)
- [テスト仕様書](../共通/テスト仕様書.md)

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|------------|----------|--------|
| 2025-11-27 | 2.0.0 | Next.js 14 API Routes版に全面改訂 | - |
| 2025-11-27 | 1.0.0 | 初版作成（Spring Boot版） | - |

## 備考

### 移行に関する注意事項

- Spring Boot版からの移行では、MyBatisのXMLマッピングがPrismaスキーマに置き換わります
- Controllerクラスベースの実装からRoute Handler関数ベースに変更されます
- トランザクション管理は`@Transactional`からPrismaの`$transaction`に変更されます

### 今後の拡張予定

- 顧客分類・タグ付け機能
- 顧客操作履歴管理
- リアルタイム通知（Server-Sent Events）
- GraphQL APIの提供
- バッチ処理機能（Next.js API Routes + Queue）

### Next.js特有の利点

- **型安全性**: TypeScript + Prismaによるエンドツーエンドの型安全性
- **パフォーマンス**: エッジランタイムでの高速レスポンス
- **開発体験**: Hot Reloadによる高速な開発サイクル
- **デプロイ**: Vercelへのワンクリックデプロイ
