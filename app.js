const plants = ["桃園", "台中", "嘉義", "高雄大林", "高雄林園"];
let months = buildMonthRange("2024-01", "2026-12");

const modules = [
  {
    id: "permit",
    name: "許可基本資料",
    items: ["工作內容與地點完整", "作業分級正確", "核准工作時間明確", "回簽資料完整"]
  },
  {
    id: "workType",
    name: "作業分級與工作項目",
    items: ["動火/非動火判定正確", "A/B/C級作業判定正確", "附加檢點表適用", "延時工作經核准"]
  },
  {
    id: "contractor",
    name: "承攬商與人員資格",
    items: ["施工人員名冊完整", "工地負責人到場", "安衛人員到場", "特殊作業主管資格符合"]
  },
  {
    id: "hazardNotice",
    name: "危害告知",
    items: ["承攬商已知悉注意事項", "施工人員完成危害告知", "勤前教育紀錄完整", "緊急聯絡資訊明確"]
  },
  {
    id: "isolation",
    name: "環境安全隔離",
    items: ["設備管線已釋壓清洗", "進出口已關斷/盲封/掛牌", "電源隔離加鎖掛牌", "暗溝陰井已堵塞密封"]
  },
  {
    id: "gas",
    name: "氣體偵測",
    items: ["可燃性氣體低於20%LEL", "氧氣濃度符合標準", "有害氣體低於容許濃度", "上下午或連續測定紀錄完整"]
  },
  {
    id: "fireExplosion",
    name: "消防與防爆設備",
    items: ["20型滅火器配置足夠", "防爆電氣設備符合", "安全工具使用正確", "消防水帶或防火措施到位"]
  },
  {
    id: "ppeHeight",
    name: "PPE與高處防墜",
    items: ["個人防護具穿戴正確", "安全帶/安全母索使用", "施工架檢點合格", "安全網或工作平台設置"]
  },
  {
    id: "patrol",
    name: "巡查會簽",
    items: ["轄區檢點簽認", "監造巡查簽認", "安衛人員巡查紀錄", "異常已即時通知"]
  },
  {
    id: "closeout",
    name: "收工回簽與現場紀錄",
    items: ["環境整理完成", "施工前後照片完整", "氣體偵測照片上傳", "改善事項結案佐證完整"]
  }
];

const metricLabels = {
  permits: "工作許可證",
  checks: "查核項次",
  passRate: "整體合格率",
  critical: "重大缺失",
  open: "未結案缺失",
  gas: "氣體偵測異常",
  hotWork: "動火高風險缺失",
  highWork: "高處防墜缺失"
};

const plantProfile = {
  "桃園": { permits: 92, risk: 0.92 },
  "台中": { permits: 76, risk: 0.86 },
  "嘉義": { permits: 64, risk: 0.78 },
  "高雄大林": { permits: 128, risk: 1.15 },
  "高雄林園": { permits: 116, risk: 1.08 }
};

const moduleRisk = {
  permit: 0.55,
  workType: 0.72,
  contractor: 0.9,
  hazardNotice: 0.65,
  isolation: 1.18,
  gas: 1.25,
  fireExplosion: 1.28,
  ppeHeight: 1.2,
  patrol: 0.8,
  closeout: 0.95
};

const state = { metric: "permits" };

const selectors = {
  startMonth: document.getElementById("startMonthFilter"),
  endMonth: document.getElementById("endMonthFilter"),
  plant: document.getElementById("plantFilter"),
  module: document.getElementById("moduleFilter"),
  risk: document.getElementById("riskFilter")
};

plants.forEach((plant) => selectors.plant.append(new Option(plant, plant)));
modules.forEach((module) => selectors.module.append(new Option(module.name, module.id)));

