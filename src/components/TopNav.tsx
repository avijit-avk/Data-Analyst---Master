import { Menu, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_ITEMS } from '../data/curriculum';
import { NavSection } from '../types/academy';
import { buildSectionHashHref } from '../utils/hashRouter';

interface TopNavProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenSettings: () => void;
}

export function TopNav({
  activeSection,
  onSelectSection,
  onOpenSettings,
}: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (
    e: React.MouseEvent<HTMLAnchorElement>,
    section: NavSection
  ) => {
    // Allow browser default for new-tab / modifier clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onSelectSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href={buildSectionHashHref('dashboard')}
          onClick={(e) => handleNavigate(e, 'dashboard')}
          className="font-display text-base sm:text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          Data Analytics Masters
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={buildSectionHashHref(item.id)}
                onClick={(e) => handleNavigate(e, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-0.5 transition-opacity duration-150 ${
                    isActive ? 'bg-blue-600 opacity-100' : 'bg-transparent opacity-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>Personal Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav
            aria-label="Mobile navigation"
            className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={buildSectionHashHref(item.id)}
                  onClick={(e) => handleNavigate(e, item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="pt-2 mt-1 border-t border-slate-100 sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Personal Settings</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
