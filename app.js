const plants = ["桃園", "台中", "嘉義", "高雄大林", "高雄林園"];
const periods = ["2026-06", "2026-07", "2026-08"];

const metricLabels = {
  equipment: "關鍵設備數",
  inspection: "定期檢查數",
  maintenance: "維修數",
  contractors: "承攬商進場人數",
  hazard: "高危害作業數",
  permits: "工作許可證數",
  machines: "機械設備進場數",
  incidents: "意外事故數"
};

const records = [
  { date: "2026-06-07", period: "2026-06", plant: "桃園", contractor: "中鼎工程", worksite: "煉製一課", equipment: 186, inspection: 96, maintenance: 24, contractorPeople: 218, contractorEntries: 47, hazard: { A: 12, B: 26, C: 33 }, permits: 154, machines: { crane: 7, aerial: 5, welder: 18 }, zeroHours: 438000 },
  { date: "2026-06-09", period: "2026-06", plant: "台中", contractor: "漢翔維修", worksite: "儲運工場", equipment: 142, inspection: 74, maintenance: 19, contractorPeople: 166, contractorEntries: 31, hazard: { A: 8, B: 21, C: 28 }, permits: 119, machines: { crane: 5, aerial: 4, welder: 12 }, zeroHours: 391000 },
  { date: "2026-06-12", period: "2026-06", plant: "嘉義", contractor: "聯興機電", worksite: "公用設施", equipment: 121, inspection: 68, maintenance: 17, contractorPeople: 142, contractorEntries: 25, hazard: { A: 7, B: 18, C: 22 }, permits: 103, machines: { crane: 4, aerial: 3, welder: 11 }, zeroHours: 326000 },
  { date: "2026-06-15", period: "2026-06", plant: "高雄大林", contractor: "大林營造", worksite: "裂解工場", equipment: 238, inspection: 132, maintenance: 38, contractorPeople: 326, contractorEntries: 62, hazard: { A: 20, B: 39, C: 47 }, permits: 214, machines: { crane: 12, aerial: 9, welder: 24 }, zeroHours: 512000 },
  { date: "2026-06-18", period: "2026-06", plant: "高雄林園", contractor: "南區環工", worksite: "聚合工場", equipment: 221, inspection: 118, maintenance: 34, contractorPeople: 284, contractorEntries: 55, hazard: { A: 18, B: 34, C: 42 }, permits: 198, machines: { crane: 10, aerial: 8, welder: 21 }, zeroHours: 487000 },
  { date: "2026-07-06", period: "2026-07", plant: "桃園", contractor: "中鼎工程", worksite: "儲槽區", equipment: 189, inspection: 102, maintenance: 21, contractorPeople: 236, contractorEntries: 52, hazard: { A: 14, B: 24, C: 35 }, permits: 161, machines: { crane: 8, aerial: 6, welder: 16 }, zeroHours: 463000 },
  { date: "2026-07-08", period: "2026-07", plant: "台中", contractor: "漢翔維修", worksite: "裝卸站", equipment: 145, inspection: 79, maintenance: 22, contractorPeople: 171, contractorEntries: 33, hazard: { A: 9, B: 23, C: 31 }, permits: 126, machines: { crane: 5, aerial: 5, welder: 13 }, zeroHours: 416000 },
  { date: "2026-07-11", period: "2026-07", plant: "嘉義", contractor: "聯興機電", worksite: "鍋爐區", equipment: 123, inspection: 72, maintenance: 16, contractorPeople: 151, contractorEntries: 27, hazard: { A: 6, B: 19, C: 24 }, permits: 108, machines: { crane: 4, aerial: 4, welder: 10 }, zeroHours: 351000 },
  { date: "2026-07-16", period: "2026-07", plant: "高雄大林", contractor: "大林營造", worksite: "管線廊道", equipment: 241, inspection: 137, maintenance: 41, contractorPeople: 348, contractorEntries: 68, hazard: { A: 23, B: 42, C: 49 }, permits: 228, machines: { crane: 13, aerial: 10, welder: 26 }, zeroHours: 537000 },
  { date: "2026-07-20", period: "2026-07", plant: "高雄林園", contractor: "南區環工", worksite: "廢水處理", equipment: 224, inspection: 121, maintenance: 37, contractorPeople: 296, contractorEntries: 58, hazard: { A: 19, B: 36, C: 43 }, permits: 205, machines: { crane: 11, aerial: 9, welder: 22 }, zeroHours: 512000 },
  { date: "2026-08-05", period: "2026-08", plant: "桃園", contractor: "中鼎工程", worksite: "加氫工場", equipment: 191, inspection: 108, maintenance: 20, contractorPeople: 244, contractorEntries: 49, hazard: { A: 13, B: 28, C: 34 }, permits: 168, machines: { crane: 7, aerial: 7, welder: 17 }, zeroHours: 488000 },
  { date: "2026-08-07", period: "2026-08", plant: "台中", contractor: "漢翔維修", worksite: "維修工場", equipment: 146, inspection: 81, maintenance: 18, contractorPeople: 182, contractorEntries: 35, hazard: { A: 7, B: 24, C: 29 }, permits: 131, machines: { crane: 6, aerial: 4, welder: 14 }, zeroHours: 441000 },
  { date: "2026-08-12", period: "2026-08", plant: "嘉義", contractor: "聯興機電", worksite: "空壓站", equipment: 124, inspection: 76, maintenance: 15, contractorPeople: 148, contractorEntries: 24, hazard: { A: 5, B: 17, C: 23 }, permits: 101, machines: { crane: 3, aerial: 3, welder: 9 }, zeroHours: 376000 },
  { date: "2026-08-17", period: "2026-08", plant: "高雄大林", contractor: "大林營造", worksite: "裂解二課", equipment: 244, inspection: 144, maintenance: 36, contractorPeople: 337, contractorEntries: 64, hazard: { A: 21, B: 40, C: 51 }, permits: 221, machines: { crane: 12, aerial: 11, welder: 25 }, zeroHours: 562000 },
  { date: "2026-08-22", period: "2026-08", plant: "高雄林園", contractor: "南區環工", worksite: "聚合二課", equipment: 226, inspection: 126, maintenance: 32, contractorPeople: 307, contractorEntries: 60, hazard: { A: 17, B: 35, C: 44 }, permits: 209, machines: { crane: 10, aerial: 9, welder: 23 }, zeroHours: 537000 }
];

