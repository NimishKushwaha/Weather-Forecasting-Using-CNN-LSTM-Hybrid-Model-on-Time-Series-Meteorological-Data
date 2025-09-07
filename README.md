# Weather Forecasting and Detection (Images + Time Series)

This project contains two ML pipelines and a full-stack dashboard:
- Image classifier (CNN) for 5 weather classes using photos
- Time-series forecaster (CNN–LSTM) for temperature forecasting (hourly), with 5-day prediction view
- FastAPI backend + React (Vite) frontend with a modern UI

## Quick Start

Prereqs:
- Python 3.9+; Node 18+
- Set your OpenWeather API key once (new terminal after):
  - Windows PowerShell:
    ```powershell
    setx OPENWEATHER_API_KEY "YOUR_KEY"
    ```

### 1) Backend (FastAPI)
From project root:
```powershell
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn httpx tensorflow pandas scikit-learn
uvicorn server.app:app --reload
```
The server runs at http://127.0.0.1:8000.

### 2) Frontend (Vite React)
```powershell
cd client
npm install
npm run dev
```
Open the URL shown (usually http://localhost:5173). The UI talks to the backend. Weather bar at top uses your live location (allow geolocation).

## Image Classifier Pipeline

Data preparation and training scripts are available both as notebooks and .py scripts.

Steps (CLI path):
```powershell
# Prepare image matrices from cropped sky regions
python Preparing_data.py

# Train image CNN
python Training.py

# Test accuracy
python Testing.py
```
Artifacts:
- `trainedModelE10.h5` – trained Keras model
- `Accuracy.png`, `Loss.png` – curves

In the dashboard:
- Start training: “Start Image Model Training”
- Get accuracy: “Get Image Accuracy”

## Time-Series Forecasting Pipeline (CNN–LSTM)

There are helper scripts and endpoints to fetch data, prepare windows, train, evaluate, and predict.

### Option A: Fully from the UI
1. Click “Start TS Training”. The app will:
   - Fetch 5-day/3h forecast CSV from OpenWeather for your current location
   - Build sliding windows to `TS_npy/`
   - Train the CNN–LSTM model and stream logs/metrics in real-time
2. Click “TS Metrics” to see MAE/RMSE and render the next-horizon forecast list below the logs.

### Option B: CLI (manual)
```powershell
# 1) Fetch 5-day/3h forecast for your location (requires OPENWEATHER_API_KEY)
python fetch_openweather_csv.py --lat 13.260435 --lon 80.026837 --out weather_hourly.csv

# 2) Build windows and save to TS_npy/
python time_series_preparing.py --csv weather_hourly.csv --datetime_col timestamp --features temp rh wind pressure precip cloud --target temp --window 48 --horizon 1 --out_dir TS_npy

# 3) Train the model
python train_forecast.py --data_dir TS_npy --epochs 50 --batch_size 64 --model_out forecast_model.keras

# 4) Evaluate and (optionally) plot
python test_forecast.py --data_dir TS_npy --model forecast_model.keras --plot

# 5) Produce next-step predictions for frontend
python predict_forecast.py --data_dir TS_npy --model forecast_model.keras
```

Endpoints (if testing via HTTP):
- `POST /api/ts/fetch?lat=..&lon=..` – build `weather_hourly.csv`
- `POST /api/ts/prepare` – build `TS_npy/` using defaults
- `GET /api/train/timeseries` – starts training (SSE stream)
- `GET /api/accuracy/timeseries` – returns MAE and RMSE
- `GET /api/forecast/ts` – returns JSON with predicted horizon

## UI Overview
- Live current weather (OpenWeather), with SVG icons
- Buttons to start training (image + time-series) with real-time logs (SSE)
- Two charts (Accuracy, Loss) show training curves in real-time
- Image accuracy and TS metrics available on demand
- Time-series 5-day style list (40 x 3h) displayed under the console

## Notes & Tips
- If PowerShell errors on curl `-X`, use:
  - `Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/ts/fetch?lat=..&lon=.."`
  - or `curl.exe -X POST ...`
- If the image pipeline expects `Data/0..4`, place images in those subfolders or adjust scripts.
- For Matplotlib, GUI popups are disabled in `Training.py`.

## Production Hosting

Below is a minimal, production-oriented setup for hosting the backend API and serving the built frontend.

### 1) Environment
- Ensure Node 18+ and Python 3.9+ are installed on the server/host.
- Set the OpenWeather key (.env or system-wide):
  - Windows PowerShell:
    ```powershell
    setx OPENWEATHER_API_KEY "YOUR_KEY"
    ```

### 2) Backend (FastAPI with Uvicorn)
From the project root:
```powershell
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn httpx tensorflow pandas scikit-learn

# Start without auto-reload and bind to all interfaces
uvicorn server.app:app --host 0.0.0.0 --port 8000 --workers 2
```
The API will be available at `http://YOUR_SERVER_IP:8000`.

### 3) Frontend (Production Build)
```powershell
cd client
npm ci
npm run build

# Option A: Temporary preview server
npm run preview -- --host --port 5173

# Option B: Any static file server (example)
npx serve -s dist -l 5173
```
Serve `client/dist` behind your reverse proxy or static hosting of choice.

### 4) Optional: Reverse Proxy (example Nginx)
- Proxy `/api/` to `http://127.0.0.1:8000`
- Serve `/` from the `client/dist` directory

### 5) Health Checks
- `GET /docs` (FastAPI Swagger) at `http://YOUR_SERVER_IP:8000/docs`
- Open the frontend in a browser and verify it can reach the API

### Common Commands (quick copy)
```powershell
uvicorn server.app:app --reload 
cd client; npm run dev

python fetch_meteostat_csv.py --lat 13.260435 --lon 80.026837 --start 2024-01-01 --end 2024-12-31 --out weather_hourly.csv  

python time_series_preparing.py --csv weather_hourly.csv --datetime_col timestamp --features temp rh wind pressure precip cloud --target temp --window 48 --horizon 1 --out_dir TS_npy

python train_forecast.py --data_dir TS_npy --epochs 50 --batch_size 64 --model_out forecast_model.keras
```

## Credits
- Original image dataset reference: IEEE DataPort FWID (Five-class Weather Image Dataset)
- Frontend built with Vite + React; Backend with FastAPI + Uvicorn; Models with TensorFlow/Keras

