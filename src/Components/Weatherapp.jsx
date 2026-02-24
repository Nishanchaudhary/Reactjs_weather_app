import React, { useState, useEffect } from 'react'

function WeatherApp() {
  const [city, setCity] = useState('Dipayal')
  const [searchInput, setSearchInput] = useState('')
  const [unit, setUnit] = useState('celsius')
  const [activeTab, setActiveTab] = useState('today')
  const [weatherData, setWeatherData] = useState(null)
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // API Key - Replace with your actual OpenWeatherMap API key
  const API_KEY = '0cf7889ff494aaa5a23d6d547c40caef' // Get from https://openweathermap.org/api

  // Fetch weather data from API
  const fetchWeatherData = async (cityName) => {
    setLoading(true)
    setError(null)
    try {
      // Current weather API
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      )
      
      // Forecast API
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      )

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('City not found. Please check the city name.')
      }

      const currentData = await currentResponse.json()
      const forecastData = await forecastResponse.json()

      setWeatherData(currentData)
      setForecastData(forecastData)
      setCity(cityName)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching weather data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load default city on component mount
  useEffect(() => {
    fetchWeatherData('Dipayal')
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      fetchWeatherData(searchInput)
      setSearchInput('')
      setMobileMenuOpen(false)
    }
  }

  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')
  }

  // Helper function to convert temperature
  const convertTemp = (celsius) => {
    if (unit === 'celsius') return Math.round(celsius)
    return Math.round((celsius * 9/5) + 32)
  }

  // Helper function to get weather icon
  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️',
    }
    return iconMap[iconCode] || '☀️'
  }

  // Helper function to format time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Helper function to format date
  const formatDay = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      weekday: 'short' 
    })
  }

  // Process hourly data from forecast
  const getHourlyData = () => {
    if (!forecastData) return []
    return forecastData.list.slice(0, 8).map(item => ({
      time: formatTime(item.dt),
      temp: item.main.temp,
      icon: getWeatherIcon(item.weather[0].icon),
      condition: item.weather[0].description,
    }))
  }

  // Process daily data from forecast
  const getDailyData = () => {
    if (!forecastData) return []
    const dailyMap = new Map()
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          day: formatDay(item.dt),
          temp: item.main.temp,
          icon: getWeatherIcon(item.weather[0].icon),
          condition: item.weather[0].description,
          min: item.main.temp_min,
          max: item.main.temp_max,
        })
      } else {
        const existing = dailyMap.get(date)
        existing.min = Math.min(existing.min, item.main.temp_min)
        existing.max = Math.max(existing.max, item.main.temp_max)
      }
    })
    
    return Array.from(dailyMap.values()).slice(0, 7)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-spin">🌤️</div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Fetching Weather Data...</h2>
          <p className="text-sm sm:text-base text-white/70">Please wait while we get the latest weather info</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md w-full">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Error Loading Weather Data</h2>
          <p className="text-sm sm:text-base text-white/70 mb-6">{error || 'Something went wrong'}</p>
          <button 
            onClick={() => fetchWeatherData('Dipayal')}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const hourlyData = getHourlyData()
  const dailyData = getDailyData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-x-hidden">
      {/* Animated Background Elements - Hidden on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Mobile Header */}
        <div className="sm:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-3xl animate-float">🌤️</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              WeatherWise
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white/10 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden backdrop-blur-xl bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search city..."
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-sm font-semibold"
                >
                  Search
                </button>
              </div>
            </form>
            <button
              onClick={toggleUnit}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <span>{unit === 'celsius' ? '🌡️' : '🌡️'}</span>
              {unit === 'celsius' ? 'Switch to °Fahrenheit' : 'Switch to °Celsius'}
            </button>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden sm:block backdrop-blur-xl bg-white/10 rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo with Animation */}
            <div className="flex items-center gap-3">
              <div className="text-5xl animate-float">🌤️</div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  WeatherWise
                </h1>
                <p className="text-xs lg:text-sm text-white/60">Real-time Weather Updates</p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
              <div className="relative group">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for a city..."
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50 transition-all group-hover:bg-white/20 text-sm lg:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg text-sm lg:text-base"
                >
                  🔍 Search
                </button>
              </div>
            </form>

            {/* Unit Toggle */}
            <button
              onClick={toggleUnit}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm lg:text-base"
            >
              <span className="text-xl">{unit === 'celsius' ? '🌡️' : '🌡️'}</span>
              {unit === 'celsius' ? '°Celsius' : '°Fahrenheit'}
            </button>
          </div>
        </div>

        {/* Main Weather Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8 border border-white/20 shadow-2xl transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-500">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Location Info */}
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="text-2xl sm:text-3xl animate-pulse">📍</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold truncate max-w-[250px] sm:max-w-[400px]">
                  {weatherData.name}
                </h2>
              </div>
              <p className="text-base sm:text-xl text-white/70 mb-2">{weatherData.sys.country}</p>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white/50 text-xs sm:text-sm">
                <span>🕒</span>
                <p>{new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Weather Icon */}
            <div className="relative order-first lg:order-none">
              <div className="text-7xl sm:text-8xl lg:text-9xl animate-float">
                {getWeatherIcon(weatherData.weather[0].icon)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold animate-pulse shadow-lg">
                LIVE
              </div>
            </div>

            {/* Temperature */}
            <div className="text-center w-full lg:w-auto">
              <div className="text-5xl sm:text-6xl lg:text-8xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                {convertTemp(weatherData.main.temp)}°
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/80 mt-2 capitalize">
                {weatherData.weather[0].description}
              </p>
              <p className="text-sm sm:text-base text-white/50 mt-2">
                Feels like {convertTemp(weatherData.main.feels_like)}°
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="text-xl sm:text-3xl mb-1 sm:mb-2">💧</div>
              <div className="text-xs sm:text-sm text-white/50">Humidity</div>
              <div className="text-base sm:text-xl font-semibold">{weatherData.main.humidity}%</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="text-xl sm:text-3xl mb-1 sm:mb-2">🌬️</div>
              <div className="text-xs sm:text-sm text-white/50">Wind</div>
              <div className="text-base sm:text-xl font-semibold">
                {unit === 'celsius' 
                  ? `${Math.round(weatherData.wind.speed * 3.6)} km/h`
                  : `${Math.round(weatherData.wind.speed * 2.237)} mph`
                }
              </div>
              <div className="text-xs text-white/30 mt-1">{getWindDirection(weatherData.wind.deg)}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="text-xl sm:text-3xl mb-1 sm:mb-2">☀️</div>
              <div className="text-xs sm:text-sm text-white/50">UV Index</div>
              <div className="text-base sm:text-xl font-semibold">{Math.round(weatherData.main.temp / 10)}</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center hover:bg-white/10 transition-all transform hover:scale-105">
              <div className="text-xl sm:text-3xl mb-1 sm:mb-2">📊</div>
              <div className="text-xs sm:text-sm text-white/50">Pressure</div>
              <div className="text-base sm:text-xl font-semibold">{weatherData.main.pressure} hPa</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['today', 'hourly', 'weekly'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold capitalize transition-all transform hover:scale-105 whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                  : 'backdrop-blur-xl bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab === 'today' && '📅 '}
              {tab === 'hourly' && '⏰ '}
              {tab === 'weekly' && '📆 '}
              {tab}
            </button>
          ))}
        </div>

        {/* Today's Details */}
        {activeTab === 'today' && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 border border-white/20">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <span>📊</span> Today's Detailed Weather
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-white/50 mb-1">Sunrise</div>
                <div className="text-base sm:text-xl font-semibold">{formatTime(weatherData.sys.sunrise)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-white/50 mb-1">Sunset</div>
                <div className="text-base sm:text-xl font-semibold">{formatTime(weatherData.sys.sunset)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-white/50 mb-1">Min Temp</div>
                <div className="text-base sm:text-xl font-semibold">{convertTemp(weatherData.main.temp_min)}°</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-white/50 mb-1">Max Temp</div>
                <div className="text-base sm:text-xl font-semibold">{convertTemp(weatherData.main.temp_max)}°</div>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        {activeTab === 'hourly' && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 border border-white/20">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <span>⏰</span> Hourly Forecast
            </h3>
            <div className="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="flex gap-3 sm:gap-4 min-w-max">
                {hourlyData.map((hour, index) => (
                  <div
                    key={index}
                    className="text-center p-3 sm:p-4 bg-white/5 rounded-xl min-w-[80px] sm:min-w-[100px] hover:bg-white/10 transition-all transform hover:scale-105"
                  >
                    <div className="text-xs sm:text-sm text-white/50 mb-2">{hour.time}</div>
                    <div className="text-2xl sm:text-4xl mb-2">{hour.icon}</div>
                    <div className="text-base sm:text-xl font-semibold">{convertTemp(hour.temp)}°</div>
                    <div className="text-xs text-white/50 mt-1 capitalize truncate max-w-[80px] sm:max-w-[100px]">
                      {hour.condition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Forecast */}
        {activeTab === 'weekly' && (
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 border border-white/20">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <span>📆</span> 7-Day Forecast
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {dailyData.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all transform hover:scale-[1.01] sm:hover:scale-[1.02] gap-2 sm:gap-0"
                >
                  <div className="flex items-center justify-between sm:justify-start sm:gap-6">
                    <span className="font-semibold w-12 text-sm sm:text-base">{day.day}</span>
                    <span className="text-2xl sm:text-3xl">{day.icon}</span>
                    <span className="text-white/70 capitalize text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">
                      {day.condition}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-blue-300 text-sm sm:text-base">{convertTemp(day.min)}°</span>
                    <span className="text-orange-300 font-semibold text-sm sm:text-base">{convertTemp(day.max)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Air Quality Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 border border-white/20">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <span>🌬️</span> Air Quality Index
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <div className="text-xs sm:text-sm text-white/50 mb-2">PM2.5</div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="text-xs sm:text-sm">35</span>
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/50 mb-2">PM10</div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <span className="text-xs sm:text-sm">42</span>
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/50 mb-2">O₃</div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: '28%' }}></div>
                </div>
                <span className="text-xs sm:text-sm">28</span>
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/50 mb-2">NO₂</div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: '55%' }}></div>
                </div>
                <span className="text-xs sm:text-sm">55</span>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-center text-sm sm:text-base">
            <span className="font-semibold">✨ Air Quality is Good - Perfect for outdoor activities!</span>
          </div>
        </div>

        {/* Weather Map Preview - FIXED */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 border border-white/20">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <span>🗺️</span> Weather Map
          </h3>
          <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px sm:40px 40px'
            }}></div>
            
            {/* Map Content - FIXED to properly display city name */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4">
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-pulse">🌍</div>
                <p className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{city} Weather Map</p>
                <p className="text-xs sm:text-sm text-white/70">Interactive radar view coming soon</p>
                <button className="mt-3 sm:mt-4 px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 rounded-lg sm:rounded-xl hover:bg-white/30 transition-all text-xs sm:text-sm">
                  View Full Map →
                </button>
              </div>
            </div>

            {/* Weather Markers */}
            <div className="absolute top-1/4 left-1/4 animate-pulse text-xl sm:text-2xl">
              {getWeatherIcon(weatherData.weather[0].icon)}
            </div>
            <div className="absolute bottom-1/3 right-1/3 animate-bounce text-xl sm:text-2xl">☁️</div>
            <div className="absolute top-1/3 right-1/4 animate-float text-xl sm:text-2xl">🌧️</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
          
          <p className="text-white/50 text-xs sm:text-sm">
            © {new Date().getFullYear()} WeatherWise. All rights reserved. | Data from OpenWeatherMap
          </p>
          <p className="text-white/30 text-xs mt-1 sm:mt-2">
            Made with ❤️ for weather enthusiasts everywhere. | Developed by <a href="https://github.com/nishan-chaudhary" className="text-blue-300 hover:underline">Nishan Chaudhary</a>
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

// Helper function to get wind direction
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export default WeatherApp