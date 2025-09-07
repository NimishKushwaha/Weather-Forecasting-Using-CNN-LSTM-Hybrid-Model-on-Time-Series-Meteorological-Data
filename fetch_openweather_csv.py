import argparse
import os
import sys
from datetime import datetime

import httpx
import pandas as pd


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch 5-day/3h forecast from OpenWeather and save as CSV")
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--api_key", default=os.environ.get("OPENWEATHER_API_KEY"))
    parser.add_argument("--out", default="weather_hourly.csv")
    args = parser.parse_args()

    if not args.api_key:
        print("Missing OPENWEATHER_API_KEY", file=sys.stderr)
        sys.exit(1)

    url = (
        "https://api.openweathermap.org/data/2.5/forecast"
        f"?lat={args.lat}&lon={args.lon}&appid={args.api_key}&units=metric"
    )
    with httpx.Client(timeout=30) as client:
        r = client.get(url)
        r.raise_for_status()
        data = r.json()

    rows = []
    for item in data.get("list", []):
        ts = item.get("dt")
        main = item.get("main", {})
        wind = item.get("wind", {})
        weather = (item.get("weather") or [{}])[0]
        rows.append({
            "timestamp": datetime.utcfromtimestamp(ts).isoformat(sep=" "),
            "temp": main.get("temp"),
            "rh": main.get("humidity"),
            "wind": wind.get("speed"),
            "pressure": main.get("pressure"),
            "precip": item.get("rain", {}).get("3h", 0.0) or item.get("snow", {}).get("3h", 0.0) or 0.0,
            "cloud": weather.get("id"),
        })

    df = pd.DataFrame(rows)
    df.to_csv(args.out, index=False)
    print(f"Saved {len(df)} rows to {args.out}")


if __name__ == "__main__":
    main()


