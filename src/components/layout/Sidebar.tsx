import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { dashboardRoutes } from '../constants/dashboardRoutes';
import { useTranslation } from 'react-i18next';
import SidebarToggle from './SidebarToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const { settings } = useSettings();
  const academyName = language === 'ar' ? 'أكاديمية بيت القران' : 'House Of Quran Academy';
  const [expandedItems, setExpandedItems] = useState<string[]>(['users']);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  /**
   * Helper to resolve the correct path for navigation.
   * Ensures paths are absolute starting with /dashboard/
   */
  const resolvePath = (path: string) => {
    if (path === '') return '/dashboard';
    return `/dashboard/${path}`;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full bg-white border-${language === 'ar' ? 'l' : 'r'} border-gray-200 ${isCollapsed ? 'w-20' : 'w-72'} transform transition-all duration-300 z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full' : '-translate-x-full'
          }`}
      >
        {/* Toggle Button for Desktop */}
        <div className="hidden lg:block">
          <SidebarToggle 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)} 
          />
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className={`p-6 border-b border-gray-200 transition-all ${isCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <img src={settings.logoUrl || "/logo.jpeg"} alt="House Of Quran Academy Logo" className="w-12 h-12 rounded-xl object-cover shrink-0" />
            <div className={`text-start transition-all duration-300 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100'}`}>
              <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{academyName}</h2>
              <p className="text-xs text-gray-500">لوحة التحكم</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 overflow-y-auto  no-scrollbar h-[calc(100vh-120px)]">
          <div className="space-y-1">
            {dashboardRoutes.map((item) => (
              <div key={item.id}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => !isCollapsed && toggleExpand(item.id)}
                      className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all text-gray-700 hover:bg-gray-50`}
                      title={isCollapsed ? t(item.label) : ''}
                    >
                      {item.icon && <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />}
                      {!isCollapsed && (
                        <>
                          <span className={`text-sm font-medium flex-1 ${language === 'ar' ? 'text-start' : 'text-end'}`}>
                            {t(item.label)}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 flex-shrink-0 transition-transform ${expandedItems.includes(item.id) ? 'rotate-180' : ''
                              }`}
                          />
                        </>
                      )}
                    </button>
                    {!isCollapsed && expandedItems.includes(item.id) && (
                      <div className={`${language === 'ar' ? 'mr-8' : 'ml-8'} mt-1 space-y-1`}>
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.id}
                            to={resolvePath(subItem.path)}
                            onClick={onClose}
                            className={({ isActive }) => `
                              w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all
                              ${isActive ? 'font-medium' : 'text-gray-600 hover:bg-gray-50'}
                            `}
                            style={({ isActive }) => isActive ? { backgroundColor: settings.primaryColor + '15', color: settings.primaryColor } : {}}
                          >
                            {subItem.icon && <subItem.icon className="w-4 h-4 flex-shrink-0" />}
                            <span>{t(subItem.label)}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={resolvePath(item.path)}
                    onClick={onClose}
                    className={({ isActive }) => `
                      w-full flex items-center gap-3 ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl transition-all
                      ${isActive ? '' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                    style={({ isActive }) => isActive ? { backgroundColor: settings.primaryColor + '15', color: settings.primaryColor } : {}}
                    title={isCollapsed ? t(item.label) : ''}
                  >
                    {item.icon && <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${isCollapsed ? 'mx-auto' : ''}`} />}
                    {!isCollapsed && (
                      <span className={`text-sm font-medium flex-1 ${language === 'ar' ? 'text-start' : 'text-end'}`}>
                        {t(item.label)}
                      </span>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
