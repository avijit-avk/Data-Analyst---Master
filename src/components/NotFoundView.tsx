import { AlertCircle, ArrowRight, Briefcase, Clock, Compass, Database, FolderKanban, Home } from 'lucide-react';

interface NotFoundViewProps {
  rawHash: string;
}

export function NotFoundView({ rawHash }: NotFoundViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>Route Not Found</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            That LMS page or item ID does not exist
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The hash path <code className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-900 break-all">{rawHash || '#/'}</code> does not match any module, lesson, practice lab, timed challenge, or workspace in this application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="#/dashboard"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Return to Dashboard</span>
            </span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>

          <a
            href="#/modules"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Browse 8 Modules</span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </a>

          <a
            href="#/lab"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Practice Labs</span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </a>

          <a
            href="#/timed-practice"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Timed Practice</span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </a>

          <a
            href="#/portfolio"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Portfolio Builder</span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </a>

          <a
            href="#/career-readiness"
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Career &amp; Resume Prep</span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
