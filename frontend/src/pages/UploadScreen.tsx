import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTheme } from '../hooks/useTheme'
import  DotField  from "../components/animatedBackground/DotField"
import './UploadScreen.css'

interface QuickStats {
  total_households: number
  total_members: number
  total_accounts: number
  total_net_worth: number
}

export function UploadScreen() {
  const { toggleTheme } = useTheme()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState<QuickStats | null>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/excel/insights/data')
      .then(res => res.json())
      .then(data => {
        if (data.insights) {
          setStats(data.insights.summary)
        }
      })
      .catch(() => {})
  }, [])

  const handleUploadClick = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await uploadExcel(event.target.files[0])
    }
  }

  const uploadExcel = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/excel/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      console.log('Upload response:', data)
      
      const statsRes = await fetch('http://localhost:8000/api/excel/insights/data')
      const statsData = await statsRes.json()
      if (statsData.insights) {
        setStats(statsData.insights.summary)
      }
      
      navigate('/dashboard/households')
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="home-screen">
      <header className="home-header">
        <div className="header-left">
          <img onClick={()=>navigate("/")} src="https://framerusercontent.com/images/N6Uwuf7uPvLFuZptoPWYC2d5Q.png" alt="Logo" className="header-logo" />
        </div>
        <div className="header-right">
          <button className="nav-btn" onClick={() => navigate('/dashboard/households')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Dashboard
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

 <div className="dotfield-background" style={{opacity:0.6}}>
<DotField
  dotRadius={1.5}
  dotSpacing={14}

  // ❌ remove cursor + bulge
  cursorRadius={0}
  cursorForce={0}
  bulgeStrength={0}

  // ❌ remove glow
  glowRadius={0}
  glowColor="transparent"

  // ✅ keep animation if you want wave
  waveAmplitude={6}
  waveFrequency={0.02}
  waveSpeed={0.05}

  sparkle={false}

  gradientFrom="#A855F7"
  gradientTo="#B497CF"
  opacity={0.25}
/>
</div>

      <main className="home-main">
        <div className="hero-section">
          <h2>Manage Financial Data</h2>
          <p>Upload your Excel sheets to analyze household finances, track net worth, and gain valuable insights.</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{stats?.total_households || 0}</span>
            <span className="stat-label">Households</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats?.total_members || 0}</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats?.total_accounts || 0}</span>
            <span className="stat-label">Accounts</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-value">${((stats?.total_net_worth || 0) / 1000000).toFixed(1)}M</span>
            <span className="stat-label">Total Net Worth</span>
          </div>
        </div>

        <div className="upload-section">
          <button className="upload-btn" onClick={handleUploadClick} disabled={uploading}>
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload Excel Sheet</span>
              </>
            )}
          </button>
          <input 
            ref={fileRef} 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange} 
            style={{display: 'none'}} 
          />
          <p className="upload-hint">Upload financial data to get started with household analysis and insights.</p>
        </div>


      </main>
    </div>
  )
}