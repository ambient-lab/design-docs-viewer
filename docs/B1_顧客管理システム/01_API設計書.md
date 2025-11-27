# B1 顧客管理システム API設計書 (Next.js版)

## ドキュメント情報

| 項目 | 内容 |
|------|------|
| システム名 | 顧客管理システム |
| サブシステムID | B1 |
| ドキュメント種別 | API設計書 |
| 作成日 | 2025-11-27 |
| バージョン | 2.0 (Next.js対応版) |

## 目次

1. [概要](#概要)
2. [API一覧](#api一覧)
3. [共通仕様](#共通仕様)
4. [API詳細設計](#api詳細設計)
   - [B10101 顧客検索](#b10101-顧客検索)
   - [B10102 顧客詳細取得](#b10102-顧客詳細取得)
   - [B10103 顧客登録](#b10103-顧客登録)
   - [B10104 顧客更新](#b10104-顧客更新)
   - [B10105 顧客削除](#b10105-顧客削除)
5. [型定義とバリデーション](#型定義とバリデーション)
6. [エラーコード定義](#エラーコード定義)
7. [実装ガイド](#実装ガイド)

---

## 概要

### システム概要

顧客管理システムは、企業の顧客情報を一元管理するためのシステムです。顧客の基本情報(名前、メールアドレス、電話番号、住所など)の登録・更新・削除・検索機能を提供します。

### 技術スタック

- **フレームワーク**: Next.js 14+ (App Router)
- **データベース**: Prisma ORM
- **認証**: NextAuth.js v5
- **バリデーション**: Zod
- **データ形式**: JSON (UTF-8)
- **プロトコル**: HTTP/HTTPS
- **TypeScript**: 5.0+

### 設計方針

- RESTful APIの設計原則に準拠
- TypeScriptによる型安全性の確保
- Zodスキーマによる厳格なバリデーション
- HTTPステータスコードを適切に使用
- 楽観的ロックによる同時更新制御
- エラーハンドリングの統一
- Next.js Route Handlersによるサーバーサイド実装

---

## API一覧

| API ID | API名 | HTTPメソッド | エンドポイント | Route Handler |
|--------|-------|-------------|---------------|--------------|
| B10101 | 顧客検索 | GET | /api/customers | app/api/customers/route.ts (GET) |
| B10102 | 顧客詳細取得 | GET | /api/customers/[id] | app/api/customers/[id]/route.ts (GET) |
| B10103 | 顧客登録 | POST | /api/customers | app/api/customers/route.ts (POST) |
| B10104 | 顧客更新 | PUT | /api/customers/[id] | app/api/customers/[id]/route.ts (PUT) |
| B10105 | 顧客削除 | DELETE | /api/customers/[id] | app/api/customers/[id]/route.ts (DELETE) |

---

## 共通仕様

### リクエストヘッダー

全APIで以下のヘッダーが必須です。

```http
Authorization: Bearer {access_token}
Content-Type: application/json; charset=UTF-8
Accept: application/json
```

### レスポンスヘッダー

```http
Content-Type: application/json; charset=UTF-8
X-Request-ID: {リクエスト一意識別子}
```

### HTTPステータスコード

| ステータスコード | 説明 | 使用API |
|----------------|------|---------|
| 200 OK | 正常終了(取得・更新成功) | GET, PUT |
| 201 Created | リソース作成成功 | POST |
| 204 No Content | 正常終了(削除成功) | DELETE |
| 400 Bad Request | リクエスト形式エラー | 全API |
| 401 Unauthorized | 認証エラー | 全API |
| 404 Not Found | リソース未存在 | GET, PUT, DELETE |
| 409 Conflict | 楽観的ロック競合 | PUT |
| 500 Internal Server Error | サーバー内部エラー | 全API |

### 共通エラーレスポンス形式

```typescript
interface ApiError {
  errorCode: string;
  errorMessage: string;
  timestamp: string;
  path: string;
  details?: Array<{
    field: string | null;
    message: string;
  }>;
}
```

```json
{
  "errorCode": "FB1999901",
  "errorMessage": "指定された顧客が見つかりません",
  "timestamp": "2025-11-27T10:30:00Z",
  "path": "/api/customers/9999",
  "details": [
    {
      "field": "id",
      "message": "顧客ID: 9999 は存在しません"
    }
  ]
}
```

### 認証・認可

NextAuth.jsを使用したセッションベース認証を実装します。

```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
```

---

## API詳細設計

## B10101 顧客検索

### 仕様概要

検索条件(顧客名、メールアドレス、電話番号)を指定して、条件に合致する顧客の一覧を取得します。全項目を省略した場合は全件取得となります。

### 基本情報

| 項目 | 内容 |
|------|------|
| API ID | B10101 |
| API名 | 顧客検索 |
| HTTPメソッド | GET |
| エンドポイント | /api/customers |
| Route Handler | app/api/customers/route.ts |
| 認証 | 必要 |

### 処理フロー

```mermaid
sequenceDiagram
    participant Client as クライアント
    participant API as Next.js API Route
    participant Auth as NextAuth
    participant Validation as Zod Validator
    participant Prisma as Prisma Client
    participant DB as Database

    Client->>API: GET /api/customers?name=山田&email=yamada@example.com
    API->>Auth: getServerSession()
    Auth-->>API: Session | null

    alt 未認証
        API-->>Client: 401 Unauthorized
    else 認証済み
        API->>Validation: customerSearchSchema.parse(searchParams)

        alt バリデーションエラー
            Validation-->>API: ZodError
            API-->>Client: 400 Bad Request
        else バリデーション成功
            Validation-->>API: Validated params
            API->>Prisma: findMany({ where: conditions })
            Prisma->>DB: SELECT * FROM customers WHERE ...
            DB-->>Prisma: 検索結果
            Prisma-->>API: Customer[]
            API-->>Client: 200 OK + 顧客一覧JSON
        end
    end
```

### TypeScript型定義

```typescript
// types/customer.ts
export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  versionNo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSearchParams {
  name?: string;
  email?: string;
  phoneNumber?: string;
  page?: number;
  size?: number;
}

export interface CustomerSearchResponse {
  customers: Array<{
    customerId: number;
    name: string;
    email: string;
    phoneNumber: string;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}
```

### Zodバリデーションスキーマ

```typescript
// lib/validations/customer.ts
import { z } from "zod";

export const customerSearchSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^[\d-]{10,15}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;
```

### Route Handler実装

```typescript
// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSearchSchema } from "@/lib/validations/customer";
import { createApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createApiError("FB1999900", "認証が必要です", request.url),
        { status: 401 }
      );
    }

    // クエリパラメータの取得とバリデーション
    const searchParams = request.nextUrl.searchParams;
    const params = {
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      phoneNumber: searchParams.get("phoneNumber") || undefined,
      page: searchParams.get("page") || "1",
      size: searchParams.get("size") || "20",
    };

    const validatedParams = customerSearchSchema.parse(params);

    // 検索条件の構築
    const where = {
      AND: [
        { deletedFlg: false },
        validatedParams.name
          ? { name: { contains: validatedParams.name } }
          : {},
        validatedParams.email
          ? { email: validatedParams.email }
          : {},
        validatedParams.phoneNumber
          ? { phoneNumber: validatedParams.phoneNumber }
          : {},
      ],
    };

    // ページネーション計算
    const skip = (validatedParams.page - 1) * validatedParams.size;
    const take = validatedParams.size;

    // データ取得
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    // レスポンスの構築
    const response = {
      customers: customers.map((customer) => ({
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
      })),
      pagination: {
        currentPage: validatedParams.page,
        pageSize: validatedParams.size,
        totalPages: Math.ceil(totalCount / validatedParams.size),
        totalElements: totalCount,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
```

### リクエスト例

```http
GET /api/customers?name=山田&email=yamada@example.com&page=1&size=20 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

### レスポンス例(成功時: 200 OK)

```json
{
  "customers": [
    {
      "customerId": 1,
      "name": "山田太郎",
      "email": "yamada@example.com",
      "phoneNumber": "03-1234-5678",
      "address": "東京都渋谷区1-2-3",
      "createdAt": "2025-11-01T09:00:00Z",
      "updatedAt": "2025-11-15T14:30:00Z"
    },
    {
      "customerId": 2,
      "name": "山田花子",
      "email": "hanako.yamada@example.com",
      "phoneNumber": "090-1234-5678",
      "address": "神奈川県横浜市2-3-4",
      "createdAt": "2025-11-05T10:15:00Z",
      "updatedAt": "2025-11-20T16:45:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 1,
    "totalElements": 2
  }
}
```

---

## B10102 顧客詳細取得

### 仕様概要

顧客IDを指定して、該当する顧客の詳細情報を1件取得します。

### 基本情報

| 項目 | 内容 |
|------|------|
| API ID | B10102 |
| API名 | 顧客詳細取得 |
| HTTPメソッド | GET |
| エンドポイント | /api/customers/[id] |
| Route Handler | app/api/customers/[id]/route.ts |
| 認証 | 必要 |

### TypeScript型定義

```typescript
// types/customer.ts
export interface CustomerDetailResponse {
  customerId: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  versionNo: number;
  createdAt: string;
  updatedAt: string;
}
```

### Zodバリデーションスキーマ

```typescript
// lib/validations/customer.ts
export const customerIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});
```

### Route Handler実装

```typescript
// app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerIdSchema } from "@/lib/validations/customer";
import { createApiError, handleApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createApiError("FB1999900", "認証が必要です", request.url),
        { status: 401 }
      );
    }

    // パスパラメータのバリデーション
    const { id } = customerIdSchema.parse({ id: params.id });

    // 顧客データの取得
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        deletedFlg: false,
      },
    });

    // 顧客が存在しない場合
    if (!customer) {
      return NextResponse.json(
        createApiError(
          "FB1999901",
          "指定された顧客が見つかりません",
          request.url,
          [
            {
              field: "id",
              message: `顧客ID: ${id} は存在しません`,
            },
          ]
        ),
        { status: 404 }
      );
    }

    // レスポンスの構築
    const response = {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      versionNo: customer.versionNo,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
```

### レスポンス例(成功時: 200 OK)

```json
{
  "customerId": 123,
  "name": "山田太郎",
  "email": "yamada@example.com",
  "phoneNumber": "03-1234-5678",
  "address": "東京都渋谷区1-2-3",
  "versionNo": 5,
  "createdAt": "2025-11-01T09:00:00Z",
  "updatedAt": "2025-11-15T14:30:00Z"
}
```

---

## B10103 顧客登録

### 仕様概要

新規顧客情報を登録します。メールアドレスは一意性制約があるため、重複登録はエラーとなります。

### 基本情報

| 項目 | 内容 |
|------|------|
| API ID | B10103 |
| API名 | 顧客登録 |
| HTTPメソッド | POST |
| エンドポイント | /api/customers |
| Route Handler | app/api/customers/route.ts |
| 認証 | 必要 |

### TypeScript型定義

```typescript
// types/customer.ts
export interface CustomerCreateRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
}
```

### Zodバリデーションスキーマ

```typescript
// lib/validations/customer.ts
export const customerCreateSchema = z.object({
  name: z.string().min(1, "顧客名は必須です").max(100, "顧客名は100文字以内で入力してください"),
  email: z.string().email("メールアドレスの形式が不正です").max(255),
  phoneNumber: z
    .string()
    .min(1, "電話番号は必須です")
    .regex(/^[\d-]{10,15}$/, "電話番号は10-15文字で入力してください"),
  address: z.string().max(200, "住所は200文字以内で入力してください").optional(),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
```

### Route Handler実装

```typescript
// app/api/customers/route.ts
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createApiError("FB1999900", "認証が必要です", request.url),
        { status: 401 }
      );
    }

    // リクエストボディの取得とバリデーション
    const body = await request.json();
    const validatedData = customerCreateSchema.parse(body);

    // メールアドレスの重複チェック
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: validatedData.email },
    });

    if (existingCustomer && !existingCustomer.deletedFlg) {
      return NextResponse.json(
        createApiError(
          "FB1999903",
          "指定されたメールアドレスは既に登録されています",
          request.url,
          [
            {
              field: "email",
              message: `メールアドレス '${validatedData.email}' は既に使用されています`,
            },
          ]
        ),
        { status: 400 }
      );
    }

    // 顧客データの登録
    const customer = await prisma.customer.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        address: validatedData.address || null,
        versionNo: 1,
        deletedFlg: false,
      },
    });

    // レスポンスの構築
    const response = {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      versionNo: customer.versionNo,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
```

### リクエスト例

```http
POST /api/customers HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json; charset=UTF-8

{
  "name": "佐藤次郎",
  "email": "sato.jiro@example.com",
  "phoneNumber": "090-9876-5432",
  "address": "大阪府大阪市北区5-6-7"
}
```

### レスポンス例(成功時: 201 Created)

```json
{
  "customerId": 456,
  "name": "佐藤次郎",
  "email": "sato.jiro@example.com",
  "phoneNumber": "090-9876-5432",
  "address": "大阪府大阪市北区5-6-7",
  "versionNo": 1,
  "createdAt": "2025-11-27T10:30:00Z",
  "updatedAt": "2025-11-27T10:30:00Z"
}
```

---

## B10104 顧客更新

### 仕様概要

既存の顧客情報を更新します。楽観的ロック(versionNo)により、同時更新を制御します。

### 基本情報

| 項目 | 内容 |
|------|------|
| API ID | B10104 |
| API名 | 顧客更新 |
| HTTPメソッド | PUT |
| エンドポイント | /api/customers/[id] |
| Route Handler | app/api/customers/[id]/route.ts |
| 認証 | 必要 |

### TypeScript型定義

```typescript
// types/customer.ts
export interface CustomerUpdateRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  versionNo: number;
}
```

### Zodバリデーションスキーマ

```typescript
// lib/validations/customer.ts
export const customerUpdateSchema = z.object({
  name: z.string().min(1, "顧客名は必須です").max(100, "顧客名は100文字以内で入力してください"),
  email: z.string().email("メールアドレスの形式が不正です").max(255),
  phoneNumber: z
    .string()
    .min(1, "電話番号は必須です")
    .regex(/^[\d-]{10,15}$/, "電話番号は10-15文字で入力してください"),
  address: z.string().max(200, "住所は200文字以内で入力してください").optional(),
  versionNo: z.number().int().min(1, "バージョン番号は1以上で指定してください"),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
```

### Route Handler実装

```typescript
// app/api/customers/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createApiError("FB1999900", "認証が必要です", request.url),
        { status: 401 }
      );
    }

    // パスパラメータのバリデーション
    const { id } = customerIdSchema.parse({ id: params.id });

    // リクエストボディの取得とバリデーション
    const body = await request.json();
    const validatedData = customerUpdateSchema.parse(body);

    // 既存顧客の取得
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        deletedFlg: false,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        createApiError(
          "FB1999901",
          "指定された顧客が見つかりません",
          request.url,
          [
            {
              field: "id",
              message: `顧客ID: ${id} は存在しません`,
            },
          ]
        ),
        { status: 404 }
      );
    }

    // 楽観的ロックチェック
    if (existingCustomer.versionNo !== validatedData.versionNo) {
      return NextResponse.json(
        createApiError(
          "FB1999904",
          "他のユーザーによって更新されています。最新データを再取得してください",
          request.url,
          [
            {
              field: "versionNo",
              message: `指定されたバージョン番号(${validatedData.versionNo})は最新ではありません。現在のバージョン: ${existingCustomer.versionNo}`,
            },
          ]
        ),
        { status: 409 }
      );
    }

    // 顧客データの更新
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        address: validatedData.address || null,
        versionNo: existingCustomer.versionNo + 1,
        updatedAt: new Date(),
      },
    });

    // レスポンスの構築
    const response = {
      customerId: updatedCustomer.id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phoneNumber: updatedCustomer.phoneNumber,
      address: updatedCustomer.address,
      versionNo: updatedCustomer.versionNo,
      createdAt: updatedCustomer.createdAt.toISOString(),
      updatedAt: updatedCustomer.updatedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
```

### リクエスト例

```http
PUT /api/customers/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json; charset=UTF-8

{
  "name": "山田太郎",
  "email": "yamada.updated@example.com",
  "phoneNumber": "03-9999-8888",
  "address": "東京都新宿区8-9-10",
  "versionNo": 5
}
```

### レスポンス例(成功時: 200 OK)

```json
{
  "customerId": 123,
  "name": "山田太郎",
  "email": "yamada.updated@example.com",
  "phoneNumber": "03-9999-8888",
  "address": "東京都新宿区8-9-10",
  "versionNo": 6,
  "createdAt": "2025-11-01T09:00:00Z",
  "updatedAt": "2025-11-27T11:00:00Z"
}
```

---

## B10105 顧客削除

### 仕様概要

指定された顧客IDの顧客を論理削除します。物理削除は行わず、削除フラグを立てることで削除状態とします。

### 基本情報

| 項目 | 内容 |
|------|------|
| API ID | B10105 |
| API名 | 顧客削除 |
| HTTPメソッド | DELETE |
| エンドポイント | /api/customers/[id] |
| Route Handler | app/api/customers/[id]/route.ts |
| 認証 | 必要 |

### Route Handler実装

```typescript
// app/api/customers/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createApiError("FB1999900", "認証が必要です", request.url),
        { status: 401 }
      );
    }

    // パスパラメータのバリデーション
    const { id } = customerIdSchema.parse({ id: params.id });

    // 既存顧客の取得
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        deletedFlg: false,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        createApiError(
          "FB1999901",
          "指定された顧客が見つかりません",
          request.url,
          [
            {
              field: "id",
              message: `顧客ID: ${id} は存在しません`,
            },
          ]
        ),
        { status: 404 }
      );
    }

    // 論理削除の実行
    await prisma.customer.update({
      where: { id },
      data: {
        deletedFlg: true,
        updatedAt: new Date(),
      },
    });

    // 204 No Content を返す
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, request.url);
  }
}
```

### リクエスト例

```http
DELETE /api/customers/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### レスポンス例(成功時: 204 No Content)

