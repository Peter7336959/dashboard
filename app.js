let controlRecords = [];
let measurements = [];
let months = [];
let plants = [];
let hazardLevels = [];

const state = { metric: "permits" };

const selectors = {
  startMonth: document.getElementById("startMonthFilter"),
  endMonth: document.getElementById("endMonthFilter"),
  plant: document.getElementById("plantFilter"),
  hazard: document.getElementById("hazardFilter")
};

const metricLabels = {
  permits: "工作許可證",
  checks: "管制查核項次",
  passRate: "整體合格率",
  critical: "重大缺失",
  open: "未結案缺失",
  envAlerts: "環境測定警示"
};

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(Math.round(value || 0));
}

function formatDecimal(value, digits = 1) {
  return new Intl.NumberFormat("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value || 0);
}

function formatPercent(value) {
  return `${formatDecimal(value, 1)}%`;
}

function inFilter(row) {
  return row.month >= selectors.startMonth.value
    && row.month <= selectors.endMonth.value
    && (selectors.plant.value === "all" || row.plant === selectors.plant.value)
    && (selectors.hazard.value === "all" || row.hazard_level === selectors.hazard.value);
}

function filteredControls() {
  return controlRecords.filter(inFilter);
}

function filteredMeasurements() {
  return measurements.filter(inFilter);
}

function uniquePermitTotal(rows) {
  const groups = new Map();
  rows.forEach((row) => groups.set(`${row.month}|${row.plant}|${row.hazard_level}`, row.permit_count));
  return [...groups.values()].reduce((sum, value) => sum + value, 0);
}

function summarizeControls(rows) {
  const checks = rows.reduce((sum, row) => sum + row.check_count, 0);
  const pass = rows.reduce((sum, row) => sum + row.pass_count, 0);
  const defects = rows.reduce((sum, row) => sum + row.defect_count, 0);
  const critical = rows.reduce((sum, row) => sum + row.critical_defect_count, 0);
  const open = rows.reduce((sum, row) => sum + row.open_defect_count, 0);
  const overdue = rows.reduce((sum, row) => sum + row.overdue_defect_count, 0);
  return {
    permits: uniquePermitTotal(rows),
    checks,
    pass,
    defects,
    critical,
    open,
    overdue,
    passRate: checks ? (pass / checks) * 100 : 0
  };
}

function summarizeMeasurements(rows) {
  if (!rows.length) {
    return {
      combustible: 0,
      oxygen: 0,
      co: 0,
      h2s: 0,
      combustibleOk: true,
      oxygenOk: true,
      coOk: true,
      h2sOk: true,
      alerts: 0
    };
  }
  return {
    combustible: Math.max(...rows.map((row) => row.combustible_gas_max_pct_lel)),
    oxygen: Math.min(...rows.map((row) => row.oxygen_min_pct)),
    co: Math.max(...rows.map((row) => row.co_max_ppm)),
    h2s: Math.max(...rows.map((row) => row.h2s_max_ppm)),
    combustibleOk: rows.every((row) => row.combustible_ok),
    oxygenOk: rows.every((row) => row.oxygen_ok),
    coOk: rows.every((row) => row.co_ok),
    h2sOk: rows.every((row) => row.h2s_ok),
    alerts: rows.reduce((sum, row) => sum + row.alert_count, 0)
  };
}

function metricValue(rows, measureRows, metric) {
  const summary = summarizeControls(rows);
  if (metric === "passRate") return summary.passRate;
  if (metric === "envAlerts") return summarizeMeasurements(measureRows).alerts;
  return summary[metric] || 0;
}

function updateMetrics(rows, measureRows) {
  const summary = summarizeControls(rows);
  const env = summarizeMeasurements(measureRows);
  document.getElementById("metricPermits").textContent = formatNumber(summary.permits);
  document.getElementById("metricChecks").textContent = formatNumber(summary.checks);
  document.getElementById("metricPassRate").textContent = formatPercent(summary.passRate);
  document.getElementById("metricCritical").textContent = formatNumber(summary.critical);
  document.getElementById("metricOpen").textContent = formatNumber(summary.open);
  document.getElementById("metricEnvAlerts").textContent = formatNumber(env.alerts);
}

function drawTrend(rows, measureRows) {
  const canvas = document.getElementById("trendCanvas");
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const height = 320;
  canvas.width = rect.width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, height);

  const activeMonths = months.filter((month) => month >= selectors.startMonth.value && month <= selectors.endMonth.value);
  const buckets = activeMonths.map((month) => ({
    month,
    value: metricValue(
      rows.filter((row) => row.month === month),
      measureRows.filter((row) => row.month === month),
      state.metric
    )
  }));
  const max = Math.max(...buckets.map((item) => item.value), 1);
  const padding = { top: 24, right: 24, bottom: 48, left: 68 };
  const chartW = rect.width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  ctx.strokeStyle = "#d7dee4";
  ctx.lineWidth = 1;
  ctx.font = "13px Microsoft JhengHei, Arial";
  ctx.fillStyle = "#65727c";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + chartH * (i / 4);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    const tick = max * (1 - i / 4);
    ctx.fillText(state.metric === "passRate" ? formatPercent(tick) : formatNumber(tick), 8, y + 4);
  }

  const step = chartW / Math.max(buckets.length - 1, 1);
  const points = buckets.map((item, index) => ({
    x: buckets.length === 1 ? padding.left + chartW / 2 : padding.left + step * index,
    y: padding.top + chartH - (item.value / max) * chartH,
    ...item
  }));

  ctx.strokeStyle = ["critical", "open", "envAlerts"].includes(state.metric) ? "#d72638" : "#008c95";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (index % Math.max(1, Math.ceil(points.length / 12)) === 0) {
      ctx.fillStyle = "#65727c";
      ctx.fillText(point.month.slice(2), point.x - 18, 296);
    }
  });

  document.getElementById("trendSubtitle").textContent = metricLabels[state.metric];
}

