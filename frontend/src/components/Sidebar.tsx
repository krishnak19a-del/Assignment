import { useNavigate } from 'react-router'
import { useTheme } from '../hooks/useTheme'
import './Sidebar.css'

export function Sidebar() {
  const { toggleTheme, theme } = useTheme()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className='subdiv1'>
      <img onClick={()=>navigate("/")} src="https://console.fasttrackr.ai/images/ft-new-logo.svg" alt="Logo" className="sidebar-logo" />
      <div className='icondiv'>
      <button className="sidebar-icon-btn" onClick={() => navigate('/dashboard/households')} title="Households">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6fffab" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>
        <p className="sidebar-btn-text">Records</p>
      </div>
      <div className='icondiv'>
      <button className="sidebar-icon-btn" onClick={() => navigate('/dashboard/insights')} title="Insights">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6fffab" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      </button>
        <p className="sidebar-btn-text">Insights</p>
      </div>
      </div>
      <div>
      <button className="sidebar-icon-btn" onClick={toggleTheme} title="Toggle Theme">
        {theme === 'light' ? (
          // Moon icon for dark mode
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6fffab" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6fffab" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </button>
      </div>
    </aside>
  )
}