const incidents = [
  { date: "2026-06-11 09:35", plant: "高雄大林", type: "夾捲傷害", casualties: "0 死 1 傷", loss: 180000, shutdown: 1, period: "2026-06" },
  { date: "2026-06-23 14:20", plant: "桃園", type: "墜落未遂", casualties: "0 死 1 傷", loss: 90000, shutdown: 0, period: "2026-06" },
  { date: "2026-07-08 10:15", plant: "高雄林園", type: "火災爆燃", casualties: "0 死 0 傷", loss: 260000, shutdown: 1, period: "2026-07" },
  { date: "2026-07-19 16:42", plant: "台中", type: "化學品洩漏", casualties: "0 死 1 傷", loss: 70000, shutdown: 0, period: "2026-07" },
  { date: "2026-08-05 08:25", plant: "嘉義", type: "感電未遂", casualties: "0 死 0 傷", loss: 130000, shutdown: 1, period: "2026-08" },
  { date: "2026-08-17 13:05", plant: "高雄大林", type: "起重吊掛碰撞", casualties: "0 死 1 傷", loss: 210000, shutdown: 2, period: "2026-08" }
];

const state = { metric: "equipment", grain: "month" };

const selectors = {
  startDate: document.getElementById("startDateFilter"),
  endDate: document.getElementById("endDateFilter"),
  plant: document.getElementById("plantFilter"),
  hazard: document.getElementById("hazardFilter"),
  contractor: document.getElementById("contractorFilter")
};

plants.forEach((plant) => {
  const option = document.createElement("option");
  option.value = plant;
  option.textContent = plant;
  selectors.plant.append(option);
});

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 }).format(value);
}

function inDateRange(dateText) {
  return dateText >= selectors.startDate.value && dateText <= selectors.endDate.value;
}

