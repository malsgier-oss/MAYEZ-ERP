import { Link, useLocation, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'POS', icon: '🛒' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/invoices', label: 'Invoices', icon: '📄' },
  { path: '/inventory', label: 'Inventory', icon: '📊' },
  { path: '/reports', label: 'Reports', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Side nav - visible on tablet/desktop */}
      <nav className="md:w-20 lg:w-48 md:min-h-screen bg-slate-800 text-white flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-2 py-2 px-2 flex-shrink-0">
        <div className="hidden md:block text-lg font-bold mb-4 px-2">MAYEZ</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 w-full justify-center md:justify-start md:px-4 py-3 rounded-lg touch-target md:min-h-touch ${
                isActive ? 'bg-slate-600' : 'hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
