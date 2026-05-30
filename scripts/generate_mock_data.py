import json
import math
import csv
from pathlib import Path


PLANTS = ["桃園", "台中", "嘉義", "高雄大林", "高雄林園"]
MONTHS = [
    "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11",
    "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05",
]

MODULES = [
    {"id": "permit", "name": "許可基本資料", "items": ["工作內容與地點完整", "作業分級正確", "核准工作時間明確", "回簽資料完整"]},
    {"id": "workType", "name": "作業分級與工作項目", "items": ["動火/非動火判定正確", "A/B/C級作業判定正確", "附加檢點表適用", "延時工作經核准"]},
    {"id": "contractor", "name": "承攬商與人員資格", "items": ["施工人員名冊完整", "工地負責人到場", "安衛人員到場", "特殊作業主管資格符合"]},
    {"id": "hazardNotice", "name": "危害告知", "items": ["承攬商已知悉注意事項", "施工人員完成危害告知", "勤前教育紀錄完整", "緊急聯絡資訊明確"]},
    {"id": "isolation", "name": "環境安全隔離", "items": ["設備管線已釋壓清洗", "進出口已關斷/盲封/掛牌", "電源隔離加鎖掛牌", "暗溝陰井已堵塞密封"]},
    {"id": "gas", "name": "氣體偵測", "items": ["可燃性氣體低於20%LEL", "氧氣濃度符合標準", "有害氣體低於容許濃度", "上下午或連續測定紀錄完整"]},
    {"id": "fireExplosion", "name": "消防與防爆設備", "items": ["20型滅火器配置足夠", "防爆電氣設備符合", "安全工具使用正確", "消防水帶或防火措施到位"]},
    {"id": "ppeHeight", "name": "PPE與高處防墜", "items": ["個人防護具穿戴正確", "安全帶/安全母索使用", "施工架檢點合格", "安全網或工作平台設置"]},
    {"id": "patrol", "name": "巡查會簽", "items": ["轄區檢點簽認", "監造巡查簽認", "安衛人員巡查紀錄", "異常已即時通知"]},
    {"id": "closeout", "name": "收工回簽與現場紀錄", "items": ["環境整理完成", "施工前後照片完整", "氣體偵測照片上傳", "改善事項結案佐證完整"]},
]

PLANT_PROFILE = {
    "桃園": {"permits": 92, "risk": 0.92},
    "台中": {"permits": 76, "risk": 0.86},
    "嘉義": {"permits": 64, "risk": 0.78},
    "高雄大林": {"permits": 128, "risk": 1.15},
    "高雄林園": {"permits": 116, "risk": 1.08},
}

MODULE_RISK = {
    "permit": 0.55,
    "workType": 0.72,
    "contractor": 0.9,
    "hazardNotice": 0.65,
    "isolation": 1.18,
    "gas": 1.25,
    "fireExplosion": 1.28,
    "ppeHeight": 1.2,
    "patrol": 0.8,
    "closeout": 0.95,
}


def seeded_noise(seed: int) -> float:
    value = math.sin(seed * 999) * 10000
    return value - math.floor(value)


def build_records() -> list[dict]:
    records = []
    for plant_index, plant in enumerate(PLANTS):
        for month_index, month in enumerate(MONTHS):
            seasonal = 1 + 0.08 * math.sin((month_index + 1) / 12 * math.pi * 2)
            permit_count = round(PLANT_PROFILE[plant]["permits"] * seasonal + seeded_noise(plant_index * 31 + month_index) * 12)
            for module_index, module in enumerate(MODULES):
                for item_index, item in enumerate(module["items"]):
                    seed = (plant_index + 1) * 1000 + (month_index + 1) * 100 + module_index * 10 + item_index
                    sample_ratio = 0.82 + seeded_noise(seed) * 0.2
                    checks = max(8, round(permit_count * sample_ratio))
                    base_defect_rate = 0.012 + 0.028 * PLANT_PROFILE[plant]["risk"] * MODULE_RISK[module["id"]]
                    item_factor = 0.85 + seeded_noise(seed + 7) * 0.45
                    defects = min(checks, round(checks * base_defect_rate * item_factor))
                    critical_base = 0.22 if module["id"] in {"gas", "fireExplosion", "isolation", "ppeHeight"} else 0.08
                    critical = min(defects, round(defects * (critical_base + seeded_noise(seed + 13) * 0.12)))
                    open_count = min(defects, round(defects * (0.22 + seeded_noise(seed + 19) * 0.28)))
                    overdue = min(open_count, round(open_count * (0.18 + seeded_noise(seed + 23) * 0.22)))
                    pass_count = checks - defects
                    pass_rate = pass_count / checks
                    risk_score = defects * 2 + critical * 8 + open_count * 3 + overdue * 5
                    risk_level = "高" if risk_score >= 42 else "中" if risk_score >= 18 else "低"
                    records.append({
                        "month": month,
                        "plant": plant,
                        "moduleId": module["id"],
                        "moduleName": module["name"],
                        "item": item,
                        "permits": permit_count,
                        "checks": checks,
                        "pass": pass_count,
                        "defects": defects,
                        "critical": critical,
                        "open": open_count,
                        "overdue": overdue,
                        "passRate": round(pass_rate, 4),
                        "riskScore": risk_score,
                        "riskLevel": risk_level,
                    })
    return records


def main() -> None:
    json_out = Path("data/work-permit-core-checks.json")
    csv_out = Path("data/work-permit-core-checks.csv")
    json_out.parent.mkdir(exist_ok=True)
    records = build_records()
    payload = {
        "generatedAt": "2026-05-30",
        "period": {"start": MONTHS[0], "end": MONTHS[-1]},
        "plants": PLANTS,
        "months": MONTHS,
        "modules": MODULES,
        "records": records,
    }
    json_out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    fieldnames = [
        "month",
        "plant",
        "module_id",
        "module_name",
        "check_item",
        "permit_count",
        "check_count",
        "pass_count",
        "defect_count",
        "critical_defect_count",
        "open_defect_count",
        "overdue_defect_count",
        "pass_rate",
        "risk_score",
        "risk_level",
    ]
    with csv_out.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for record in records:
            writer.writerow({
                "month": record["month"],
                "plant": record["plant"],
                "module_id": record["moduleId"],
                "module_name": record["moduleName"],
                "check_item": record["item"],
                "permit_count": record["permits"],
                "check_count": record["checks"],
                "pass_count": record["pass"],
                "defect_count": record["defects"],
                "critical_defect_count": record["critical"],
                "open_defect_count": record["open"],
                "overdue_defect_count": record["overdue"],
                "pass_rate": record["passRate"],
                "risk_score": record["riskScore"],
                "risk_level": record["riskLevel"],
            })

    print(f"Wrote {json_out} and {csv_out} with {len(records)} rows")


if __name__ == "__main__":
    main()