```http
HTTP/1.1 204 No Content
X-Request-ID: abc123-def456-ghi789
```

---

## 型定義とバリデーション

### 共通型定義ファイル

```typescript
// types/customer.ts
export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  versionNo: number;
  deletedFlg: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSearchParams {
  name?: string;
  email?: string;
  phoneNumber?: string;
  page?: number;
  size?: number;
}

export interface CustomerSearchResponse {
  customers: Array<{
    customerId: number;
    name: string;
    email: string;
    phoneNumber: string;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface CustomerDetailResponse {
  customerId: number;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  versionNo: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
}

export interface CustomerUpdateRequest {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  versionNo: number;
}
```

### Zodバリデーションスキーマ集約

```typescript
// lib/validations/customer.ts
import { z } from "zod";

// 顧客検索用スキーマ
export const customerSearchSchema = z.object({
  name: z.string().max(100, "顧客名は100文字以内で入力してください").optional(),
  email: z.string().email("メールアドレスの形式が不正です").optional(),
  phoneNumber: z
    .string()
    .regex(/^[\d-]{10,15}$/, "電話番号は10-15文字、数字とハイフンのみで入力してください")
    .optional(),
  page: z.coerce.number().int().min(1, "ページ番号は1以上で指定してください").default(1),
  size: z.coerce
    .number()
    .int()
    .min(1, "ページサイズは1以上で指定してください")
    .max(100, "ページサイズは100以下で指定してください")
    .default(20),
});

// 顧客ID用スキーマ
export const customerIdSchema = z.object({
  id: z.coerce.number().int().min(1, "顧客IDは1以上の整数で指定してください"),
});

// 顧客登録用スキーマ
export const customerCreateSchema = z.object({
  name: z
    .string()
    .min(1, "顧客名は必須です")
    .max(100, "顧客名は100文字以内で入力してください"),
  email: z
    .string()
    .email("メールアドレスの形式が不正です")
    .max(255, "メールアドレスは255文字以内で入力してください"),
  phoneNumber: z
    .string()
    .min(1, "電話番号は必須です")
    .regex(/^[\d-]{10,15}$/, "電話番号は10-15文字、数字とハイフンのみで入力してください"),
  address: z
    .string()
    .max(200, "住所は200文字以内で入力してください")
    .optional()
    .nullable(),
});

// 顧客更新用スキーマ
export const customerUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "顧客名は必須です")
    .max(100, "顧客名は100文字以内で入力してください"),
  email: z
    .string()
    .email("メールアドレスの形式が不正です")
    .max(255, "メールアドレスは255文字以内で入力してください"),
  phoneNumber: z
    .string()
    .min(1, "電話番号は必須です")
    .regex(/^[\d-]{10,15}$/, "電話番号は10-15文字、数字とハイフンのみで入力してください"),
  address: z
    .string()
    .max(200, "住所は200文字以内で入力してください")
    .optional()
    .nullable(),
  versionNo: z.number().int().min(1, "バージョン番号は1以上で指定してください"),
});

// 型エクスポート
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;
export type CustomerIdInput = z.infer<typeof customerIdSchema>;
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
```