function groupBy(rows, keyFn) {
  return rows.reduce((map, row) => {
    const key = keyFn(row);
    const current = map.get(key) || [];
    current.push(row);
    map.set(key, current);
    return map;
  }, new Map());
}

function updatePlantRisk(rows) {
  const items = [...groupBy(rows, (row) => row.plant).entries()].map(([plant, plantRows]) => {
    const summary = summarizeControls(plantRows);
    const score = summary.defects * 2 + summary.critical * 9 + summary.open * 3 + summary.overdue * 5;
    return { plant, score, summary };
  }).sort((a, b) => b.score - a.score);
  const max = Math.max(...items.map((item) => item.score), 1);
  document.getElementById("plantRiskList").innerHTML = items.map((item) => `
    <div class="risk-row">
      <div>
        <strong>${item.plant}</strong>
        <div class="meta-text">重大 ${formatNumber(item.summary.critical)}｜未結案 ${formatNumber(item.summary.open)}</div>
      </div>
      <div class="risk-meter"><span style="width:${item.score / max * 100}%"></span></div>
      <strong>${formatNumber(item.score)}</strong>
    </div>
  `).join("");
}

function updateStatusBars(rows) {
  const summary = summarizeControls(rows);
  const values = [
    { label: "一般缺失", value: Math.max(summary.defects - summary.critical, 0), className: "b" },
    { label: "重大缺失", value: summary.critical, className: "a" },
    { label: "未結案", value: summary.open, className: "c" },
    { label: "逾期", value: summary.overdue, className: "d" }
  ];
  const max = Math.max(...values.map((item) => item.value), 1);
  document.getElementById("statusBars").innerHTML = values.map((item) => `
    <div class="bar-row">
      <div class="bar-meta"><strong>${item.label}</strong><span>${formatNumber(item.value)}</span></div>
      <div class="bar-track"><div class="bar-fill ${item.className}" style="width:${item.value / max * 100}%"></div></div>
    </div>
  `).join("");
}

function gasCard(label, value, unit, ok, standard) {
  return `
    <div class="gas-card ${ok ? "ok" : "alert"}">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${unit}｜基準 ${standard}</small>
      ${ok ? "<em>符合</em>" : "<em>紅色警示</em>"}
    </div>
  `;
}

function updateGasGrid(measureRows) {
  const env = summarizeMeasurements(measureRows);
  document.getElementById("gasGrid").innerHTML = [
    gasCard("可燃性氣體", formatDecimal(env.combustible), "%LEL", env.combustibleOk, "<20"),
    gasCard("氧氣", formatDecimal(env.oxygen), "%", env.oxygenOk, ">=18"),
    gasCard("一氧化碳", formatDecimal(env.co), "ppm", env.coOk, "<50"),
    gasCard("硫化氫", formatDecimal(env.h2s), "ppm", env.h2sOk, "<10")
  ].join("");
}

