# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際のガイドラインです。

## プロジェクト概要

Supabase認証機能付きの不動産管理Webアプリ。メールアドレス＋パスワードでの会員登録・ログインに対応し、ログイン後は物件一覧画面（物件名・家賃・エリア・間取りをカード表示）に遷移する。未ログイン時はログイン画面にリダイレクトする。物件情報はSupabase（PostgreSQL）に保存され、ユーザーごとに自分が登録した物件のみ閲覧・編集・削除できる。

## 技術スタック

- **フレームワーク**: React 19
- **ビルドツール**: Vite（`@vitejs/plugin-react`）
- **言語**: JavaScript（JSX）。TypeScriptは未導入
- **ルーティング**: `react-router-dom`
- **認証・DB**: Supabase（`@supabase/supabase-js`）。メール/パスワード認証＋PostgreSQLの`properties`テーブル
- **スタイリング**: 素のCSS（`App.css` / `index.css`）。CSS-in-JSやUIライブラリは未使用
- **状態管理**: Reactの`useState` / `useEffect` / Context APIのみ（外部の状態管理ライブラリなし）
- **デプロイ**: Vercel（`vercel.json`でSPAのフォールバックを設定）
- **Lint**: `oxlint`

## ディレクトリ構成

```
src/
  main.jsx              # エントリーポイント
  App.jsx                # ルーティング定義（AuthProvider + BrowserRouter）
  App.css / index.css    # スタイルシート
  supabaseClient.js       # Supabaseクライアントの生成（.envから接続情報を読み込む）
  AuthContext.jsx         # ログイン状態（session/user）をアプリ全体に共有するContext
  components/
    ProtectedRoute.jsx    # 未ログイン時に/loginへリダイレクトするラッパー
    PropertyCard.jsx       # 物件カード（編集・削除ボタン付き）
    PropertyForm.jsx       # 物件の新規登録・編集共通フォーム
  pages/
    LoginPage.jsx
    SignupPage.jsx
    PropertiesPage.jsx     # 物件一覧＋CRUD操作をまとめた画面
supabase/
  schema.sql              # propertiesテーブル・RLSポリシー・権限付与のSQL（Supabase SQL Editorで実行）
vercel.json               # 全パスをindex.htmlに返すSPA向けrewrite設定
```

## Supabase連携

### 環境変数

- Supabaseの接続情報（`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`）は`.env`で管理し、**`.env`はgit管理対象外**（`.gitignore`に追加済み）。
- `.env.example`にキー名のみのテンプレートを用意しているので、新規セットアップ時はこれをコピーして値を埋める。
- 本番環境（Vercel）の環境変数はVercelダッシュボード側で設定する。`vercel.json`には含めない。

### DBスキーマとRLS

- テーブル定義・RLSポリシーは`supabase/schema.sql`に一元管理し、変更時はこのファイルを更新した上でSupabaseダッシュボードの「SQL Editor」で手動実行する（Claude Code側からSupabaseへ直接SQLを実行する権限は持たない）。
- RLSを有効化し、「自分（`auth.uid()`）が`user_id`に一致する行のみSELECT/INSERT/UPDATE/DELETEできる」ポリシーを必ず設定する。
- **注意**: SQL EditorでCREATE TABLEした場合、RLSポリシーとは別に`authenticated`ロールへのテーブル権限（GRANT）が必要になる。付与し忘れると`permission denied for table ...`（エラーコード42501）になる。`schema.sql`の末尾で`grant select, insert, update, delete on public.<table> to authenticated;`を必ず付けること。
- 新しいテーブルを追加する場合も同様に、RLSポリシーとGRANTをセットで`schema.sql`に追記する。

## コーディング規約

- **コンポーネントファイル名**: `PascalCase.jsx`（例: `PropertyCard.jsx`）。1ファイル1コンポーネントを基本とする。
- **関数コンポーネント**: アロー関数ではなく`function ComponentName() { ... }`形式の関数宣言を使う。
- **イベントハンドラ / 更新関数**: `handleSubmit`のようなDOMイベント直結の関数、および`handleCreate` / `handleUpdate` / `handleDelete`のようなSupabaseへのCRUD操作を行う関数は`handle`接頭辞を付ける。
- **CSSクラス名**: `kebab-case`（例: `property-card`、`property-form`）。ページ単位のスタイルは`App.css`にまとめ、コンポーネント個別のCSSファイルは分けていない。
- **コメント**: 日本語で記載する。「なぜそうしているか」が非自明な箇所（RLSとGRANTの関係など）にのみコメントを残し、コードから読み取れる内容は書かない。
- **state**: `useState` / `useEffect` / Context APIのみで足りる範囲はそれで対応し、外部の状態管理ライブラリは導入しない。

## Git運用ルール

- **コードに変更を加えるたびに、コミットしてGitHubにプッシュすること。**
  - 変更（新機能追加・修正・リファクタリングなど）が完了したら、そのまま作業を留めず、都度コミット→プッシュまで行う。
  - 変更を溜め込んで後でまとめてプッシュすることは避ける。
- コミットメッセージは変更内容が分かるように簡潔に記述する（日本語・英語どちらでも可）。
- push前に `git status` / `git diff` で差分を確認し、意図しない変更（`.env`など秘匿情報を含むファイル）が含まれていないかチェックする。
- force push（`git push --force`）や `git reset --hard` などの破壊的操作は、明示的な指示がない限り行わない。
- 認証情報や `.env` など秘匿情報を含むファイルはコミットしない。

## 開発コマンド

```bash
npm install      # 依存関係のインストール
npm run dev       # 開発サーバー起動（http://localhost:5173、ポートは適宜変更可）
npm run build     # 本番ビルド（distに出力）
npm run preview   # ビルド後の成果物をローカルでプレビュー
npm run lint      # oxlintによる静的解析
```

## 動作確認の方法

- ローカルでUIを確認する場合は`npm run dev`で開発サーバーを起動し、ブラウザで動作確認する。
- 自動テストは未整備のため、認証・CRUDなどSupabaseと連携する機能を変更した場合は、実際にSupabaseプロジェクトに対してログイン→操作→ログアウトの一連の流れが通ることを確認してから完了とする。

## デプロイ情報

- 本番URL：https://real-estate-app-gules-two.vercel.app/properties
- Supabaseプロジェクト名：realestate-PJ