---

## エラーコード定義

### エラーコード一覧

| エラーコード | HTTPステータス | エラー名 | メッセージ | 発生条件 |
|------------|--------------|---------|-----------|---------|
| FB1999900 | 401 | 認証エラー | 認証が必要です | セッションが存在しないまたは無効 |
| FB1999901 | 404 | 顧客未存在エラー | 指定された顧客が見つかりません | 指定されたIDの顧客が存在しない、または既に削除済み |
| FB1999902 | 400 | バリデーションエラー | 入力値が不正です | 必須チェック、形式チェック、桁数チェック等のバリデーションエラー |
| FB1999903 | 400 | メールアドレス重複エラー | 指定されたメールアドレスは既に登録されています | 登録時にメールアドレスが重複している |
| FB1999904 | 409 | 楽観的ロック競合エラー | 他のユーザーによって更新されています。最新データを再取得してください | 更新時にバージョン番号が一致しない(他ユーザーによる同時更新) |
| FB1999905 | 500 | システムエラー | システムエラーが発生しました | データベース接続エラー、予期しない内部エラー |

### エラーハンドリング実装

```typescript
// lib/api-error.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export interface ApiErrorDetail {
  field: string | null;
  message: string;
}

export interface ApiErrorResponse {
  errorCode: string;
  errorMessage: string;
  timestamp: string;
  path: string;
  details?: ApiErrorDetail[];
}

export function createApiError(
  errorCode: string,
  errorMessage: string,
  path: string,
  details?: ApiErrorDetail[]
): ApiErrorResponse {
  return {
    errorCode,
    errorMessage,
    timestamp: new Date().toISOString(),
    path,
    details,
  };
}

export function handleApiError(error: unknown, path: string): NextResponse {
  console.error("API Error:", error);

  // Zodバリデーションエラー
  if (error instanceof ZodError) {
    const details = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return NextResponse.json(
      createApiError("FB1999902", "入力値が不正です", path, details),
      { status: 400 }
    );
  }

  // Prismaエラー
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // ユニーク制約違反
    if (error.code === "P2002") {
      return NextResponse.json(
        createApiError(
          "FB1999903",
          "指定されたメールアドレスは既に登録されています",
          path,
          [
            {
              field: "email",
              message: "このメールアドレスは既に使用されています",
            },
          ]
        ),
        { status: 400 }
      );
    }

    // レコード未存在
    if (error.code === "P2025") {
      return NextResponse.json(
        createApiError(
          "FB1999901",
          "指定された顧客が見つかりません",
          path
        ),
        { status: 404 }
      );
    }
  }

  // その他のエラー
  return NextResponse.json(
    createApiError(
      "FB1999905",
      "システムエラーが発生しました",
      path,
      [
        {
          field: null,
          message: "予期しないエラーが発生しました。管理者に連絡してください",
        },
      ]
    ),
    { status: 500 }
  );
}
```