function filteredRecords() {
  const plant = selectors.plant.value;
  const hazard = selectors.hazard.value;
  const contractor = selectors.contractor.value.trim();

  return records.filter((record) => {
    const hazardPass = hazard === "all" || record.hazard[hazard] > 0;
    const contractorPass = !contractor || record.contractor.includes(contractor);
    return inDateRange(record.date)
      && (plant === "all" || record.plant === plant)
      && hazardPass
      && contractorPass;
  });
}

function filteredIncidents() {
  const plant = selectors.plant.value;
  return incidents.filter((incident) => {
    return inDateRange(incident.date.slice(0, 10))
      && (plant === "all" || incident.plant === plant);
  });
}

function sumMetric(data, metric) {
  if (metric === "contractors") return data.reduce((sum, row) => sum + row.contractorPeople, 0);
  if (metric === "hazard") return data.reduce((sum, row) => sum + row.hazard.A + row.hazard.B + row.hazard.C, 0);
  if (metric === "machines") return data.reduce((sum, row) => sum + row.machines.crane + row.machines.aerial + row.machines.welder, 0);
  if (metric === "incidents") return filteredIncidents().length;
  return data.reduce((sum, row) => sum + row[metric], 0);
}

function updateMetrics(data) {
  document.getElementById("metricEquipment").textContent = formatNumber(sumMetric(data, "equipment"));
  document.getElementById("metricInspection").textContent = formatNumber(sumMetric(data, "inspection"));
  document.getElementById("metricMaintenance").textContent = formatNumber(sumMetric(data, "maintenance"));
  document.getElementById("metricContractors").textContent = formatNumber(sumMetric(data, "contractors"));
  document.getElementById("metricHazard").textContent = formatNumber(sumMetric(data, "hazard"));
  document.getElementById("metricPermits").textContent = formatNumber(sumMetric(data, "permits"));
  document.getElementById("metricMachines").textContent = formatNumber(sumMetric(data, "machines"));
  document.getElementById("metricIncidents").textContent = formatNumber(sumMetric(data, "incidents"));
}

function trendBuckets(data) {
  const metric = state.metric;
  if (state.grain === "year") {
    return [{ label: "2026", value: sumMetric(data, metric) }];
  }
  if (state.grain === "week") {
    const weights = [0.22, 0.25, 0.27, 0.26];
    return weights.map((weight, index) => ({
      label: `第 ${index + 1} 週`,
      value: Math.round(sumMetric(data, metric) * weight)
    }));
  }
  return periods.map((period) => ({
    label: `${period.slice(5)} 月`,
    value: sumMetric(data.filter((row) => row.period === period), metric)
  }));
}

function drawTrend(data) {
  const canvas = document.getElementById("trendCanvas");
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = 320 * ratio;
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, rect.width, 320);

  const buckets = trendBuckets(data);
  const max = Math.max(...buckets.map((item) => item.value), 1);
  const padding = { top: 24, right: 24, bottom: 48, left: 64 };
  const chartW = rect.width - padding.left - padding.right;
  const chartH = 320 - padding.top - padding.bottom;

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
    ctx.fillText(formatNumber(Math.round(max * (1 - i / 4))), 8, y + 4);
  }

  const step = chartW / Math.max(buckets.length - 1, 1);
  const points = buckets.map((item, index) => ({
    x: buckets.length === 1 ? padding.left + chartW / 2 : padding.left + step * index,
    y: padding.top + chartH - (item.value / max) * chartH,
    ...item
  }));

  ctx.strokeStyle = state.metric === "incidents" ? "#ba2d2d" : "#047c7a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = state.metric === "incidents" ? "#ba2d2d" : "#047c7a";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#172026";
    ctx.fillText(formatNumber(point.value), point.x - 16, point.y - 12);
    ctx.fillStyle = "#65727c";
    ctx.fillText(point.label, point.x - 18, 296);
  });

  document.getElementById("trendSubtitle").textContent = metricLabels[state.metric];
}

