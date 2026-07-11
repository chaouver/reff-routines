# PROGRESS

## 2026-07-12 セッション1（初期構築・ローカルClaude Codeから）
- リポジトリ新規作成（Private、GitHub ProのためPrivateでもPages公開可）
- 構成確定：データは `docs/data/` に一元化（GitHub Pagesのフォルダ指定が `/` か `/docs` の
  2択のため、当初案の `dashboard/` は `docs/` に変更。data/ もPages配信のためdocs配下に）
- 初期データ投入：
  - investment.json — 2026-07-10終値ベース（ユニ・チャーム943円・メタプラネット249円・
    BTC約10,368,695円。web検索による取得のため参考値、以後はdaily-checkが毎日更新）
  - reff-news.json — 2026年5〜6月のRefF関連ニュース3件（マーケティング大賞準グランプリ、
    イオン販売拡大、累計704万枚リサイクル）
  - household.json — ふるさと納税・水回りの2タスクを仮登録（詳細はユーザーが追記）
- ダッシュボード作成（docs/index.html + script.js）：
  - ダークテーマ・レスポンシブ・Chart.js 4系CDN
  - 現在値タイル3枚＋資産別ミニチャート3枚（スケールが違うため1グラフに統合しない）
  - RefFニュースタイムライン、家庭タスクチェックリスト、投資履歴テーブル
- Slackは未導入のため通知はRoutineセッション出力で確認する運用（CLAUDE.md参照）
- 次のステップ：daily-check数日運用→形式が安定したらweekly-report追加