### エラーレスポンス例

#### FB1999902: バリデーションエラー

```json
{
  "errorCode": "FB1999902",
  "errorMessage": "入力値が不正です",
  "timestamp": "2025-11-27T10:30:00Z",
  "path": "/api/customers",
  "details": [
    {
      "field": "name",
      "message": "顧客名は必須です"
    },
    {
      "field": "email",
      "message": "メールアドレスの形式が不正です"
    },
    {
      "field": "phoneNumber",
      "message": "電話番号は10-15文字で入力してください"
    }
  ]
}
```

---

## 実装ガイド

### プロジェクト構成

```
app/
├── api/
│   └── customers/
│       ├── route.ts                    # GET (検索), POST (登録)
│       └── [id]/
│           └── route.ts                # GET (詳細), PUT (更新), DELETE (削除)
lib/
├── auth.ts                             # NextAuth設定
├── prisma.ts                           # Prismaクライアント
├── api-error.ts                        # エラーハンドリング
└── validations/
    └── customer.ts                     # Zodバリデーションスキーマ
types/
└── customer.ts                         # TypeScript型定義
prisma/
└── schema.prisma                       # Prismaスキーマ定義
```

### Prismaスキーマ定義

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(100)
  email       String   @unique @db.VarChar(255)
  phoneNumber String   @map("phone_number") @db.VarChar(15)
  address     String?  @db.VarChar(200)
  versionNo   Int      @default(1) @map("version_no")
  deletedFlg  Boolean  @default(false) @map("deleted_flg")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("customers")
  @@index([email])
  @@index([name])
  @@index([phoneNumber])
}
```

### Prismaクライアント設定

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 認証ミドルウェア

```typescript
// lib/middleware/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApiError } from "@/lib/api-error";

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      createApiError("FB1999900", "認証が必要です", request.url),
      { status: 401 }
    );
  }

  return null; // 認証成功
}
```

### 環境変数設定

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/customer_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### テストコード例

```typescript
// __tests__/api/customers.test.ts
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createMocks } from "node-mocks-http";
import { GET, POST } from "@/app/api/customers/route";

