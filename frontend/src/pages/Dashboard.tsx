import { Outlet } from 'react-router'
import { Sidebar } from '../components/Sidebar'
import './Dashboard.css'

export function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  )
}