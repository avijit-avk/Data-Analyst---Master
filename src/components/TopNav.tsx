import { BookOpen, Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { NavSection } from '../types/academy';
import { buildSectionHashHref } from '../utils/hashRouter';

interface TopNavProps {
  activeSection: NavSection;
  onOpenSettings: () => void;
}

const NAV_ITEMS: { id: NavSection; label: string; matchSections: NavSection[] }[] = [
  { id: 'dashboard', label: 'Dashboard', matchSections: ['dashboard'] },
  { id: 'modules', label: 'Modules', matchSections: ['modules', 'module', 'lesson', 'quiz'] },
  { id: 'lab', label: 'Practice Labs', matchSections: ['lab', 'timed-practice'] },
  { id: 'portfolio', label: 'Portfolio', matchSections: ['portfolio'] },
  { id: 'career-readiness', label: 'Career', matchSections: ['career-readiness', 'progress'] },
];

const MOBILE_ITEMS: { id: NavSection; label: string; matchSections: NavSection[] }[] = [
  { id: 'dashboard', label: 'Dashboard', matchSections: ['dashboard'] },
  { id: 'modules', label: 'All Modules', matchSections: ['modules', 'module', 'lesson'] },
  { id: 'lab', label: 'Practice Labs', matchSections: ['lab'] },
  { id: 'timed-practice', label: 'Timed Coding Practice', matchSections: ['timed-practice'] },
  { id: 'quiz', label: 'Assessments & Capstone', matchSections: ['quiz'] },
  { id: 'portfolio', label: 'Portfolio Builder', matchSections: ['portfolio'] },
  { id: 'career-readiness', label: 'Career & Resume Prep', matchSections: ['career-readiness'] },
  { id: 'progress', label: 'Progress Ledger', matchSections: ['progress'] },
];

export function TopNav({ activeSection, onOpenSettings }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <a
          href="#/dashboard"
          className="flex items-center gap-2.5 text-left group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-md shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="font-display font-semibold text-base tracking-tight text-slate-900">
            Data Analytics Masters
          </span>
        </a>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.matchSections.includes(activeSection);
            return (
              <a
                key={item.id}
                href={buildSectionHashHref(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1"
        >
          {MOBILE_ITEMS.map((item) => {
            const isActive = item.matchSections.includes(activeSection);
            return (
              <a
                key={item.id}
                href={buildSectionHashHref(item.id)}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      )}
    </header>
  );
}
