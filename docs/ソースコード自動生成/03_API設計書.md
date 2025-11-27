# API設計書（ソースコード自動生成）

> **注記**: 本ドキュメントはソースコードの静的解析により自動生成されました。

---

## 1. API一覧

### 1.1 顧客管理API（B1）

| API ID | 操作 | HTTPメソッド | エンドポイント | コントローラー |
|--------|------|-------------|---------------|---------------|
| B1-01 | 顧客検索 | GET | `/clients` | ClientSearchController |
| B1-02 | 顧客詳細取得 | GET | `/clients/{clientId}` | ClientDetailController |
| B1-03 | 顧客登録 | POST | `/clients` | ClientCreateController |
| B1-04 | 顧客更新 | PUT | `/clients/{clientId}` | ClientUpdateController |
| B1-05 | 顧客削除 | DELETE | `/clients/{clientId}` | ClientDeleteController |

---

## 2. API詳細仕様

### 2.1 顧客検索 API

**エンドポイント:** `GET /clients`

**リクエストパラメータ（クエリ）:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| clientName | String | - | 顧客名（部分一致） |
| industryCode | String | - | 業種コード |
| (その他) | - | - | ClientSearchRequestから推測 |

**レスポンス:**

```json
{
  "clients": [
    {
      "clientId": 1,
      "clientName": "顧客名",
      "kanaName": "カナメイ",
      "industryCode": "01",
      "industryName": "製造業"
    }
  ],
  "totalCount": 100
}
```

**ステータスコード:**
- 200 OK: 検索成功
- 400 Bad Request: パラメータ不正

---

### 2.2 顧客詳細取得 API

**エンドポイント:** `GET /clients/{clientId}`

**パスパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| clientId | Integer | ○ | 顧客ID |

**レスポンス:**

```json
{
  "clientId": 1,
  "clientName": "顧客名",
  "kanaName": "カナメイ",
  "industryCode": "01",
  "industryName": "製造業"
}
```

**ステータスコード:**
- 200 OK: 取得成功
- 404 Not Found: 顧客が存在しない

---

### 2.3 顧客登録 API

**エンドポイント:** `POST /clients`

**リクエストボディ:**

```json
{
  "clientName": "顧客名",
  "kanaName": "カナメイ",
  "industryCode": "01"
}
```

**リクエストフィールド:**

| フィールド | 型 | 必須 | バリデーション |
|-----------|-----|------|---------------|
| clientName | String | ○ | 最大128文字 |
| kanaName | String | ○ | カタカナ、最大128文字 |
| industryCode | String | ○ | コードマスタ存在チェック |

**レスポンス:**

```json
{
  "clientId": 1,
  "clientName": "顧客名",
  "kanaName": "カナメイ",
  "industryCode": "01"
}
```

**ステータスコード:**
- 201 Created: 登録成功
- 400 Bad Request: バリデーションエラー

---

### 2.4 顧客更新 API

**エンドポイント:** `PUT /clients/{clientId}`

**パスパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| clientId | Integer | ○ | 顧客ID |

**リクエストボディ:**

```json
{
  "clientName": "顧客名（更新後）",
  "kanaName": "カナメイ",
  "industryCode": "02"
}
```

**レスポンス:**

```json
{
  "clientId": 1,
  "clientName": "顧客名（更新後）",
  "kanaName": "カナメイ",
  "industryCode": "02"
}
```

**ステータスコード:**
- 200 OK: 更新成功
- 400 Bad Request: バリデーションエラー
- 404 Not Found: 顧客が存在しない

---

### 2.5 顧客削除 API

**エンドポイント:** `DELETE /clients/{clientId}`

**パスパラメータ:**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| clientId | Integer | ○ | 顧客ID |

**レスポンス:** なし（No Content）

**ステータスコード:**
- 204 No Content: 削除成功
- 404 Not Found: 顧客が存在しない

---

## 3. サービスクラス

### 3.1 ClientSearchService

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| searchClient(criteria) | ClientSearchResponse | 検索条件に合致する顧客を取得 |

**検索上限:** ClientSearchConfig により設定

### 3.2 ClientDetailService

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| getClient(clientId) | ClientDetailResponse | 顧客詳細を取得 |

### 3.3 ClientCreateService

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| createClient(request) | ClientCreationResponse | 顧客を登録 |

### 3.4 ClientUpdateService

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| updateClient(clientId, request) | ClientUpdateResponse | 顧客を更新 |

### 3.5 ClientDeleteService

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| deleteClient(clientId) | void | 顧客を削除 |

---

## 4. データ転送オブジェクト（DTO）

### 4.1 リクエスト

| クラス | 用途 |
|--------|------|
| ClientSearchRequest | 検索条件 |
| ClientCreationRequest | 登録リクエスト |
| ClientUpdateRequest | 更新リクエスト |

### 4.2 レスポンス

| クラス | 用途 |
|--------|------|
| ClientSearchResponse | 検索結果 |
| ClientDetailResponse | 詳細情報 |
| ClientCreationResponse | 登録結果 |
| ClientUpdateResponse | 更新結果 |

---

## 5. エラーハンドリング

### 5.1 GlobalExceptionHandler

@RestControllerAdvice によるグローバル例外処理

### 5.2 エラーレスポンス形式

```json
{
  "code": "CLIENT_NOT_FOUND",
  "message": "指定された顧客が見つかりません",
  "details": []
}
```

### 5.3 例外クラス

| 例外 | HTTPステータス | 説明 |
|------|---------------|------|
| DataNotFoundException | 404 | データ未存在 |
| BusinessException | 400 | 業務エラー |
| ValidationException | 400 | バリデーションエラー |

---

## 6. マッパー（MyBatis）

| マッパー | 主要クエリ |
|---------|-----------|
| ClientSearchMapper | selectClientByCriteria, countClientByCriteria |
| ClientDetailMapper | selectByPrimaryKey |
| ClientCreateMapper | insert |
| ClientUpdateMapper | updateByPrimaryKeySelective |
| ClientDeleteMapper | deleteByPrimaryKey |
