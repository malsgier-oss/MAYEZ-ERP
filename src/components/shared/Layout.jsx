import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { getStoredLocale, t } from '../../utils/i18n'
import { useIsMobile } from '../../hooks/useIsMobile'

const navItems = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: '🏠' },
  { path: '/', labelKey: 'nav.pos', icon: '🛒' },
  { path: '/products', labelKey: 'nav.products', icon: '📦' },
  { path: '/categories', labelKey: 'nav.categories', icon: '📁' },
  { path: '/customers', labelKey: 'nav.customers', icon: '👥' },
  { path: '/suppliers', labelKey: 'nav.suppliers', icon: '🚚' },
  { path: '/invoices', labelKey: 'nav.invoices', icon: '📄' },
  { path: '/inventory', labelKey: 'nav.inventory', icon: '📊' },
  { path: '/reports', labelKey: 'nav.reports', icon: '📈' },
  { path: '/settings', labelKey: 'nav.settings', icon: '⚙️' },
]

function NavLink({ item, isActive }) {
  return (
    <Link
      to={item.path}
      className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-2 py-2 rounded-lg transition-colors touch-target ${
        isActive ? 'bg-slate-600 text-white' : 'text-slate-300 active:bg-slate-700'
      }`}
    >
      <span className="text-xl leading-none mb-1">{item.icon}</span>
      <span className="text-[10px] leading-tight text-center truncate max-w-[64px]">{t(item.labelKey)}</span>
    </Link>
  )
}

export default function Layout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [locale, setLocale] = useState(() => getStoredLocale())

  useEffect(() => {
    const onSettingsSaved = () => setLocale(getStoredLocale())
    window.addEventListener('mayez-settings-saved', onSettingsSaved)
    return () => window.removeEventListener('mayez-settings-saved', onSettingsSaved)
  }, [])

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr'
    const lang = locale === 'ar' ? 'ar' : 'en'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
  }, [locale])

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Side nav: desktop/tablet only */}
      {!isMobile && (
        <nav className="md:w-20 lg:w-48 md:min-h-screen bg-slate-800 text-white flex md:flex-col items-center justify-around md:justify-start md:pt-6 md:gap-2 py-2 px-2 flex-shrink-0 print:hidden">
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
                <span className="hidden lg:inline">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>
      )}

      {/* Main content: extra bottom padding on phone for bottom nav */}
      <main
        className={`flex-1 overflow-auto p-4 md:p-6 ${
          isMobile ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))]' : ''
        }`}
      >
        {/* Phone: top bar with logo */}
        {isMobile && (
          <div className="flex items-center justify-center py-3 mb-2 -mt-2 -mx-4 px-4 bg-slate-800 text-white md:hidden print:hidden">
            <span className="text-lg font-bold">MAYEZ</span>
          </div>
        )}
        <Outlet />
      </main>

      {/* Bottom nav: phone only */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 text-white border-t border-slate-700 md:hidden flex items-stretch overflow-x-auto overflow-y-hidden no-scrollbar print:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-stretch min-w-full justify-around flex-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return <NavLink key={item.path} item={item} isActive={isActive} />
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