function buildMonthRange(start, end) {
  const result = [];
  const [startYear, startMonth] = start.split("-").map(Number);
  const [endYear, endMonth] = end.split("-").map(Number);
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

function configureMonthFilters() {
  const start = months[0];
  const end = months[months.length - 1];
  [selectors.startMonth, selectors.endMonth].forEach((input) => {
    input.min = start;
    input.max = end;
  });
  selectors.startMonth.value = start;
  selectors.endMonth.value = end;
}

function seededNoise(seed) {
  const value = Math.sin(seed * 999) * 10000;
  return value - Math.floor(value);
}

function buildRecords() {
  const records = [];
  plants.forEach((plant, plantIndex) => {
    months.forEach((month, monthIndex) => {
      const seasonal = 1 + 0.08 * Math.sin((monthIndex + 1) / 12 * Math.PI * 2);
      const permitCount = Math.round(plantProfile[plant].permits * seasonal + seededNoise(plantIndex * 31 + monthIndex) * 12);
      modules.forEach((module, moduleIndex) => {
        module.items.forEach((item, itemIndex) => {
          const seed = (plantIndex + 1) * 1000 + (monthIndex + 1) * 100 + moduleIndex * 10 + itemIndex;
          const sampleRatio = 0.82 + seededNoise(seed) * 0.2;
          const checks = Math.max(8, Math.round(permitCount * sampleRatio));
          const baseDefectRate = 0.012 + 0.028 * plantProfile[plant].risk * moduleRisk[module.id];
          const itemFactor = 0.85 + seededNoise(seed + 7) * 0.45;
          const defects = Math.min(checks, Math.round(checks * baseDefectRate * itemFactor));
          const criticalBase = ["gas", "fireExplosion", "isolation", "ppeHeight"].includes(module.id) ? 0.22 : 0.08;
          const critical = Math.min(defects, Math.round(defects * (criticalBase + seededNoise(seed + 13) * 0.12)));
          const open = Math.min(defects, Math.round(defects * (0.22 + seededNoise(seed + 19) * 0.28)));
          const overdue = Math.min(open, Math.round(open * (0.18 + seededNoise(seed + 23) * 0.22)));
          const pass = checks - defects;
          const passRate = pass / checks;
          const riskScore = defects * 2 + critical * 8 + open * 3 + overdue * 5;
          const riskLevel = riskScore >= 42 ? "高" : riskScore >= 18 ? "中" : "低";

          records.push({
            month,
            plant,
            moduleId: module.id,
            moduleName: module.name,
            item,
            permits: permitCount,
            checks,
            pass,
            defects,
            critical,
            open,
            overdue,
            passRate,
            riskScore,
            riskLevel
          });
        });
      });
    });
  });
  return records;
}

let records = [];

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function formatPercent(value) {
  return `${Math.round(value * 10) / 10}%`;
}

function filteredRecords() {
  return records.filter((record) => {
    return record.month >= selectors.startMonth.value
      && record.month <= selectors.endMonth.value
      && (selectors.plant.value === "all" || record.plant === selectors.plant.value)
      && (selectors.module.value === "all" || record.moduleId === selectors.module.value)
      && (selectors.risk.value === "all" || record.riskLevel === selectors.risk.value);
  });
}

function groupBy(data, keyFn) {
  return data.reduce((map, row) => {
    const key = keyFn(row);
    const current = map.get(key) || [];
    current.push(row);
    map.set(key, current);
    return map;
  }, new Map());
}

function summarize(data) {
  const permitKeys = new Set(data.map((row) => `${row.month}|${row.plant}`));
  const permits = [...permitKeys].reduce((sum, key) => {
    const [month, plant] = key.split("|");
    const row = data.find((item) => item.month === month && item.plant === plant);
    return sum + (row?.permits || 0);
  }, 0);
  const checks = data.reduce((sum, row) => sum + row.checks, 0);
  const pass = data.reduce((sum, row) => sum + row.pass, 0);
  const defects = data.reduce((sum, row) => sum + row.defects, 0);
  const critical = data.reduce((sum, row) => sum + row.critical, 0);
  const open = data.reduce((sum, row) => sum + row.open, 0);
  const overdue = data.reduce((sum, row) => sum + row.overdue, 0);
  return {
    permits,
    checks,
    pass,
    defects,
    critical,
    open,
    overdue,
    passRate: checks ? pass / checks * 100 : 0,
    gas: data.filter((row) => row.moduleId === "gas").reduce((sum, row) => sum + row.defects, 0),
    hotWork: data.filter((row) => row.moduleId === "fireExplosion").reduce((sum, row) => sum + row.critical, 0),
    highWork: data.filter((row) => row.moduleId === "ppeHeight").reduce((sum, row) => sum + row.defects, 0)
  };
}

function metricValue(data, metric) {
  const summary = summarize(data);
  if (metric === "passRate") return summary.passRate;
  return summary[metric] || 0;
}

function updateMetrics(data) {
  const summary = summarize(data);
  document.getElementById("metricPermits").textContent = formatNumber(summary.permits);
  document.getElementById("metricChecks").textContent = formatNumber(summary.checks);
  document.getElementById("metricPassRate").textContent = formatPercent(summary.passRate);
  document.getElementById("metricCritical").textContent = formatNumber(summary.critical);
  document.getElementById("metricOpen").textContent = formatNumber(summary.open);
  document.getElementById("metricGas").textContent = formatNumber(summary.gas);
  document.getElementById("metricHotWork").textContent = formatNumber(summary.hotWork);
  document.getElementById("metricHighWork").textContent = formatNumber(summary.highWork);
}

function drawTrend(data) {
  const canvas = document.getElementById("trendCanvas");
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const height = 320;
  canvas.width = rect.width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, height);

  const buckets = months
    .filter((month) => month >= selectors.startMonth.value && month <= selectors.endMonth.value)
    .map((month) => ({ month, value: metricValue(data.filter((row) => row.month === month), state.metric) }));
  const max = Math.max(...buckets.map((item) => item.value), 1);
  const padding = { top: 24, right: 24, bottom: 48, left: 64 };
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
    ctx.fillText(state.metric === "passRate" ? formatPercent(tick) : formatNumber(Math.round(tick)), 8, y + 4);
  }

  const step = chartW / Math.max(buckets.length - 1, 1);
  const points = buckets.map((item, index) => ({
    x: buckets.length === 1 ? padding.left + chartW / 2 : padding.left + step * index,
    y: padding.top + chartH - (item.value / max) * chartH,
    ...item
  }));

  ctx.strokeStyle = ["critical", "open", "gas", "hotWork", "highWork"].includes(state.metric) ? "#ba2d2d" : "#047c7a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172026";
    const label = state.metric === "passRate" ? formatPercent(point.value) : formatNumber(Math.round(point.value));
    ctx.fillText(label, point.x - 18, point.y - 12);
    const shouldShowMonth = buckets.length <= 14 || point.month.endsWith("-01") || point.month.endsWith("-06") || point.month.endsWith("-12");
    if (shouldShowMonth) {
      ctx.fillStyle = "#65727c";
      ctx.fillText(point.month.slice(2), point.x - 16, 296);
    }
  });

  document.getElementById("trendSubtitle").textContent = metricLabels[state.metric];
}

