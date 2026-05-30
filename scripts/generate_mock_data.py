import csv
import json
import math
from pathlib import Path


PLANTS = ["桃園", "台中", "嘉義", "高雄大林", "高雄林園"]
MONTHS = [f"{year}-{month:02d}" for year in (2024, 2025, 2026) for month in range(1, 13)]
HAZARD_LEVELS = [
    {"id": "A", "name": "A級", "label": "高危害", "weight": 1.35},
    {"id": "B", "name": "B級", "label": "中危害", "weight": 1.0},
    {"id": "C", "name": "C級", "label": "低危害", "weight": 0.72},
]

CONTROL_ITEMS = [
    {"indicator": "廠區", "item": "基本資料", "content": "工廠、日期、時間"},
    {"indicator": "許可證", "item": "許可資訊", "content": "工程作業分級、申請時間、核准工作時間、工作許可證編號"},
    {"indicator": "施工地點", "item": "場地關係人", "content": "施工部門、轄區部門、監造部門"},
    {"indicator": "包商", "item": "承攬商與人員資格", "content": "承攬商、工作人數、車輛車號、工地負責人、安衛人員、特殊作業主管"},
    {"indicator": "危害等級", "item": "作業等級", "content": "施工地點、工程案號、工作內容、許可工作項目、作業分級"},
    {"indicator": "危害等級", "item": "管線設備危害物", "content": "可燃性氣體、易燃液體、有害性氣體、化學藥劑、酸鹼、熱水蒸氣、空氣、其他"},
    {"indicator": "檢點與危害告知", "item": "簽發前安全檢點", "content": "是否安全檢點"},
    {"indicator": "檢點與危害告知", "item": "危害告知", "content": "是否危害告知"},
    {"indicator": "危害排除與隔離", "item": "環境危害排除", "content": "是否設備管線危害物排除"},
    {"indicator": "危害排除與隔離", "item": "隔離管制", "content": "設備管線是否加盲加鎖掛牌"},
    {"indicator": "環境測定", "item": "氣體偵測數值", "content": "可燃性氣體%、氧氣%、一氧化碳PPM、硫化氫PPM"},
    {"indicator": "環境測定", "item": "測定基準", "content": "可燃性氣體 < 20%LEL；氧氣>= 18%；一氧化碳<50 PPM；硫化氫<10 PPM"},
    {"indicator": "環境測定", "item": "測定頻率", "content": "上、下午施工前測定；A級或高風險作業需重複或連續測定；每小時/每兩小時紀錄表"},
    {"indicator": "防火防爆", "item": "消防設備", "content": "是否有消防設備"},
    {"indicator": "防火防爆", "item": "防爆安全工具", "content": "是否使用防爆電氣設備及安全工具"},
    {"indicator": "高處作業", "item": "防墜措施", "content": "設標準施工架、安全網、安全母索、安全帶"},
    {"indicator": "安全保護", "item": "個人防護具", "content": "是否有防護口罩、防毒面具、SCBA、防護手套、安全眼鏡、耳塞"},
    {"indicator": "警戒巡查", "item": "警戒標示", "content": "是否有警戒標示"},
    {"indicator": "警戒巡查", "item": "巡查會簽", "content": "是否轄區、監造、安衛人員或工地負責人巡查會簽"},
    {"indicator": "收工回簽", "item": "回簽收工確認", "content": "是否回簽時確認環境已整理並完成防護措施"},
    {"indicator": "收工回簽", "item": "一般安全規定", "content": "是否遵守工安規定"},
    {"indicator": "收工回簽", "item": "現場紀錄", "content": "是否拍照"},
]

PLANT_PROFILE = {
    "桃園": {"permits": 96, "risk": 0.92},
    "台中": {"permits": 82, "risk": 0.88},
    "嘉義": {"permits": 68, "risk": 0.8},
    "高雄大林": {"permits": 142, "risk": 1.16},
    "高雄林園": {"permits": 128, "risk": 1.08},
}

