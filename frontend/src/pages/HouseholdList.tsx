import { useState, useEffect } from 'react'
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
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:8000/api/excel/list')
      .then(res => res.json())
      .then(data => {
        setHouseholds(data.households || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="household-list loading">Loading...</div>
  }

  return (
    <div className="household-list">
      <div className="household-header">
        <h2>Household Management</h2>
        <span className="household-count">{households.length} households</span>
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