describe("/api/customers", () => {
  describe("GET", () => {
    it("認証なしの場合、401を返す", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      const response = await GET(req as any);
      expect(response.status).toBe(401);
    });

    it("検索条件なしの場合、全件取得する", async () => {
      // テスト実装
    });

    it("名前で部分一致検索できる", async () => {
      // テスト実装
    });
  });

  describe("POST", () => {
    it("有効なデータで顧客を登録できる", async () => {
      // テスト実装
    });

    it("メールアドレス重複時、400を返す", async () => {
      // テスト実装
    });

    it("バリデーションエラー時、詳細なエラーメッセージを返す", async () => {
      // テスト実装
    });
  });
});
```

---

## 補足事項

### セキュリティ考慮事項

1. **認証・認可**
   - NextAuth.jsによるセッション管理
   - JWTトークンベースの認証
   - CSRFトークンの自動処理
   - セキュアなCookie設定(httpOnly, secure, sameSite)

2. **入力値検証**
   - Zodによる厳格なバリデーション
   - Prismaによる自動的なSQLインジェクション対策
   - XSS対策はNext.jsが自動的にエスケープ処理

3. **通信の暗号化**
   - 本番環境では必ずHTTPSを使用
   - TLS 1.2以上を使用

### パフォーマンス考慮事項

1. **ページネーション**
   - デフォルトページサイズ: 20件
   - 最大ページサイズ: 100件
   - オフセットベースのページング実装

2. **データベース最適化**
   - Prismaによる効率的なクエリ生成
   - 適切なインデックス設定
   - コネクションプーリング

3. **キャッシュ戦略**
   - Next.jsの自動キャッシュ機能
   - revalidateオプションによるキャッシュ制御
   - ISR(Incremental Static Regeneration)の活用可能性

### 監視・ログ

1. **アクセスログ**
   - Next.jsの組み込みロギング
   - リクエストID、ユーザーID、処理時間を記録
   - 個人情報のマスキング処理

2. **エラーログ**
   - console.errorによるエラー記録
   - エラートラッキングサービス連携(Sentry等)
   - スタックトレースの保存

3. **パフォーマンス監視**
   - Vercel Analyticsによる監視
   - レスポンスタイムの測定
   - エラー率の監視

---

## OpenAPI仕様 (Optional)

```yaml
openapi: 3.0.0
info:
  title: 顧客管理API
  version: 2.0.0
  description: Next.js顧客管理システムAPI

