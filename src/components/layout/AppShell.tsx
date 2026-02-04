import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import './AppShell.css'

export function AppShell() {
  return (
    <div className="appShell">
      <Header />
      <main className="appShell__main">
        <Outlet />
      </main>
    </div>
  )
}

