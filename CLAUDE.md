# reff-routines — 個人ダッシュボード＆自動レポート

## このリポジトリの目的
Routine（claude.ai のスケジュール実行エージェント）が毎日/毎週データを更新し、
GitHub Pages のダッシュボードで可視化する。3本柱：

1. **投資動向** — ユニ・チャーム(8113)・メタプラネット(3350)・BTC/JPY
2. **RefF関連ニュース** — 紙おむつリサイクル（ユニ・チャーム RefF プロジェクト）の進捗・業界動向
3. **家庭タスク** — ふるさと納税、水回りの検討事項などの進捗管理

## 構成

```
reff-routines/
├── CLAUDE.md          ← このファイル（ルール定義）
├── PROGRESS.md        ← 作業経過ログ
├── README.md
└── docs/              ← GitHub Pages 公開フォルダ（Settings→Pages→main /docs）
    ├── index.html     ← ダッシュボード本体
    ├── script.js      ← JSONを読み込んで描画
    └── data/          ← ★データはここが唯一の置き場（Pagesで配信するためdocs配下）
        ├── investment.json
        ├── reff-news.json
        └── household.json
```

- ダッシュボードURL: https://chaouver.github.io/reff-routines/
- リポジトリは**Public**（GitHub無料プランのため。PagesはPublicのみ対応）
- **プライバシールール（Publicのため厳守）**：`household.json` をはじめ全ファイルに
  住所・電話番号・具体的な金額（年収・控除枠の実額等）・家族の個人名を書かない。
  タスク名は「ふるさと納税の寄付先選定」程度の粒度にとどめる。

## データ形式ルール（Routineはこれを厳守すること）

### docs/data/investment.json
```json
{
  "updated": "YYYY-MM-DD",
  "history": [
    {
      "date": "YYYY-MM-DD",
      "unicharm": 943.0,          // 円（終値または直近値）
      "unicharm_chg_pct": -1.87,  // 前日比%（初回や不明時は null）
      "metaplanet": 249.0,
      "metaplanet_chg_pct": 4.62,
      "btc_jpy": 10368695,
      "btc_chg_pct": null,
      "note": ""                  // 大きな動きの理由メモなど（任意）
    }
  ]
}
```
- `history` は日付昇順で**末尾に追記**する。既存行は書き換えない（訂正時のみ可）。
- 土日祝で株式市場が休みの日は、株価は前営業日終値を引き継ぎ `chg_pct` は 0 とし、
  `note` に「市場休場」と書く。BTC は毎日更新する。

### docs/data/reff-news.json
```json
{
  "updated": "YYYY-MM-DD",
  "items": [
    {
      "date": "YYYY-MM-DD",       // ニュースの発表日
      "title": "見出し",
      "summary": "1〜2文の要約",
      "url": "https://...",
      "source": "媒体名"
    }
  ]
}
```
- `items` は日付降順（新しいものが先頭）。重複記事は追加しない。
- 対象：ユニ・チャームRefF、紙おむつリサイクル全般、再資源化事業等高度化法、
  環境省ガイドライン、競合他社の動向。

### docs/data/household.json
```json
{
  "updated": "YYYY-MM-DD",
  "tasks": [
    {
      "id": 1,
      "title": "タスク名",
      "status": "未着手",         // 未着手 | 進行中 | 完了
      "due": "YYYY-MM-DD",        // 期限なしは null
      "notes": "補足"
    }
  ]
}
```
- タスクの追加・状態変更はユーザー指示または weekly-report の確認に基づく。
  Routine が勝手にタスクを完了にしない。

## Routine のルール

### daily-check（毎朝8:00 JST）
1. ユニ・チャーム(8113)・メタプラネット(3350)の最新株価とBTC/JPY価格をweb検索で取得
2. `docs/data/investment.json` を読み、末尾に本日分を追記（上記形式）
3. `updated` を本日日付に更新してコミット（メッセージ: `daily: investment data YYYY-MM-DD`）
4. 実行結果の最後に短いサマリーを出力：
   - 前日比±3%超の銘柄があれば理由を一言添える
   - 変化が小さければ「本日は大きな動きなし」
   - ★Slack連携は未設定のため、サマリーはセッション出力で確認する運用
     （Slack連携後は #daily-report への投稿に切り替える）

### weekly-report（毎週月曜9:00 JST）※daily-check の動作確認後に作成予定
1. 過去1週間のRefF関連ニュースを検索し `docs/data/reff-news.json` に追記
2. `docs/data/investment.json` から週次の値動きサマリーを作成
3. `docs/data/household.json` の期限が近いタスクを確認事項として列挙
4. コミット（メッセージ: `weekly: report YYYY-MM-DD`）し、構造化サマリーを出力：
   📊 投資動向サマリー / 🔄 RefF関連ニュース / 🏠 家庭タスク状況

## 共通ルール
- 返答・サマリーはすべて日本語
- 日付はすべて JST・`YYYY-MM-DD` 形式
- JSONは UTF-8（BOMなし）・インデント2スペース
- 数値の出典が曖昧な場合は `note` に取得元と時点を書く
- ダッシュボード（docs/index.html, script.js）を変更したら、JSONの形式変更と
  整合しているか必ず両方確認する

## Slack連携（未設定・将来オプション）
現状ユーザーはSlack未導入。導入する場合の手順：
1. Slackワークスペースを作成し #daily-report / #weekly-report チャンネルを作る
2. claude.ai の設定 → コネクタ から Slack を接続（または Claude in Slack を導入）
3. 本ファイルの daily-check / weekly-report のサマリー出力先をSlack投稿に書き換え、
   Routine のプロンプトも更新する