INDICATOR_RISK = {
    "廠區": 0.45,
    "許可證": 0.6,
    "施工地點": 0.62,
    "包商": 0.9,
    "危害等級": 0.98,
    "檢點與危害告知": 0.78,
    "危害排除與隔離": 1.22,
    "環境測定": 1.3,
    "防火防爆": 1.26,
    "高處作業": 1.18,
    "安全保護": 0.92,
    "警戒巡查": 0.86,
    "收工回簽": 0.74,
}


def seeded_noise(seed: int) -> float:
    value = math.sin(seed * 971.13) * 10000
    return value - math.floor(value)


def month_index(month: str) -> int:
    year, mon = month.split("-")
    return (int(year) - 2024) * 12 + int(mon) - 1


def monthly_permit_count(plant: str, month: str, hazard: dict, plant_index: int) -> int:
    idx = month_index(month)
    seasonal = 1 + 0.1 * math.sin((idx % 12 + 1) / 12 * math.pi * 2)
    base = PLANT_PROFILE[plant]["permits"] * seasonal
    hazard_share = {"A": 0.2, "B": 0.46, "C": 0.34}[hazard["id"]]
    trend = 1 + 0.018 * (idx // 12)
    noise = seeded_noise(plant_index * 97 + idx * 11 + ord(hazard["id"])) * 8
    return max(8, round(base * hazard_share * trend + noise))


def build_control_records() -> list[dict]:
    records = []
    for plant_index, plant in enumerate(PLANTS):
        for month in MONTHS:
            idx = month_index(month)
            for hazard in HAZARD_LEVELS:
                permit_count = monthly_permit_count(plant, month, hazard, plant_index)
                for item_index, item in enumerate(CONTROL_ITEMS):
                    seed = (plant_index + 1) * 10000 + idx * 100 + item_index * 7 + ord(hazard["id"])
                    check_count = round(permit_count * (0.82 + seeded_noise(seed) * 0.18))
                    defect_rate = 0.008 + 0.024 * PLANT_PROFILE[plant]["risk"] * hazard["weight"] * INDICATOR_RISK[item["indicator"]]
                    if item["indicator"] in {"環境測定", "危害排除與隔離", "防火防爆"} and hazard["id"] == "A":
                        defect_rate += 0.01
                    defect_count = min(check_count, round(check_count * defect_rate * (0.82 + seeded_noise(seed + 3) * 0.5)))
                    critical_ratio = 0.25 if item["indicator"] in {"環境測定", "危害排除與隔離", "防火防爆", "高處作業"} else 0.08
                    critical_count = min(defect_count, round(defect_count * (critical_ratio + seeded_noise(seed + 5) * 0.12)))
                    open_count = min(defect_count, round(defect_count * (0.2 + seeded_noise(seed + 9) * 0.32)))
                    overdue_count = min(open_count, round(open_count * (0.16 + seeded_noise(seed + 13) * 0.28)))
                    pass_count = check_count - defect_count
                    risk_score = defect_count * 2 + critical_count * 9 + open_count * 3 + overdue_count * 5
                    risk_level = "高" if risk_score >= 36 else "中" if risk_score >= 14 else "低"
                    records.append({
                        "month": month,
                        "plant": plant,
                        "hazard_level": hazard["id"],
                        "hazard_name": hazard["name"],
                        "hazard_label": hazard["label"],
                        "indicator": item["indicator"],
                        "control_item": item["item"],
                        "content": item["content"],
                        "permit_count": permit_count,
                        "check_count": check_count,
                        "pass_count": pass_count,
                        "defect_count": defect_count,
                        "critical_defect_count": critical_count,
                        "open_defect_count": open_count,
                        "overdue_defect_count": overdue_count,
                        "pass_rate": round(pass_count / check_count, 4),
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                    })
    return records


def build_measurements() -> list[dict]:
    measurements = []
    for plant_index, plant in enumerate(PLANTS):
        for month in MONTHS:
            idx = month_index(month)
            for hazard in HAZARD_LEVELS:
                permits = monthly_permit_count(plant, month, hazard, plant_index)
                seed = (plant_index + 1) * 20000 + idx * 131 + ord(hazard["id"])
                combustible_max = 2.0 + 8.5 * PLANT_PROFILE[plant]["risk"] * hazard["weight"] + seeded_noise(seed) * 8
                oxygen_min = 20.8 - 1.25 * hazard["weight"] * seeded_noise(seed + 2)
                co_max = 4 + 22 * PLANT_PROFILE[plant]["risk"] * hazard["weight"] * seeded_noise(seed + 4)
                h2s_max = 0.4 + 5.3 * PLANT_PROFILE[plant]["risk"] * hazard["weight"] * seeded_noise(seed + 6)

                # 合理地製造少量不合格情境，供儀表板警示使用。
                if hazard["id"] == "A" and plant in {"高雄大林", "高雄林園"} and idx % 7 == plant_index % 7:
                    combustible_max += 8.5
                if hazard["id"] == "A" and idx % 11 == plant_index % 11:
                    oxygen_min -= 2.2
                if hazard["id"] in {"A", "B"} and idx % 13 == plant_index % 13:
                    co_max += 35
                if hazard["id"] == "A" and idx % 9 == plant_index % 9:
                    h2s_max += 7

                combustible_max = round(combustible_max, 1)
                oxygen_min = round(oxygen_min, 1)
                co_max = round(co_max, 1)
                h2s_max = round(h2s_max, 1)
                combustible_ok = combustible_max < 20
                oxygen_ok = oxygen_min >= 18
                co_ok = co_max < 50
                h2s_ok = h2s_max < 10
                measurements.append({
                    "month": month,
                    "plant": plant,
                    "hazard_level": hazard["id"],
                    "hazard_name": hazard["name"],
                    "hazard_label": hazard["label"],
                    "measurement_count": max(permits * (4 if hazard["id"] == "A" else 2), permits),
                    "combustible_gas_max_pct_lel": combustible_max,
                    "oxygen_min_pct": oxygen_min,
                    "co_max_ppm": co_max,
                    "h2s_max_ppm": h2s_max,
                    "combustible_ok": combustible_ok,
                    "oxygen_ok": oxygen_ok,
                    "co_ok": co_ok,
                    "h2s_ok": h2s_ok,
                    "standard_ok": combustible_ok and oxygen_ok and co_ok and h2s_ok,
                    "alert_count": sum(not item for item in [combustible_ok, oxygen_ok, co_ok, h2s_ok]),
                })
    return measurements


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    out_dir = Path("data")
    out_dir.mkdir(exist_ok=True)
    control_records = build_control_records()
    measurements = build_measurements()
    payload = {
        "generatedAt": "2026-05-30",
        "source": "工作許可管制項目.docx",
        "period": {"start": MONTHS[0], "end": MONTHS[-1]},
        "plants": PLANTS,
        "months": MONTHS,
        "hazardLevels": HAZARD_LEVELS,
        "controlItems": CONTROL_ITEMS,
        "controlRecords": control_records,
        "environmentMeasurements": measurements,
        "standards": {
            "combustibleGasPctLEL": "<20",
            "oxygenPct": ">=18",
            "carbonMonoxidePpm": "<50",
            "hydrogenSulfidePpm": "<10",
        },
    }
    (out_dir / "work-permit-control-dashboard.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_csv(
        out_dir / "work-permit-control-checks.csv",
        control_records,
        [
            "month", "plant", "hazard_level", "hazard_name", "hazard_label",
            "indicator", "control_item", "content", "permit_count", "check_count",
            "pass_count", "defect_count", "critical_defect_count", "open_defect_count",
            "overdue_defect_count", "pass_rate", "risk_score", "risk_level",
        ],
    )
    write_csv(
        out_dir / "work-permit-environment-measurements.csv",
        measurements,
        [
            "month", "plant", "hazard_level", "hazard_name", "hazard_label",
            "measurement_count", "combustible_gas_max_pct_lel", "oxygen_min_pct",
            "co_max_ppm", "h2s_max_ppm", "combustible_ok", "oxygen_ok",
            "co_ok", "h2s_ok", "standard_ok", "alert_count",
        ],
    )
    print(f"Wrote {len(control_records)} control rows and {len(measurements)} measurement rows")


if __name__ == "__main__":
    main()
