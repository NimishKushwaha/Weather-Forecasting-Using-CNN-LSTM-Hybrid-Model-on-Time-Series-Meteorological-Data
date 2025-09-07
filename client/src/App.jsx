import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Chart } from 'chart.js/auto'

// Enhanced weather-themed SVG icons with better styling
const Svg = ({ children, size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)

const ThermometerIcon = () => (
  <Svg>
    <path d="M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
  </Svg>
)

const DropletIcon = () => (
  <Svg>
    <path d="M12 3c3 4 6 7 6 10a6 6 0 1 1-12 0c0-3 3-6 6-10Z"/>
    <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
  </Svg>
)

const WindIcon = () => (
  <Svg>
    <path d="M3 8h10a2 2 0 1 0-2-2"/>
    <path d="M3 12h14a2.5 2.5 0 1 0-2.5-2.5"/>
    <path d="M3 16h8a2 2 0 1 1-2 2"/>
  </Svg>
)

const GaugeIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="8"/>
    <path d="M12 12l4-3"/>
    <path d="M12 12l-4-3"/>
  </Svg>
)

const SunriseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v8"></path>
    <path d="m4.93 10.93 1.41 1.41"></path>
    <path d="M2 18h2"></path>
    <path d="M20 18h2"></path>
    <path d="m19.07 10.93-1.41 1.41"></path>
    <path d="M22 22H2"></path>
    <path d="m8 6 4-4 4 4"></path>
    <path d="M16 18a4 4 0 0 0-8 0"></path>
  </svg>
)

const SunsetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10V2"></path>
    <path d="m4.93 10.93 1.41 1.41"></path>
    <path d="M2 18h2"></path>
    <path d="M20 18h2"></path>
    <path d="m19.07 10.93-1.41 1.41"></path>
    <path d="M22 22H2"></path>
    <path d="m16 6-4 4-4-4"></path>
    <path d="M16 18a4 4 0 0 0-8 0"></path>
  </svg>
)

const EyeIcon = () => (
  <Svg>
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"/>
    <circle cx="12" cy="12" r="2.5"/>
  </Svg>
)

const CloudIcon = () => (
  <Svg>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/>
  </Svg>
)

const SunIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66-1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m4.93 19.07-1.41-1.41"/>
    <path d="m17.66 6.34-1.41-1.41"/>
  </Svg>
)

const RainIcon = () => (
  <Svg>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/>
    <path d="M8 14l3 3 3-3"/>
    <path d="M11 17l3 3 3-3"/>
  </Svg>
)

// Weather condition helper function
function getWeatherIcon(description) {
  const desc = description?.toLowerCase() || ''
  if (desc.includes('rain') || desc.includes('drizzle')) return <RainIcon />
  if (desc.includes('cloud') || desc.includes('overcast')) return <CloudIcon />
  if (desc.includes('clear') || desc.includes('sun')) return <SunIcon />
  return <CloudIcon />
}

function computeApiBase() {
  const env = import.meta.env.VITE_API_BASE
  if (env && typeof env === 'string') return env.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location && window.location.port === '5173') {
    return 'http://127.0.0.1:8000'
  }
  return ''
}

const API_BASE = computeApiBase()

