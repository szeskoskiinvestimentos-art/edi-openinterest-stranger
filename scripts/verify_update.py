import re
import json
from pathlib import Path

JS_PATTERN = re.compile(r"(?:^//.*\n)*window\.marketData\s*=\s*", re.MULTILINE)

for target in ["WIN", "WDO"]:
    js_path = Path(f"dashboard_unificado/{target}/assets/data/market_data.js")
    raw = js_path.read_text(encoding="utf-8")
    m = JS_PATTERN.match(raw)
    if m:
        json_str = raw[m.end():].rstrip().rstrip(";").strip()
        data = json.loads(json_str)
        print(f"{target}:")
        print(f"  last_updated: {data.get('last_updated')}")
        print(f"  spot_price: {data.get('spot_price')}")
        overview = data.get("overview", {})
        print(f"  overview.spot_price: {overview.get('spot_price')}")
        print(f"  overview.last_update: {overview.get('last_update')}")
        print()
