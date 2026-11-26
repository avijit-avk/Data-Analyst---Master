import { Download, RotateCcw, Upload, X } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { LmsLocalState, PersonalSettings } from '../types/academy';

interface PersonalSettingsModalProps {
  isOpen: boolean;
  settings: PersonalSettings;
  fullState: LmsLocalState;
  onClose: () => void;
  onUpdateSettings: (patch: Partial<PersonalSettings>) => void;
  onImportJson: (rawJson: string) => { ok: true } | { ok: false; error: string };
  onResetProgressOnly: () => void;
  onResetAllData: () => void;
}

const ROLE_SUGGESTIONS = [
  'Data Analyst',
  'Business Intelligence Analyst',
  'Product Analyst',
  'Operations Analyst',
];

export function PersonalSettingsModal({
  isOpen,
  settings,
  fullState,
  onClose,
  onUpdateSettings,
  onImportJson,
  onResetProgressOnly,
  onResetAllData,
}: PersonalSettingsModalProps) {
  const [confirmReset, setConfirmReset] = useState<'none' | 'progress' | 'all'>('none');
  const [backupNotice, setBackupNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmReset('none');
      setBackupNotice(null);
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(fullState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-analytics-masters-lms-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBackupNotice({
      type: 'success',
      message: 'Exported lessons, lab checks, quiz scores, and notes to JSON.',
    });
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const result = onImportJson(text);
      if (result.ok) {
        setBackupNotice({
          type: 'success',
          message: 'LMS progress backup restored to browser local storage.',
        });
      } else {
        setBackupNotice({
          type: 'error',
          message: result.error,
        });
      }
    } catch {
      setBackupNotice({
        type: 'error',
        message: 'Could not read selected file.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="settings-modal-title"
              className="font-display text-lg font-semibold text-slate-900"
            >
              Personal Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved strictly in browser local storage. Zero external accounts required.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-10 h-10 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-5">
          <div>
            <label
              htmlFor="setting-learner-name"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Display Name
            </label>
            <input
              id="setting-learner-name"
              type="text"
              value={settings.learnerName}
              onChange={(e) => onUpdateSettings({ learnerName: e.target.value })}
              placeholder="Optional (e.g., Alex)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="setting-target-role"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Target Role
            </label>
            <input
              id="setting-target-role"
              type="text"
              value={settings.targetRole}
              onChange={(e) => onUpdateSettings({ targetRole: e.target.value })}
              placeholder="Optional (e.g., Data Analyst)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ROLE_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => onUpdateSettings({ targetRole: role })}
                  className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors cursor-pointer ${
                    settings.targetRole === role
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="setting-weekly-hours"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Weekly Study Goal (hours)
              </label>
              <input
                id="setting-weekly-hours"
                type="number"
                min={1}
                max={60}
                value={settings.weeklyHoursGoal ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateSettings({
                    weeklyHoursGoal: Number.isFinite(val) && val > 0 ? Math.min(val, 60) : null,
                  });
                }}
                placeholder="Unset"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 tabular-nums placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-800 mb-1.5">
                Card Density
              </span>
              <div
                role="group"
                aria-label="Card layout density"
                className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ cardDensity: 'comfortable' })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    settings.cardDensity === 'comfortable'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ cardDensity: 'compact' })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    settings.cardDensity === 'compact'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100">
            <div>
              <span className="block text-sm font-medium text-slate-800">
                Show Objectives Preview on Cards
              </span>
              <span className="block text-xs text-slate-500">
                Display lesson previews beneath each module description on the roadmap.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.showModulePreview}
              onClick={() =>
                onUpdateSettings({ showModulePreview: !settings.showModulePreview })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                settings.showModulePreview ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-150 ${
                  settings.showModulePreview ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-slate-800">
              Local Data Backup & Reset
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="sr-only"
              aria-label="Import local JSON backup file"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export Local JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Import Local JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmReset('progress')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Progress</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmReset('all')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <span>Clear All Data</span>
              </button>
            </div>

            {backupNotice && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  backupNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {backupNotice.message}
              </div>
            )}

            {confirmReset !== 'none' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-700">
                  {confirmReset === 'progress'
                    ? 'Reset all completed lessons, lab checks, and quiz scores to 0?'
                    : 'Clear all progress, notes, quiz scores, and personal settings from this browser?'}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmReset('none')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmReset === 'progress') {
                        onResetProgressOnly();
                      } else {
                        onResetAllData();
                      }
                      setConfirmReset('none');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