function updateHazards(data) {
  const totals = data.reduce((sum, row) => {
    sum.A += row.hazard.A;
    sum.B += row.hazard.B;
    sum.C += row.hazard.C;
    return sum;
  }, { A: 0, B: 0, C: 0 });
  const max = Math.max(totals.A, totals.B, totals.C, 1);
  document.getElementById("hazardBars").innerHTML = ["A", "B", "C"].map((level) => `
    <div class="bar-row">
      <div class="bar-meta"><strong>${level} 級作業</strong><span>${formatNumber(totals[level])} 件</span></div>
      <div class="bar-track"><div class="bar-fill ${level.toLowerCase()}" style="width:${(totals[level] / max) * 100}%"></div></div>
    </div>
  `).join("");
}

function updateContractors(data) {
  const grouped = new Map();
  data.forEach((row) => {
    const current = grouped.get(row.contractor) || { people: 0, entries: 0, worksites: new Set() };
    current.people += row.contractorPeople;
    current.entries += row.contractorEntries;
    current.worksites.add(row.worksite);
    grouped.set(row.contractor, current);
  });

  const rows = [...grouped.entries()]
    .sort((a, b) => b[1].people - a[1].people)
    .slice(0, 5)
    .map(([name, item]) => `
      <div class="list-row">
        <div>
          <strong>${name}</strong>
          <div class="meta-text">${item.entries} 批次，${[...item.worksites].join("、")}</div>
        </div>
        <strong>${formatNumber(item.people)} 人</strong>
      </div>
    `);

  document.getElementById("contractorList").innerHTML = rows.join("") || "<p class=\"meta-text\">查無承攬商進場資料</p>";
}

function updateIncidents() {
  const rows = filteredIncidents().map((incident) => `
    <tr>
      <td>${incident.date}</td>
      <td>${incident.plant}</td>
      <td>${incident.type}</td>
      <td>${incident.casualties}</td>
      <td class="loss">${formatCurrency(incident.loss)}</td>
      <td>${incident.shutdown}</td>
    </tr>
  `);
  document.getElementById("incidentRows").innerHTML = rows.join("") || "<tr><td colspan=\"6\">查無事故資料</td></tr>";
}

function updateZeroHours(data) {
  const grouped = plants.map((plant) => {
    const value = data.filter((row) => row.plant === plant).reduce((sum, row) => sum + row.zeroHours, 0);
    return { plant, value };
  }).filter((row) => row.value > 0).sort((a, b) => b.value - a.value);

  document.getElementById("zeroHours").innerHTML = grouped.map((row) => `
    <div class="zero-row">
      <span>${row.plant}</span>
      <strong>${formatNumber(row.value)} 工時</strong>
    </div>
  `).join("") || "<p class=\"meta-text\">查無零災害工時資料</p>";
}

function render() {
  const data = filteredRecords();
  updateMetrics(data);
  drawTrend(data);
  updateHazards(data);
  updateContractors(data);
  updateIncidents();
  updateZeroHours(data);
}

document.querySelectorAll(".metric-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".metric-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    state.metric = card.dataset.metric;
    render();
  });
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.grain = button.dataset.grain;
    render();
  });
});

Object.values(selectors).forEach((input) => input.addEventListener("input", render));

document.getElementById("resetFilters").addEventListener("click", () => {
  selectors.startDate.value = "2026-06-01";
  selectors.endDate.value = "2026-08-31";
  selectors.plant.value = "all";
  selectors.hazard.value = "all";
  selectors.contractor.value = "";
  render();
});

document.getElementById("exportSummary").addEventListener("click", () => {
  const data = filteredRecords();
  const summary = [
    "職安衛儀表板查詢摘要",
    `期間：${selectors.startDate.value} 至 ${selectors.endDate.value}`,
    `工廠：${selectors.plant.value === "all" ? "全部廠區" : selectors.plant.value}`,
    `高危害作業：${selectors.hazard.value === "all" ? "全部等級" : `${selectors.hazard.value} 級作業`}`,
    `關鍵設備數：${formatNumber(sumMetric(data, "equipment"))}`,
    `高危害作業數：${formatNumber(sumMetric(data, "hazard"))}`,
    `工作許可證數：${formatNumber(sumMetric(data, "permits"))}`,
    `意外事故數：${formatNumber(sumMetric(data, "incidents"))}`
  ].join("\n");

  navigator.clipboard?.writeText(summary);
  alert(summary);
});

window.addEventListener("resize", render);
render();