function updatePlantRisk(data) {
  const rows = [...groupBy(data, (row) => row.plant).entries()].map(([plant, items]) => {
    const summary = summarize(items);
    const score = summary.critical * 8 + summary.open * 3 + summary.overdue * 5 + summary.defects;
    return { plant, score, summary };
  }).sort((a, b) => b.score - a.score);
  const max = Math.max(...rows.map((row) => row.score), 1);
  document.getElementById("plantRiskList").innerHTML = rows.map((row) => `
    <div class="risk-row">
      <div>
        <strong>${row.plant}</strong>
        <div class="meta-text">重大 ${formatNumber(row.summary.critical)}，未結案 ${formatNumber(row.summary.open)}</div>
      </div>
      <div class="risk-meter"><span style="width:${row.score / max * 100}%"></span></div>
      <strong>${formatNumber(row.score)}</strong>
    </div>
  `).join("");
}

function updateStatusBars(data) {
  const summary = summarize(data);
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

function updateModules(data) {
  const rows = modules.map((module) => {
    const items = data.filter((row) => row.moduleId === module.id);
    return { module, summary: summarize(items) };
  });
  document.getElementById("moduleGrid").innerHTML = rows.map(({ module, summary }) => {
    const passRate = summary.checks ? summary.passRate : 0;
    const className = passRate < 94 ? "bad" : passRate < 97 ? "warn" : "good";
    return `
      <button class="module-card ${className}" data-module="${module.id}">
        <span>${module.name}</span>
        <strong>${formatPercent(passRate)}</strong>
        <small>缺失 ${formatNumber(summary.defects)}｜重大 ${formatNumber(summary.critical)}｜未結案 ${formatNumber(summary.open)}</small>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".module-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectors.module.value = card.dataset.module;
      render();
      document.getElementById("details").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function updateDetails(data) {
  const rows = [...data]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 80)
    .map((row) => `
      <tr>
        <td>${row.month}</td>
        <td>${row.plant}</td>
        <td>${row.moduleName}</td>
        <td>${row.item}</td>
        <td>${formatNumber(row.checks)}</td>
        <td>${formatNumber(row.defects)}</td>
        <td>${formatNumber(row.critical)}</td>
        <td>${formatNumber(row.open)}</td>
        <td>${formatPercent(row.passRate * 100)}</td>
        <td><span class="risk-badge ${row.riskLevel}">${row.riskLevel}</span></td>
      </tr>
    `);
  document.getElementById("detailRows").innerHTML = rows.join("") || "<tr><td colspan=\"10\">無符合條件資料</td></tr>";
}

function render() {
  const data = filteredRecords();
  updateMetrics(data);
  drawTrend(data);
  updatePlantRisk(data);
  updateStatusBars(data);
  updateModules(data);
  updateDetails(data);
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
  selectors.startMonth.value = months[0];
  selectors.endMonth.value = months[months.length - 1];
  selectors.plant.value = "all";
  selectors.module.value = "all";
  selectors.risk.value = "all";
  render();
});

document.getElementById("exportSummary").addEventListener("click", () => {
  const summary = summarize(filteredRecords());
  const text = [
    "工作許可證共同核心查核摘要",
    `期間：${selectors.startMonth.value} 至 ${selectors.endMonth.value}`,
    `廠區：${selectors.plant.value === "all" ? "全部廠區" : selectors.plant.value}`,
    `模組：${selectors.module.value === "all" ? "全部模組" : modules.find((module) => module.id === selectors.module.value)?.name}`,
    `工作許可證：${formatNumber(summary.permits)}`,
    `查核項次：${formatNumber(summary.checks)}`,
    `整體合格率：${formatPercent(summary.passRate)}`,
    `重大缺失：${formatNumber(summary.critical)}`,
    `未結案缺失：${formatNumber(summary.open)}`
  ].join("\n");
  navigator.clipboard?.writeText(text);
  alert(text);
});

window.addEventListener("resize", render);

async function initializeData() {
  try {
    const response = await fetch("data/work-permit-core-checks.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    months = payload.months?.length ? payload.months : months;
    records = payload.records;
  } catch (error) {
    records = buildRecords();
    console.warn("使用內建模擬資料，未讀取外部 JSON：", error);
  }
  configureMonthFilters();
  render();
}

initializeData();