function updateIndicators(rows) {
  const items = [...groupBy(rows, (row) => row.indicator).entries()].map(([indicator, indicatorRows]) => {
    const summary = summarizeControls(indicatorRows);
    return { indicator, summary };
  }).sort((a, b) => a.summary.passRate - b.summary.passRate);

  document.getElementById("indicatorGrid").innerHTML = items.map((item) => {
    const passRate = item.summary.passRate;
    const className = passRate < 94 ? "bad" : passRate < 97 ? "warn" : "good";
    return `
      <button class="indicator-card ${className}" data-indicator="${item.indicator}">
        <span>${item.indicator}</span>
        <strong>${formatPercent(passRate)}</strong>
        <small>缺失 ${formatNumber(item.summary.defects)}｜重大 ${formatNumber(item.summary.critical)}｜未結案 ${formatNumber(item.summary.open)}</small>
      </button>
    `;
  }).join("");
}

function updateDetails(rows) {
  const html = [...rows]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 100)
    .map((row) => `
      <tr>
        <td>${row.month}</td>
        <td>${row.plant}</td>
        <td>${row.hazard_name}</td>
        <td>${row.indicator}</td>
        <td><strong>${row.control_item}</strong><div class="meta-text">${row.content}</div></td>
        <td>${formatNumber(row.check_count)}</td>
        <td>${formatNumber(row.defect_count)}</td>
        <td>${formatNumber(row.critical_defect_count)}</td>
        <td>${formatNumber(row.open_defect_count)}</td>
        <td>${formatPercent(row.pass_rate * 100)}</td>
        <td><span class="risk-badge ${row.risk_level}">${row.risk_level}</span></td>
      </tr>
    `).join("");
  document.getElementById("detailRows").innerHTML = html || "<tr><td colspan=\"11\">無符合條件資料</td></tr>";
}

function render() {
  const rows = filteredControls();
  const measureRows = filteredMeasurements();
  updateMetrics(rows, measureRows);
  drawTrend(rows, measureRows);
  updatePlantRisk(rows);
  updateStatusBars(rows);
  updateGasGrid(measureRows);
  updateIndicators(rows);
  updateDetails(rows);
}

function hydrateFilters(payload) {
  plants = payload.plants;
  months = payload.months;
  hazardLevels = payload.hazardLevels;
  plants.forEach((plant) => selectors.plant.append(new Option(plant, plant)));
  hazardLevels.forEach((level) => selectors.hazard.append(new Option(`${level.name}（${level.label}）`, level.id)));
}

async function initialize() {
  const response = await fetch("data/work-permit-control-dashboard.json");
  const payload = await response.json();
  controlRecords = payload.controlRecords;
  measurements = payload.environmentMeasurements;
  hydrateFilters(payload);
  render();
}

document.querySelectorAll(".metric-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".metric-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    state.metric = card.dataset.metric;
    render();
  });
});

Object.values(selectors).forEach((input) => input.addEventListener("input", render));

document.getElementById("resetFilters").addEventListener("click", () => {
  selectors.startMonth.value = "2024-01";
  selectors.endMonth.value = "2026-12";
  selectors.plant.value = "all";
  selectors.hazard.value = "all";
  render();
});

document.getElementById("exportSummary").addEventListener("click", () => {
  const rows = filteredControls();
  const measureRows = filteredMeasurements();
  const summary = summarizeControls(rows);
  const env = summarizeMeasurements(measureRows);
  const text = [
    "工作許可管制查核摘要",
    `期間：${selectors.startMonth.value} 至 ${selectors.endMonth.value}`,
    `廠區：${selectors.plant.value === "all" ? "全部廠區" : selectors.plant.value}`,
    `危害等級：${selectors.hazard.value === "all" ? "全部等級" : selectors.hazard.value}`,
    `工作許可證：${formatNumber(summary.permits)}`,
    `查核項次：${formatNumber(summary.checks)}`,
    `合格率：${formatPercent(summary.passRate)}`,
    `重大缺失：${formatNumber(summary.critical)}`,
    `環境測定警示：${formatNumber(env.alerts)}`
  ].join("\n");
  navigator.clipboard?.writeText(text);
  alert(text);
});

window.addEventListener("resize", render);
initialize();
