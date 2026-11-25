import { NAV_ITEMS } from '../data/curriculum';
import { NavSection } from '../types/academy';
import { buildSectionHashHref } from '../utils/hashRouter';

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
            All curriculum progress, practice answers, and personal links stay in your browser&apos;s local storage.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={buildSectionHashHref(item.id)}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                  return;
                }
                e.preventDefault();
                onSelectSection(item.id);
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