servers:
  - url: https://api.example.com
    description: 本番環境
  - url: http://localhost:3000
    description: 開発環境

paths:
  /api/customers:
    get:
      summary: 顧客検索
      operationId: searchCustomers
      tags:
        - customers
      security:
        - bearerAuth: []
      parameters:
        - name: name
          in: query
          schema:
            type: string
            maxLength: 100
        - name: email
          in: query
          schema:
            type: string
            format: email
        - name: phoneNumber
          in: query
          schema:
            type: string
            pattern: '^[\d-]{10,15}$'
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: size
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerSearchResponse'

    post:
      summary: 顧客登録
      operationId: createCustomer
      tags:
        - customers
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CustomerCreateRequest'
      responses:
        '201':
          description: 登録成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerDetailResponse'

  /api/customers/{id}:
    get:
      summary: 顧客詳細取得
      operationId: getCustomer
      tags:
        - customers
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerDetailResponse'

    put:
      summary: 顧客更新
      operationId: updateCustomer
      tags:
        - customers
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CustomerUpdateRequest'
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CustomerDetailResponse'

    delete:
      summary: 顧客削除
      operationId: deleteCustomer
      tags:
        - customers
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '204':
          description: 削除成功

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    CustomerSearchResponse:
      type: object
      properties:
        customers:
          type: array
          items:
            $ref: '#/components/schemas/CustomerSummary'
        pagination:
          $ref: '#/components/schemas/Pagination'

    CustomerSummary:
      type: object
      properties:
        customerId:
          type: integer
        name:
          type: string
        email:
          type: string
        phoneNumber:
          type: string
        address:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CustomerDetailResponse:
      type: object
      properties:
        customerId:
          type: integer
        name:
          type: string
        email:
          type: string
        phoneNumber:
          type: string
        address:
          type: string
          nullable: true
        versionNo:
          type: integer
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CustomerCreateRequest:
      type: object
      required:
        - name
        - email
        - phoneNumber
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
          maxLength: 255
        phoneNumber:
          type: string
          pattern: '^[\d-]{10,15}$'
        address:
          type: string
          maxLength: 200

    CustomerUpdateRequest:
      type: object
      required:
        - name
        - email
        - phoneNumber
        - versionNo
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
          maxLength: 255
        phoneNumber:
          type: string
          pattern: '^[\d-]{10,15}$'
        address:
          type: string
          maxLength: 200
        versionNo:
          type: integer
          minimum: 1

    Pagination:
      type: object
      properties:
        currentPage:
          type: integer
        pageSize:
          type: integer
        totalPages:
          type: integer
        totalElements:
          type: integer

    ApiError:
      type: object
      properties:
        errorCode:
          type: string
        errorMessage:
          type: string
        timestamp:
          type: string
          format: date-time
        path:
          type: string
        details:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
                nullable: true
              message:
                type: string
```

---

## 改訂履歴

| バージョン | 改訂日 | 改訂者 | 改訂内容 |
|----------|-------|-------|---------|
| 1.0 | 2025-11-27 | システム設計チーム | 初版作成(Spring Boot版) |
| 2.0 | 2025-11-27 | システム設計チーム | Next.js版に全面改訂 |

---

**文書終了**
