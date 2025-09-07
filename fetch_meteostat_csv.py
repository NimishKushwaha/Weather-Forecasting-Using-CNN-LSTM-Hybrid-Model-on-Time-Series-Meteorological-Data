import argparse
from datetime import datetime
import pandas as pd

try:
    from meteostat import Hourly, Point
except ImportError as e:
    raise SystemExit("Please install meteostat first: pip install meteostat pandas") from e


def main() -> None:
    p = argparse.ArgumentParser(description="Fetch long-range hourly weather using Meteostat and save CSV")
    p.add_argument("--lat", type=float, required=True)
    p.add_argument("--lon", type=float, required=True)
    p.add_argument("--start", default="2023-01-01", help="YYYY-MM-DD")
    p.add_argument("--end", default="2023-12-31", help="YYYY-MM-DD")
    p.add_argument("--out", default="weather_hourly.csv")
    args = p.parse_args()

    loc = Point(args.lat, args.lon)
    start = datetime.fromisoformat(args.start)
    end = datetime.fromisoformat(args.end)

    df = Hourly(loc, start, end).fetch().reset_index()
    # Map to our expected schema
    df = df.rename(columns={
        'time': 'timestamp',
        'temp': 'temp',
        'rhum': 'rh',
        'wspd': 'wind',
        'pres': 'pressure',
        'prcp': 'precip',
        'coco': 'cloud',
    })
    cols = ['timestamp', 'temp', 'rh', 'wind', 'pressure', 'precip', 'cloud']
    df = df[cols].dropna()
    df.to_csv(args.out, index=False)
    print(f"Saved {len(df)} rows to {args.out}")


if __name__ == "__main__":
    main()


