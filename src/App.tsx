import { useEffect, useState } from 'react';
import { DashboardHome } from './components/DashboardHome';
import { Footer } from './components/Footer';
import { LabView } from './components/LabView';
import { LessonView } from './components/LessonView';
import { ModuleView } from './components/ModuleView';
import { PersonalSettingsModal } from './components/PersonalSettingsModal';
import { ProgressLedgerView } from './components/ProgressLedgerView';
import { QuizView } from './components/QuizView';
import { TopNav } from './components/TopNav';
import { useLmsState } from './hooks/useLocalStorageState';
import { AppRoute, parseHashRoute } from './utils/hashRouter';

export function App() {
  const {
    state,
    toggleLessonComplete,
    updateLessonNote,
    updateExerciseAnswer,
    checkExerciseAnswer,
    updateLabNote,
    submitQuizAttempt,
    updateSettings,
    importJsonBackup,
    resetProgressOnly,
    resetAllData,
  } = useLmsState();

  const [route, setRoute] = useState<AppRoute>(() =>
    parseHashRoute(typeof window !== 'undefined' ? window.location.hash : '')
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => {
      const parsed = parseHashRoute(window.location.hash);
      setRoute(parsed);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNav
        activeSection={route.section}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1">
        {route.section === 'dashboard' && <DashboardHome state={state} />}

        {route.section === 'modules' && (
          <ModuleView
            state={state}
            onToggleLessonComplete={toggleLessonComplete}
          />
        )}

        {route.section === 'module' && (
          <ModuleView
            moduleId={route.moduleId}
            state={state}
            onToggleLessonComplete={toggleLessonComplete}
          />
        )}

        {route.section === 'lesson' && (
          <LessonView
            lessonId={route.lessonId}
            state={state}
            onToggleLessonComplete={toggleLessonComplete}
            onUpdateLessonNote={updateLessonNote}
          />
        )}

        {route.section === 'lab' && (
          <LabView
            labId={route.labId}
            state={state}
            onUpdateAnswer={updateExerciseAnswer}
            onCheckAnswer={checkExerciseAnswer}
            onUpdateLabNote={updateLabNote}
          />
        )}

        {route.section === 'quiz' && (
          <QuizView
            quizId={route.quizId}
            state={state}
            onSubmitQuiz={submitQuizAttempt}
          />
        )}

        {route.section === 'progress' && (
          <ProgressLedgerView
            state={state}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
      </main>

      <Footer />

      <PersonalSettingsModal
        isOpen={settingsOpen}
        settings={state.settings}
        fullState={state}
        onClose={() => setSettingsOpen(false)}
        onUpdateSettings={updateSettings}
        onImportJson={importJsonBackup}
        onResetProgressOnly={resetProgressOnly}
        onResetAllData={resetAllData}
      />
    </div>
  );
}

export default App;
