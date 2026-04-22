import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line
} from 'recharts'
import './Insights.css'

interface Insights {
  summary: {
    total_households: number
    total_members: number
    total_accounts: number
    total_bank_accounts: number
    total_liquid_net_worth: number
    total_net_worth: number
    total_annual_income: number
    avg_net_worth_per_household: number
    avg_income_per_household: number
  }
  account_types: Record<string, number>
  custodians: Record<string, number>
  risk_tolerance: Record<string, number>
  investment_objectives: Record<string, number>
  members_per_household: Record<string, number>
  accounts_per_household: Record<string, number>
  account_values_distribution: number[]
  top_households_by_net_worth: { name: string; net_worth: number }[]
  net_worth_breakdown: { liquid: number; illiquid: number }
  household_details: { name: string; income: number; net_worth: number; members: number; accounts: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6']

export function Insights() {
  const navigate = useNavigate()
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8001/api/excel/insights/data')
      .then(res => res.json())
      .then(data => {
        setInsights(data.insights)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="insights loading">Loading insights...</div>
  }

  if (!insights) {
    return (
      <div className="insights error">
        <p>No data available. Please upload an Excel file first.</p>
        <button onClick={() => navigate('/')}>Go to Upload</button>
      </div>
    )
  }

  const accountTypeData = Object.entries(insights.account_types).map(([name, value]) => ({ name, value }))
  const custodianData = Object.entries(insights.custodians).map(([name, value]) => ({ name, value }))
  const riskData = Object.entries(insights.risk_tolerance).map(([name, value]) => ({ name, value }))
  const objectiveData = Object.entries(insights.investment_objectives).map(([name, value]) => ({ name, value }))
  
  const topHouseholdsData = insights.top_households_by_net_worth.map(h => ({
    name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
    netWorth: h.net_worth
  }))

  const distributionBuckets = [
    { range: 'Under $100K', count: 0 },
    { range: '$100K - $500K', count: 0 },
    { range: '$500K - $1M', count: 0 },
    { range: '$1M - $5M', count: 0 },
    { range: 'Over $5M', count: 0 }
  ]
  
  insights.account_values_distribution.forEach(val => {
    if (val < 100000) distributionBuckets[0].count++
    else if (val < 500000) distributionBuckets[1].count++
    else if (val < 1000000) distributionBuckets[2].count++
    else if (val < 5000000) distributionBuckets[3].count++
    else distributionBuckets[4].count++
  })

  const netWorthBreakdownData = [
    { name: 'Liquid Net Worth', value: insights.net_worth_breakdown.liquid },
    { name: 'Illiquid Net Worth', value: insights.net_worth_breakdown.illiquid }
  ]

  const incomeVsNetWorthData = insights.household_details
    .filter(h => h.income > 0 || h.net_worth > 0)
    .slice(0, 15)
    .map(h => ({
      name: h.name.length > 12 ? h.name.substring(0, 12) + '...' : h.name,
      income: h.income,
      netWorth: h.net_worth
    }))

  const membersPerHouseholdData = Object.entries(insights.members_per_household).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    members: count
  }))

  return (
    <div className="insights">
      <button className="back-btn" onClick={() => navigate('/dashboard/households')}>
        ← Back to Households
      </button>

      <h1>Insights & Analytics</h1>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="card-value">{insights.summary.total_households}</span>
          <span className="card-label">Households</span>
        </div>
        <div className="summary-card">
          <span className="card-value">{insights.summary.total_members}</span>
          <span className="card-label">Members</span>
        </div>
        <div className="summary-card">
          <span className="card-value">{insights.summary.total_accounts}</span>
          <span className="card-label">Accounts</span>
        </div>
        <div className="summary-card highlight-blue">
          <span className="card-value">${(insights.summary.total_net_worth / 1000000).toFixed(1)}M</span>
          <span className="card-label">Total Net Worth</span>
        </div>
        <div className="summary-card highlight-green">
          <span className="card-value">${(insights.summary.total_annual_income / 1000).toFixed(0)}K</span>
          <span className="card-label">Annual Income</span>
        </div>
        <div className="summary-card highlight-purple">
          <span className="card-value">${(insights.summary.total_liquid_net_worth / 1000000).toFixed(1)}M</span>
          <span className="card-label">Liquid Assets</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>💰 Net Worth Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={netWorthBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {netWorthBreakdownData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <span className="legend-item"><span className="dot green"></span> Liquid: ${insights.net_worth_breakdown.liquid.toLocaleString()}</span>
            <span className="legend-item"><span className="dot blue"></span> Illiquid: ${insights.net_worth_breakdown.illiquid.toLocaleString()}</span>
          </div>
        </div>

        <div className="chart-card">
          <h3>📊 Income vs Net Worth (Top 15)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={incomeVsNetWorthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(val: number, name: string) => [
                `$${val.toLocaleString()}`,
                name === 'income' ? 'Annual Income' : 'Net Worth'
              ]} />
              <Bar yAxisId="left" dataKey="income" fill="#10b981" name="income" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="netWorth" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>👥 Members per Household</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={membersPerHouseholdData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="members" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>💵 Account Value Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={distributionBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                {distributionBuckets.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🏦 Account Types</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={accountTypeData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                dataKey="value"
              >
                {accountTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend scrollable">
            {accountTypeData.map((item, index) => (
              <span key={item.name} className="legend-item">
                <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>📈 Risk Tolerance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🎯 Investment Objectives</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={objectiveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>🏦 Custodians</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={custodianData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                dataKey="value"
              >
                {custodianData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend scrollable">
            {custodianData.map((item, index) => (
              <span key={item.name} className="legend-item">
                <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>

        <div className="chart-card wide">
          <h3>🏆 Top 10 Households by Net Worth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topHouseholdsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
              <Bar dataKey="netWorth" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="averages-section">
        <div className="average-card">
          <h4>Avg Net Worth / Household</h4>
          <span className="avg-value">${insights.summary.avg_net_worth_per_household.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="average-card">
          <h4>Avg Income / Household</h4>
          <span className="avg-value">${insights.summary.avg_income_per_household.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="average-card">
          <h4>Avg Members / Household</h4>
          <span className="avg-value">{(insights.summary.total_members / insights.summary.total_households).toFixed(1)}</span>
        </div>
        <div className="average-card">
          <h4>Avg Accounts / Household</h4>
          <span className="avg-value">{(insights.summary.total_accounts / insights.summary.total_households).toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}