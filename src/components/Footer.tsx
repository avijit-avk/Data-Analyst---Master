import { NAV_ITEMS } from '../data/curriculum';
import { NavSection } from '../types/academy';

interface FooterProps {
  onSelectSection: (section: NavSection) => void;
}

export function Footer({ onSelectSection }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold text-slate-900">
            Data Analytics Masters — Personal Edition
          </p>
          <p className="text-xs text-slate-500 mt-1">
            All curriculum progress and personal settings stay in your browser&apos;s local storage.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSection(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
