import { useEffect, useState } from 'react';
import { CareerReadinessView } from './components/CareerReadinessView';
import { DashboardHome } from './components/DashboardHome';
import { Footer } from './components/Footer';
import { LabView } from './components/LabView';
import { LessonView } from './components/LessonView';
import { ModuleView } from './components/ModuleView';
import { NotFoundView } from './components/NotFoundView';
import { PersonalSettingsModal } from './components/PersonalSettingsModal';
import { PortfolioView } from './components/PortfolioView';
import { ProgressLedgerView } from './components/ProgressLedgerView';
import { QuizView } from './components/QuizView';
import { TimedPracticeView } from './components/TimedPracticeView';
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
    saveOpenEndedDraft,
    submitOpenEndedResponse,
    toggleOpenEndedRubric,
    resetOpenEndedTask,
    recordTimedAttempt,
    upsertPortfolioProject,
    deletePortfolioProject,
    saveBehavioralAnswer,
    deleteBehavioralAnswer,
    updateResumeWorksheet,
    toggleCareerChecklistItem,
    saveJdGapAnalysis,
    deleteJdGapAnalysis,
    upsertJobApplication,
    deleteJobApplication,
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
            onSaveOpenEndedDraft={saveOpenEndedDraft}
            onSubmitOpenEndedResponse={submitOpenEndedResponse}
            onToggleOpenEndedRubric={toggleOpenEndedRubric}
            onResetOpenEndedTask={resetOpenEndedTask}
            onSaveBehavioralAnswer={saveBehavioralAnswer}
            onDeleteBehavioralAnswer={deleteBehavioralAnswer}
          />
        )}

        {route.section === 'module' && (
          <ModuleView
            moduleId={route.moduleId}
            state={state}
            onToggleLessonComplete={toggleLessonComplete}
            onSaveOpenEndedDraft={saveOpenEndedDraft}
            onSubmitOpenEndedResponse={submitOpenEndedResponse}
            onToggleOpenEndedRubric={toggleOpenEndedRubric}
            onResetOpenEndedTask={resetOpenEndedTask}
            onSaveBehavioralAnswer={saveBehavioralAnswer}
            onDeleteBehavioralAnswer={deleteBehavioralAnswer}
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
            onSaveOpenEndedDraft={saveOpenEndedDraft}
            onSubmitOpenEndedResponse={submitOpenEndedResponse}
            onToggleOpenEndedRubric={toggleOpenEndedRubric}
            onResetOpenEndedTask={resetOpenEndedTask}
          />
        )}

        {route.section === 'timed-practice' && (
          <TimedPracticeView
            challengeId={route.challengeId}
            state={state}
            onRecordAttempt={recordTimedAttempt}
          />
        )}

        {route.section === 'portfolio' && (
          <PortfolioView
            projectId={route.projectId}
            state={state}
            onUpsertProject={upsertPortfolioProject}
            onDeleteProject={deletePortfolioProject}
          />
        )}

        {route.section === 'career-readiness' && (
          <CareerReadinessView
            state={state}
            onUpdateResume={updateResumeWorksheet}
            onToggleChecklist={toggleCareerChecklistItem}
            onSaveJdGap={saveJdGapAnalysis}
            onDeleteJdGap={deleteJdGapAnalysis}
            onUpsertApplication={upsertJobApplication}
            onDeleteApplication={deleteJobApplication}
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

        {route.section === 'not-found' && <NotFoundView rawHash={route.rawHash} />}
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
