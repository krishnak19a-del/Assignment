import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import './HouseholdDetail.css'

interface Member {
  id: number
  first_name: string
  last_name: string
  date_of_birth: string
  ssn: string
  phone: string
  email: string
  address: string
  occupation: string
  employer: string
  marital_status: string
}

interface FinancialProfile {
  id: number
  account_type: string
  custodian: string
  client_tax_bracket: string
  estimated_liquid_net_worth: number
  estimated_total_net_worth: number
  annual_income: number
  primary_investment_objective: string
  risk_tolerance: string
  time_horizon: string
}

interface BankDetail {
  id: number
  bank_name: string
  bank_type: string
  account_number: string
  beneficiary_1_name: string
  beneficiary_1_percent: number
  beneficiary_2_name: string
  beneficiary_2_percent: number
}

interface Household {
  id: number
  name: string
  members: Member[]
  financial_profiles: FinancialProfile[]
  bank_details: BankDetail[]
}

export function HouseholdDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [household, setHousehold] = useState<Household | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [err, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`http://localhost:8001/api/excel/${id}`)
      .then(res => res.json())
      .then(data => {
        setHousehold(data.household)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="household-detail loading">Loading...</div>
  }

  if (!household) {
    return (
      <div className="household-detail error">
        <p>Household not found</p>
        <button onClick={() => navigate('/dashboard/households')}>Back to Households</button>
      </div>
    )
  }

   const handleUploadClick = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await UploadAudio(event.target.files[0])
    }
  }

  const UploadAudio = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const url = `http://localhost:8001/api/household/uploadAudio`
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(`Upload failed: ${response.status} ${response.statusText}`)
      } else {
        setSuccessMessage(`✓ Audio processed successfully! Household ID: ${data.household_id}`)
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (error) {
      setError('Failed to upload audio. Please try again.')
    } finally {
      setUploading(false)
    }
   }

  return (
    <div className="household-detail">
      <button className="back-btn" onClick={() => navigate('/dashboard/households')}>
        ← Back to Households
      </button>

      <div className="detail-header">
        <div>
        <h1>{household.name}</h1>
        <span className="id">ID: {household.id}</span>
        </div>
        
        <div className="ai-audio">
        <button 
          className='audio-btn' 
          title="Audio Summary" 
          onClick={handleUploadClick}
          disabled={uploading}
        >
          {uploading ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16" className="spinner">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3.5a.5.5 0 0 1-.5-.5v-3.5A.5.5 0 0 1 8 4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="bi bi-mic" viewBox="0 0 16 16">
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
              <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3" />
            </svg>
          )}
        <p className='audio-mic-text'>Upload Recording</p>
        </button>
        <small className='button-subtext'>Enrich Household Data with AI</small>
        <input type='file' accept="wav,audio/*" style={{ display: 'none' }} ref={fileRef} onChange={handleFileChange} />
        {successMessage && <span className='success'>{successMessage}</span>}
        {err && <span className='error'>{err}</span>}
        </div>
      </div>

      <section className="detail-section">
        <h2>Members ({household.members.length})</h2>
        <div className="cards">
          {household.members.map(m => (
            <div key={m.id} className="card">
              <div className="card-row">
                <span className="label">Name</span>
                <span>{m.first_name} {m.last_name}</span>
              </div>
              <div className="card-row">
                <span className="label">DOB</span>
                <span>{m.date_of_birth || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">SSN</span>
                <span>{m.ssn || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Phone</span>
                <span>{m.phone || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Email</span>
                <span>{m.email || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Address</span>
                <span>{m.address || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Occupation</span>
                <span>{m.occupation || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Employer</span>
                <span>{m.employer || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Marital Status</span>
                <span>{m.marital_status || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>Financial Accounts ({household.financial_profiles.length})</h2>
        <div className="cards">
          {household.financial_profiles.map(f => (
            <div key={f.id} className="card">
              <div className="card-row">
                <span className="label">Account Type</span>
                <span>{f.account_type || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Custodian</span>
                <span>{f.custodian || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Liquid Net Worth</span>
                <span>${f.estimated_liquid_net_worth?.toLocaleString() || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Total Net Worth</span>
                <span>${f.estimated_total_net_worth?.toLocaleString() || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Annual Income</span>
                <span>${f.annual_income?.toLocaleString() || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Investment Objective</span>
                <span>{f.primary_investment_objective || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Risk Tolerance</span>
                <span>{f.risk_tolerance || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Time Horizon</span>
                <span>{f.time_horizon || '-'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>Bank Details ({household.bank_details.length})</h2>
        <div className="cards">
          {household.bank_details.map(b => (
            <div key={b.id} className="card">
              <div className="card-row">
                <span className="label">Bank Name</span>
                <span>{b.bank_name || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Account Type</span>
                <span>{b.bank_type || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Account Number</span>
                <span>{b.account_number || '-'}</span>
              </div>
              <div className="card-row">
                <span className="label">Beneficiary 1</span>
                <span>{b.beneficiary_1_name || '-'} ({b.beneficiary_1_percent || 0}%)</span>
              </div>
              <div className="card-row">
                <span className="label">Beneficiary 2</span>
                <span>{b.beneficiary_2_name || '-'} ({b.beneficiary_2_percent || 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}