import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import './HouseholdList.css'

interface Household {
  id: number
  name: string
  members_count: number
  accounts_count: number
  created_at: string
}

export function HouseholdList() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://demo.mandlix.com/api/excel/list')
      .then(res => res.json())
      .then(data => {
        setHouseholds(data.households || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
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
      const response = await fetch('http://demo.mandlix.com/api/excel/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      console.log('Upload response:', data)
      
      // Refresh household list
      const listRes = await fetch('http://demo.mandlix.com/api/excel/list')
      const listData = await listRes.json()
      setHouseholds(listData.households || [])
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="household-list loading">Loading...</div>
  }

  return (
    <div className="household-list">
      <div className="household-header">
        <div className="header-content">
          <h2>Household Management</h2>
          <span className="household-count">{households.length} households</span>
        </div>
        <button 
          className="upload-btn-household"
          onClick={handleUploadClick} 
          disabled={uploading}
        >
          <span className="upload-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 5 17 10" />
              <line x1="12" y1="5" x2="12" y2="15" />
            </svg>
          </span>
          {uploading ? 'Uploading...' : 'Upload Excel'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="household-table">
        <div className="table-header">
          <span>Name</span>
          <span>Members</span>
          <span>Accounts</span>
          <span>Created</span>
        </div>
        
        {households.length === 0 ? (
          <div className="table-empty">No households found</div>
        ) : (
          households.map(h => (
            <div 
              key={h.id} 
              className="table-row"
              onClick={() => navigate(`/dashboard/household/${h.id}`)}
            >
              <span className="name">{h.name}</span>
              <span>{h.members_count}</span>
              <span>{h.accounts_count}</span>
              <span>{new Date(h.created_at).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}