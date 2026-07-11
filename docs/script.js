// data/ 配下のJSONを読み込んでダッシュボードを描画する
const COLORS = {
  unicharm: "#3987e5",
  metaplanet: "#199e70",
  btc: "#c98500",
  ink2: "#c3c2b7",
  muted: "#898781",
  grid: "#2c2c2a",
  surface: "#1a1a19",
};

const fmtYen = (v) => v == null ? "—" : v.toLocaleString("ja-JP");
const fmtPct = (v) => v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function deltaClass(v) {
  if (v == null || Math.abs(v) < 0.005) return "flat";
  return v > 0 ? "up" : "down";
}
function deltaArrow(v) {
  if (v == null || Math.abs(v) < 0.005) return "→";
  return v > 0 ? "▲" : "▼";
}

function renderTiles(inv) {
  const last = inv.history[inv.history.length - 1];
  const defs = [
    { key: "unicharm", label: "ユニ・チャーム (8113)", color: COLORS.unicharm, unit: "円", value: last.unicharm, chg: last.unicharm_chg_pct },
    { key: "metaplanet", label: "メタプラネット (3350)", color: COLORS.metaplanet, unit: "円", value: last.metaplanet, chg: last.metaplanet_chg_pct },
    { key: "btc", label: "BTC/JPY", color: COLORS.btc, unit: "円", value: last.btc_jpy, chg: last.btc_chg_pct },
  ];
  document.getElementById("tiles").innerHTML = defs.map((d) => `
    <div class="tile">
      <div class="name"><span class="dot" style="background:${d.color}"></span>${d.label}</div>
      <div class="value">${fmtYen(d.value)}<span class="unit"> ${d.unit}</span></div>
      <div class="delta ${deltaClass(d.chg)}">${deltaArrow(d.chg)} ${fmtPct(d.chg)}（前日比）</div>
    </div>`).join("");
}

function makeChart(canvasId, labels, data, color, tickFmt) {
  new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: labels.length <= 20 ? 4 : 2,
        pointHoverRadius: 6,
        tension: 0.15,
        spanGaps: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: COLORS.surface,
          borderColor: "rgba(255,255,255,0.15)",
          borderWidth: 1,
          titleColor: "#ffffff",
          bodyColor: COLORS.ink2,
          displayColors: false,
          callbacks: { label: (ctx) => `${fmtYen(ctx.parsed.y)} 円` },
        },
      },
      scales: {
        x: {
          ticks: { color: COLORS.muted, maxTicksLimit: 6, font: { size: 10 } },
          grid: { display: false },
          border: { color: "#383835" },
        },
        y: {
          ticks: { color: COLORS.muted, maxTicksLimit: 5, font: { size: 10 }, callback: tickFmt },
          grid: { color: COLORS.grid },
          border: { display: false },
        },
      },
    },
  });
}

function renderCharts(inv) {
  const labels = inv.history.map((h) => h.date.slice(5).replace("-", "/"));
  makeChart("chart-unicharm", labels, inv.history.map((h) => h.unicharm), COLORS.unicharm, (v) => v.toLocaleString("ja-JP"));
  makeChart("chart-metaplanet", labels, inv.history.map((h) => h.metaplanet), COLORS.metaplanet, (v) => v.toLocaleString("ja-JP"));
  makeChart("chart-btc", labels, inv.history.map((h) => h.btc_jpy == null ? null : h.btc_jpy / 10000), COLORS.btc, (v) => v.toLocaleString("ja-JP"));
}

function renderHistoryTable(inv) {
  const rows = [...inv.history].reverse();
  document.getElementById("history-table").innerHTML = `
    <tr><th>日付</th><th>ユニ・チャーム</th><th>前日比</th><th>メタプラネット</th><th>前日比</th><th>BTC/JPY</th><th>前日比</th><th style="text-align:left">メモ</th></tr>
    ${rows.map((h) => `
      <tr>
        <td>${h.date}</td>
        <td>${fmtYen(h.unicharm)}</td><td class="delta ${deltaClass(h.unicharm_chg_pct)}">${fmtPct(h.unicharm_chg_pct)}</td>
        <td>${fmtYen(h.metaplanet)}</td><td class="delta ${deltaClass(h.metaplanet_chg_pct)}">${fmtPct(h.metaplanet_chg_pct)}</td>
        <td>${fmtYen(h.btc_jpy)}</td><td class="delta ${deltaClass(h.btc_chg_pct)}">${fmtPct(h.btc_chg_pct)}</td>
        <td style="text-align:left;white-space:normal">${h.note || ""}</td>
      </tr>`).join("")}
  `;
}

function renderNews(news) {
  const items = news.items.slice(0, 5);
  document.getElementById("news").innerHTML = items.length === 0
    ? `<div class="news-item"><div class="news-summary">ニュースはまだありません。</div></div>`
    : items.map((n) => `
      <div class="news-item">
        <div class="news-date">${n.date}</div>
        <div>
          <div class="news-title">${n.url ? `<a href="${n.url}" target="_blank" rel="noopener">${n.title}</a>` : n.title}</div>
          <div class="news-summary">${n.summary || ""}</div>
          <div class="news-source">${n.source || ""}</div>
        </div>
      </div>`).join("");
}

function renderTasks(household) {
  const badge = { "未着手": "todo", "進行中": "doing", "完了": "done" };
  document.getElementById("tasks").innerHTML = household.tasks.map((t) => `
    <div class="task ${t.status === "完了" ? "is-done" : ""}">
      <span class="badge ${badge[t.status] || "todo"}">${t.status}</span>
      <span class="t-title">${t.title}</span>
      <span class="t-due">${t.due ? `期限 ${t.due}` : ""}</span>
      ${t.notes ? `<span class="t-notes">${t.notes}</span>` : ""}
    </div>`).join("");
}

(async () => {
  try {
    const [inv, news, household] = await Promise.all([
      loadJson("data/investment.json"),
      loadJson("data/reff-news.json"),
      loadJson("data/household.json"),
    ]);
    document.getElementById("updated").textContent =
      `最終更新: ${inv.updated}（投資） / ${news.updated}（ニュース） / ${household.updated}（家庭タスク）`;
    renderTiles(inv);
    renderCharts(inv);
    renderHistoryTable(inv);
    renderNews(news);
    renderTasks(household);
  } catch (e) {
    document.getElementById("updated").textContent = "";
    document.getElementById("error-box").innerHTML =
      `<div class="error">データの読み込みに失敗しました（${e.message}）。<br>
       このページは GitHub Pages のURL経由で開いてください（file:// 直接開きでは動きません）。</div>`;
  }
})();
