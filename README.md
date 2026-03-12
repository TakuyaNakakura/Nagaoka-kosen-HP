# 長岡高専技術協力会 Webサイト

長岡高専技術協力会の要件定義をもとに、Next.js + Prisma で再構成したフルスタック実装です。Vercel 向けに PostgreSQL、Vercel Blob、メール送信ベースの運用へ切り替えられるようにしています。

## 技術構成

- フロントエンド / BFF: Next.js 15 App Router
- 言語: TypeScript
- DBアクセス: Prisma
- DB: PostgreSQL
- ファイル保存: ローカル保存 / Vercel Blob 切替
- メール送信: Resend
- 認証: メールアドレス + パスワード + サーバーサイドセッションCookie

## 実装済み

- 公開サイト
  - トップ
  - 会員企業一覧 / 検索 / 詳細
  - 教員・研究シーズ一覧 / 検索 / 詳細
  - ニュース一覧 / 詳細
  - イベント一覧 / 詳細
  - 問い合わせ
  - 入会案内
  - 組織情報
  - 対象別案内
- 会員企業向け
  - ログイン
  - パスワード再設定申請 / 再設定
  - マイページ
  - 自社情報編集
  - 下書き保存
  - 更新申請
  - 申請状況確認
  - 公開ページ確認
  - 問い合わせ確認
- 管理者向け
  - ダッシュボード
  - 会員企業管理
  - 会員企業アカウント管理
  - 更新申請承認
  - 教員管理
  - 技術シーズ管理
  - ニュース管理
  - イベント管理
  - 問い合わせ管理
  - 入会相談管理
  - 組織情報管理
  - 権限管理
  - 監査ログ閲覧

## Vercel デプロイ

前提:

- PostgreSQL を用意し、`DATABASE_URL` と `DIRECT_DATABASE_URL` を設定する
- Vercel Blob を使う場合は `BLOB_READ_WRITE_TOKEN` を設定する
- パスワード再設定メールを有効化する場合は `RESEND_API_KEY` と `MAIL_FROM` を設定する
- `APP_BASE_URL` は本番URLに合わせる
- `COOKIE_SECURE` は `true`
- `PASSWORD_RESET_DEBUG` は `false`

`vercel.json` でビルド時に `npm run vercel:build` を実行し、`prisma migrate deploy` のあとに Preview 環境だけ `seed-if-empty` を流し、その後 `next build` を実行するようにしています。

DB 連携サービスが `DATABASE_URL_UNPOOLED` や `POSTGRES_URL_NON_POOLING` を自動投入する場合、ビルドスクリプト側で `DIRECT_DATABASE_URL` へ自動補完します。Vercel Marketplace 連携を使う場合はこの形を優先してください。

そのまま転記しやすいテンプレートは [.env.production.example](/Users/takuya/Documents/07_高専コーディネーター/00_HP/HomePage_Demo/.env.production.example) と [.env.preview.example](/Users/takuya/Documents/07_高専コーディネーター/00_HP/HomePage_Demo/.env.preview.example) に置いています。

推奨する Project Settings の Environment Variables:

| 変数名 | Production | Preview |
| --- | --- | --- |
| `DATABASE_URL` | 本番DBの pooled 接続文字列 | Preview 用の別DBまたは branch DB |
| `DIRECT_DATABASE_URL` | 本番DBの direct 接続文字列 | Preview 用DBの direct 接続文字列 |
| `COOKIE_SECURE` | `true` | `true` |
| `APP_BASE_URL` | `https://本番ドメイン` | 未設定でも可。固定 Preview URL を使うなら設定 |
| `UPLOAD_STORAGE` | `blob` | `blob` |
| `BLOB_READ_WRITE_TOKEN` | 設定する | 設定する |
| `UPLOAD_MAX_TOTAL_BYTES` | `4000000` | `4000000` |
| `PASSWORD_RESET_DEBUG` | `false` | `true` 推奨 |
| `SEED_PREVIEW_DATA` | 通常不要 | `true` が既定。止めたいときだけ `false` |
| `SEED_DATABASE_IF_EMPTY` | 必要時だけ `true` | 必要時だけ `true` |
| `RESEND_API_KEY` | 設定する | 通常は未設定。Preview でも送信確認したい場合のみ設定 |
| `MAIL_FROM` | 送信元アドレスを設定 | 通常は未設定。Preview でも送信確認したい場合のみ設定 |

補足:

- Preview は本番DBを使わず、必ず分離した DB を割り当てる
- Preview は空DBなら自動でデモ seed が入る
- `main` など Production デプロイに対して一度だけ seed を入れたい場合は、`SEED_DATABASE_IF_EMPTY=true` で再デプロイし、投入後に `false` へ戻す
- Preview でメール誤送信を避けたいなら `PASSWORD_RESET_DEBUG=true` のままにし、`RESEND_API_KEY` と `MAIL_FROM` は入れない
- `APP_BASE_URL` を Preview で未設定にした場合、再設定リンクはそのリクエストの origin を使って生成する

## Docker で起動

```bash
cd /Users/takuya/Documents/07_高専コーディネーター/00_HP/HomePage_Demo
docker compose up --build
```

- アプリ: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- 初回起動時はアプリコンテナが `prisma migrate deploy` を実行し、DB が空の場合のみ seed データを投入します。
- 以前の `db push` ベースのローカルボリュームが残っている場合は、Docker 確認用に `prisma db push` へ自動フォールバックします。

停止:

```bash
docker compose down
```

DB ボリュームも含めて完全に初期化:

```bash
docker compose down -v
```

## ローカル開発

DB だけ Docker で起動し、Next.js をホストで動かす場合:

```bash
docker compose up -d db
npm install
npm run migrate:deploy
npm run db:seed
npm run dev
```

## 本番相当起動

```bash
npm run build
npm run start
```

この場合も PostgreSQL が必要です。`.env` の `DATABASE_URL` はホスト側から `localhost:5432` を参照する設定になっています。

## 環境変数

`.env`

```env
DATABASE_URL="postgresql://app:app@localhost:5432/nagaoka_tech_coop?schema=public"
DIRECT_DATABASE_URL="postgresql://app:app@localhost:5432/nagaoka_tech_coop?schema=public"
COOKIE_SECURE="false"
APP_BASE_URL="http://localhost:3000"
UPLOAD_STORAGE="local"
UPLOAD_MAX_TOTAL_BYTES="20000000"
PASSWORD_RESET_DEBUG="true"
```

- `DATABASE_URL`
  - ローカル開発: `postgresql://app:app@localhost:5432/nagaoka_tech_coop?schema=public`
  - Docker Compose 内のアプリ: `postgresql://app:app@db:5432/nagaoka_tech_coop?schema=public`
- `DIRECT_DATABASE_URL`
  - migration 用の直接接続URL。ローカルでは `DATABASE_URL` と同じ値で問題ありません。
- `COOKIE_SECURE`
  - ローカルHTTP確認では `false`
  - HTTPS 本番環境では `true`
- `APP_BASE_URL`
  - パスワード再設定メール内リンクの生成に使用します。
- `UPLOAD_STORAGE`
  - ローカル開発は `local`
  - Vercel 本番は `blob`
- `UPLOAD_MAX_TOTAL_BYTES`
  - 1回のアップロード合計サイズ上限です。Vercel では関数制限を踏まえて 4MB 前後を推奨します。
- `PASSWORD_RESET_DEBUG`
  - `true` のときだけ再設定トークンを画面に表示します。本番は `false`
- `BLOB_READ_WRITE_TOKEN`
  - Vercel Blob 利用時に必要です。
- `RESEND_API_KEY`
  - パスワード再設定メール送信時に必要です。
- `MAIL_FROM`
  - 送信元メールアドレスです。

## デモアカウント

- 会員企業
  - メール: `member@example.com`
  - パスワード: `member123`
- 管理者
  - メール: `admin@example.com`
  - パスワード: `admin123`

## 主なディレクトリ

- `app/`
  - 画面と Route Handlers
- `components/`
  - 共通UI
- `lib/`
  - 認証、Prisma、ドメイン変換、補助関数
- `prisma/`
  - スキーマ、migration、シード
- `scripts/`
  - Docker 起動用の待機・初期化スクリプト
- `public/docs/`
  - 入会案内などの公開資料

## 注意

- Vercel 本番でファイルアップロードを使う場合、`UPLOAD_STORAGE=blob` と `BLOB_READ_WRITE_TOKEN` が必須です。未設定のままアップロードするとエラーにしています。
- パスワード再設定は `RESEND_API_KEY` と `MAIL_FROM` がある場合にメール送信し、未設定時は `PASSWORD_RESET_DEBUG=true` の開発環境だけトークン表示へフォールバックします。
- Docker 構成はローカル確認用です。外部公開時は `COOKIE_SECURE=true`、強固なパスワード、適切な reverse proxy / TLS 終端を前提にしてください。