function useWeather() {
  const [data, setData] = useState(null)

  async function fetchByCoords(lat, lon) {
    const res = await fetch(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}`)
    const json = await res.json()
    setData(json)
  }
  async function fetchByCity() {
    const res = await fetch(`${API_BASE}/api/weather`)
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude).catch(fetchByCity),
        () => fetchByCity()
      )
    } else {
      fetchByCity()
    }
  }, [])

  return data
}

function LineChart({ label, color, series, yMin = 0, yMax }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [ { label, data: [], borderColor: color, tension: .25, pointRadius: 0 } ] },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins:{ legend:{ labels:{ color:'#334155' } } },
        scales:{
          x:{ ticks:{ color:'#64748b' } },
          y:{ ticks:{ color:'#64748b' }, min: yMin, max: yMax }
        }
      }
    })
    return () => chartRef.current?.destroy()
  }, [])
  useEffect(() => {
    const ch = chartRef.current; if (!ch) return
    // Limit to last N points to prevent unbounded growth
    const N = 100
    const dataSeries = series.slice(-N)
    const len = dataSeries.length
    ch.data.labels = Array.from({ length: len }, (_, i) => i + 1)
    ch.data.datasets[0].data = dataSeries
    // Dynamic Y scaling for loss if yMax not provided
    if (yMax === undefined) {
      const maxVal = dataSeries.length ? Math.max(...dataSeries) : 1
      ch.options.scales.y.min = yMin
      ch.options.scales.y.max = undefined
      ch.options.scales.y.suggestedMax = Math.max(1, Math.ceil(maxVal * 1.2 * 10) / 10)
    }
    ch.update('none')
  }, [series])
  return (<div className='chart-wrap'><canvas ref={canvasRef} style={{ width:'100%', height:'100%' }} /></div>)
}

function App() {
  const weather = useWeather()
  const [status, setStatus] = useState('Idle')
  const [imageAcc, setImageAcc] = useState('-')
  const [tsMae, setTsMae] = useState('-')
  const [tsRmse, setTsRmse] = useState('-')
  const logsRef = useRef(null)
  const [accSeries, setAccSeries] = useState([])
  const [lossSeries, setLossSeries] = useState([])
  const sseRef = useRef(null)
  const [loadingTsMetrics, setLoadingTsMetrics] = useState(false)
  const [loadingDaily, setLoadingDaily] = useState(false)
  const [loadingImageAcc, setLoadingImageAcc] = useState(false)
  const [isImageTraining, setIsImageTraining] = useState(false)
  const [isTsTraining, setIsTsTraining] = useState(false)

  function appendLog(line) {
    const el = logsRef.current; if (!el) return
    el.textContent += line + '\n'
    el.scrollTop = el.scrollHeight
  }

  async function startSSE(path) {
    const url = `${API_BASE}${path}`
    try {
      // If starting TS training, auto-fetch CSV for current location and prepare TS windows
      if (path.includes('/api/train/timeseries')) {
        if (navigator.geolocation) {
          await new Promise((resolve) => navigator.geolocation.getCurrentPosition(resolve, resolve))
          navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
              await fetch(`${API_BASE}/api/ts/fetch?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`, { method: 'POST' })
              await fetch(`${API_BASE}/api/ts/prepare?csv_path=weather_hourly.csv`, { method: 'POST' })
            } catch {}
          })
        } else {
          try {
            await fetch(`${API_BASE}/api/ts/prepare?csv_path=weather_hourly.csv`, { method: 'POST' })
          } catch {}
        }
      }
      // Close previous stream if running
      if (sseRef.current) try { sseRef.current.close() } catch {}
      const es = new EventSource(url)
      sseRef.current = es
      setStatus('Training…')
      
      // Set appropriate training state based on path
      if (path.includes('/api/train/image')) {
        setIsImageTraining(true)
      } else if (path.includes('/api/train/timeseries')) {
        setIsTsTraining(true)
      }
      
      if (logsRef.current) logsRef.current.textContent = ''
      setAccSeries([])
      setLossSeries([])
      es.onmessage = (ev) => {
        if (ev.data === 'TRAINING_DONE') { 
          setStatus('Done'); 
          setIsImageTraining(false)
          setIsTsTraining(false)
          es.close(); 
          return 
        }
        if (ev.data.startsWith('metric')) {
          const parts = ev.data.split('\t')
          const name = parts[1]; const val = parseFloat(parts[2])
          if (name === 'acc') setAccSeries(prev => [...prev, val])
          if (name === 'loss') setLossSeries(prev => [...prev, val])
          return
        }
        appendLog(ev.data)
      }
      es.onerror = () => { 
        setStatus('Error'); 
        setIsImageTraining(false)
        setIsTsTraining(false)
        es.close() 
      }
    } catch (e) { 
      setStatus('Error'); 
      setIsImageTraining(false)
      setIsTsTraining(false)
    }
  }

  function stopTraining() {
    if (sseRef.current) {
      try { sseRef.current.close() } catch {}
      sseRef.current = null
    }
    setIsImageTraining(false)
    setIsTsTraining(false)
    setStatus('Stopped')
  }

  async function getImageAcc() {
    setLoadingImageAcc(true)
    const res = await fetch(`${API_BASE}/api/accuracy/image`)
    const data = await res.json()
    setImageAcc(data.accuracy != null ? Number(data.accuracy).toFixed(4) : 'N/A')
    setLoadingImageAcc(false)
  }
  async function getTsMetrics() {
    setLoadingDaily(true)
    setLoadingTsMetrics(true)
    // Kick off OWM daily first so skeleton shows immediately
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve) => navigator.geolocation.getCurrentPosition(resolve, resolve))
        if (pos && pos.coords) {
          fetch(`${API_BASE}/api/forecast/owm?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
            .then(r => r.json())
            .then(dj => { if (dj?.days?.length) setDaily(dj) })
            .catch(e => console.error('OWM daily error', e))
            .finally(() => setLoadingDaily(false))
        } else {
          setLoadingDaily(false)
        }
      } catch { setLoadingDaily(false) }
    } else {
      setLoadingDaily(false)
    }

    // In parallel fetch TS metrics and short-horizon prediction
    try {
      const [mRes, fRes] = await Promise.all([
        fetch(`${API_BASE}/api/accuracy/timeseries`).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/api/forecast/ts`).then(r => r.json()).catch(() => ({})),
      ])
      if (mRes) {
        setTsMae(mRes.mae != null ? Number(mRes.mae).toFixed(4) : 'N/A')
        setTsRmse(mRes.rmse != null ? Number(mRes.rmse).toFixed(4) : 'N/A')
      }
      if (fRes && Array.isArray(fRes.pred) && fRes.pred.length > 0) setForecast(fRes)
    } catch (e) {
      console.error('TS parallel fetch error', e)
    } finally {
      setLoadingTsMetrics(false)
    }
  }

  const city = weather?.name || 'Location'
  const desc = weather?.weather?.[0]?.description || weather?.error || '—'
  const temp = weather?.main?.temp != null ? `${Math.round(weather.main.temp)}°C` : '—'
  const tempMin = weather?.main?.temp_min != null ? `${Math.round(weather.main.temp_min)}°C` : '—'
  const tempMax = weather?.main?.temp_max != null ? `${Math.round(weather.main.temp_max)}°C` : '—'
  const hum = weather?.main?.humidity != null ? `${weather.main.humidity}%` : '—'
  const wind = weather?.wind?.speed != null ? `${weather.wind.speed} m/s` : '—'
  const pressure = weather?.main?.pressure != null ? `${weather.main.pressure} hPa` : '—'
  const visibility = weather?.visibility != null ? `${(weather.visibility/1000).toFixed(1)} km` : '—'
  const sunrise = weather?.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
  const sunset = weather?.sys?.sunset ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'

  const [forecast, setForecast] = useState(null)
  const [daily, setDaily] = useState(null)

  return (
    <div className='wrapper'>
      <div className='header-card card-enhanced'>
        <div className='weather-main-content'>
          <div className='weather-left-section'>
            <div className='location-info'>
              <div className='location-icon'>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className='location-details'>
                <div className='location-name'>{city}</div>
                <div className='weather-description'>{desc}</div>
              </div>
            </div>
            
            <div className='weather-metrics'>
              <div className='metric-item'>
                <div className='metric-icon'>
                  <ThermometerIcon />
                </div>
                <div className='metric-content'>
                  <div className='metric-label'>Temperature</div>
                  <div className='metric-value'>{temp}</div>
                </div>
              </div>
              
              <div className='metric-item'>
                <div className='metric-icon'>
                  <DropletIcon />
                </div>
                <div className='metric-content'>
                  <div className='metric-label'>Humidity</div>
                  <div className='metric-value'>{hum}</div>
                </div>
              </div>
              
              <div className='metric-item'>
                <div className='metric-icon'>
                  <WindIcon />
                </div>
                <div className='metric-content'>
                  <div className='metric-label'>Wind Speed</div>
                  <div className='metric-value'>{wind}</div>
                </div>
              </div>
              
              <div className='metric-item'>
                <div className='metric-icon'>
                  <GaugeIcon />
                </div>
                <div className='metric-content'>
                  <div className='metric-label'>Pressure</div>
                  <div className='metric-value'>{pressure}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className='weather-right-section'>
            <div className='main-temperature'>
              <div className='current-temp'>{temp}</div>
              <div className='feels-like'>Feels like {temp}</div>
            </div>
            
            <button className='refresh-button' onClick={() => window.location.reload()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className='main-grid'>
        <div className='left-col'>
          <div className='card card-enhanced'>
            <div className='section-title'>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M4.93 4.93l1.41 1.41"/>
                  <path d="M17.66 17.66l-1.41-1.41"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="M4.93 19.07l-1.41-1.41"/>
                  <path d="M17.66 6.34l-1.41-1.41"/>
                </svg>
                Current Weather Details
              </span>
            </div>
            <div className='details-grid'>
              <div className='detail-tile tile--big'>
                <div className='detail-muted'>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {getWeatherIcon(desc)}
                    Weather Conditions
                  </span>
                </div>
                <div className='detail-strong'>{temp}</div>
                <div className='detail-sub'>{desc}</div>
              </div>
              <div className='detail-tile detail-solid tile--med'>
                <div className='detail-muted'>
                  <SunriseIcon /> Sunrise
                </div>
                <div className='detail-strong'>{sunrise}</div>
              </div>
              <div className='detail-tile detail-solid tile--med'>
                <div className='detail-muted'>
                  <SunsetIcon /> Sunset
                </div>
                <div className='detail-strong'>{sunset}</div>
              </div>
              <div className='detail-tile tile--sm'>
                <div className='detail-muted'>Min Temp</div>
                <div className='detail-strong'>{tempMin}</div>
              </div>
              <div className='detail-tile tile--sm'>
                <div className='detail-muted'>Max Temp</div>
                <div className='detail-strong'>{tempMax}</div>
              </div>
              <div className='detail-tile tile--med'>
                <div className='detail-muted'>
                  <WindIcon /> Wind Speed
                </div>
                <div className='detail-strong'>{wind}</div>
                <div className='detail-sub'>Current</div>
              </div>
              <div className='detail-tile tile--med'>
                <div className='detail-muted'>
                  <EyeIcon /> Visibility
                </div>
                <div className='detail-strong'>{visibility}</div>
              </div>
            </div>
            <div className='stats-row'>
              <div className='stat'>
                <div className='label'>Humidity</div>
                <div className='value'>{hum}</div>
              </div>
              <div className='stat'>
                <div className='label'>Pressure</div>
                <div className='value'>{pressure}</div>
              </div>
              <div className='stat'>
                <div className='label'>Wind Gust</div>
                <div className='value'>5.76 m/s</div>
              </div>
              <div className='stat'>
                <div className='label'>Clouds</div>
                <div className='value'>98%</div>
              </div>
            </div>
          </div>
          {/* removed per-column chart */}
        </div>

        <div className='right-col'>
          <div className='sidebar card card-enhanced'>
            <div className='section-title'>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.59 4.51A9 9 0 0 1 12 4c4.97 0 9 4.03 9 9s-4.03 9-9 9c-4.97 0-9-4.03-9-9 0-1.97.63-3.79 1.7-5.28"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
                Weather Prediction
              </span>
            </div>
            <div className='section-title' style={{ fontWeight: 700, fontSize: 14, color: 'var(--cloud-gray)', marginTop: '16px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M4.93 4.93l1.41 1.41"/>
                  <path d="M17.66 17.66l-1.41-1.41"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="M4.93 19.07l-1.41-1.41"/>
                  <path d="M17.66 6.34l-1.41-1.41"/>
                </svg>
                Model Configuration
              </span>
            </div>
          <div className='form'>
            <label className='label'>Model Path</label>
            <input className='input' placeholder='forecast_model.keras' readOnly />
            <div className='row'>
              <div style={{ flex: 1 }}>
                <label className='label'>Sequence Length</label>
                <input className='input' placeholder='12' readOnly />
              </div>
              <div style={{ flex: 1 }}>
                <label className='label'>Batch Size</label>
                <input className='input' placeholder='4' readOnly />
              </div>
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div className='row'>
            {isImageTraining ? (
              <button className='primary' onClick={stopTraining}>Stop Training</button>
            ) : (
              <button className='primary' onClick={() => startSSE('/api/train/image')}>Start Model Training</button>
            )}
          </div>
          <div style={{ height: 12 }} />
          <div className='row'>
            <button className='ghost' onClick={getImageAcc} disabled={loadingImageAcc}>
              {loadingImageAcc ? (
                <span className='loading-spinner'></span>
              ) : (
                'Test Model'
              )}
            </button>
            <button className='ghost' onClick={getTsMetrics}>TS Metrics</button>
          </div>
          <div className='stats-row' style={{ gridTemplateColumns:'1fr 1fr' }}>
            <div className='stat'><div className='label'>Image Acc</div><div className='value'>{loadingImageAcc ? <span className='loading-spinner'></span> : imageAcc}</div></div>
            <div className='stat'><div className='label'>TS MAE</div><div className='value'>{loadingTsMetrics ? <span className='loading-spinner'></span> : tsMae}</div></div>
            <div className='stat'><div className='label'>TS RMSE</div><div className='value'>{loadingTsMetrics ? <span className='loading-spinner'></span> : tsRmse}</div></div>
            <div className='stat'><div className='label'>Status</div><div className='value'>{status}</div></div>
          </div>
          </div>
        </div>
      </div>
      <div className='card card-enhanced' style={{ margin: '12px 16px' }}>
        <div className='section-title'>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
            Training Metrics & Analytics
          </span>
        </div>
        <div className='charts-row'>
          <div className='chart-container'>
            <div className='chart-header'>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Model Accuracy
              </span>
            </div>
            <LineChart label='Accuracy' color='#2563eb' series={accSeries} yMin={0} yMax={1} />
          </div>
          <div className='chart-container'>
            <div className='chart-header'>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
                Training Loss
              </span>
            </div>
            <LineChart label='Loss' color='#f59e0b' series={lossSeries} yMin={0} />
          </div>
        </div>
        <div className='logs' ref={logsRef} />
      </div>
      {loadingDaily && (
        <div className='forecast-card card-enhanced' style={{ margin: '12px 16px' }}>
          <div className='forecast-header'>5-Day Forecast</div>
          <div className='forecast-list'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='forecast-row'>
                <div className='skeleton' style={{ height: 20 }} />
                <div className='skeleton' style={{ height: 20 }} />
                <div className='skeleton' style={{ height: 20 }} />
                <div className='skeleton' style={{ height: 20 }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {daily?.days?.length > 0 && (
        <div className='forecast-card card-enhanced' style={{ margin: '12px 16px' }}>
          <div className='forecast-header'>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.59 4.51A9 9 0 0 1 12 4c4.97 0 9 4.03 9 9s-4.03 9-9 9c-4.97 0-9-4.03-9-9 0-1.97.63-3.79 1.7-5.28"/>
                <path d="M12 8v4l3 3"/>
              </svg>
              5-Day Weather Forecast
            </span>
          </div>
          <div className='forecast-list'>
            {daily.days.map((d, idx) => (
              <div key={idx} className='forecast-row'>
                <div>
                  <div className='forecast-title'>{new Date(d.date).toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'})}</div>
                  <div className='forecast-sub'>Day {idx+1} of next 5</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div className='ico'><ThermometerIcon /></div>
                  <div>
                    <div className='forecast-title'>{Math.round(d.temp_max)}°C / {Math.round(d.temp_min)}°C</div>
                    <div className='forecast-sub'>Max / Min</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div className='ico'><DropletIcon /></div>
                  <div>
                    <div className='forecast-title'>{Math.round(d.humidity_avg)}%</div>
                    <div className='forecast-sub'>Avg Humidity</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div className='ico'><WindIcon /></div>
                  <div>
                    <div className='forecast-title'>{d.wind_avg.toFixed(1)} m/s</div>
                    <div className='forecast-sub'>Avg Wind</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

