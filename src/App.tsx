import { useCallback, useEffect, useState } from 'react';
import { CourseOverviewDrawer } from './components/CourseOverviewDrawer';
import { DashboardHome } from './components/DashboardHome';
import { Footer } from './components/Footer';
import { PersonalSettingsModal } from './components/PersonalSettingsModal';
import { PracticeLabView } from './components/PracticeLabView';
import {
  CoursesView,
  InterviewPrepView,
  ProgressView,
} from './components/SectionViews';
import { TopNav } from './components/TopNav';
import { COURSES } from './data/curriculum';
import { useAcademyStorage } from './hooks/useLocalStorageState';
import { NavSection } from './types/academy';
import {
  AppRoute,
  buildHashHref,
  navigateToHash,
  parseHashRoute,
} from './utils/hashRouter';

export default function App() {
  const {
    state,
    updateSettings,
    toggleFocusCourse,
    setCourseStatus,
    toggleCourseModule,
    toggleBookmark,
    updateCourseNotes,
    addPersonalLink,
    addPersonalLinksBatch,
    updatePersonalLinkTimestamp,
    deletePersonalLink,
    togglePracticedLab,
    togglePracticePrompt,
    setPracticeTopicAll,
    updatePracticeTopicNote,
    updatePracticePromptAnswer,
    checkPracticePromptAnswer,
    toggleInterviewItem,
    updatePracticeScratchpad,
    importStateFromJson,
    resetProgressOnly,
    resetAllData,
  } = useAcademyStorage();

  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') {
      return { section: 'dashboard' };
    }
    return parseHashRoute(window.location.hash);
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ensure initial URL has canonical #/ if empty and listen to browser back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.hash) {
      window.history.replaceState(null, '', buildHashHref({ section: 'dashboard' }));
    }

    const handleHashChange = () => {
      const next = parseHashRoute(window.location.hash);
      setRoute(next);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateRoute = useCallback((nextRoute: AppRoute, scrollTop = false) => {
    setRoute(nextRoute);
    navigateToHash(nextRoute);
    if (scrollTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSelectSection = useCallback(
    (section: NavSection) => {
      navigateRoute({ section }, true);
    },
    [navigateRoute]
  );

  const handleOpenCourseOverview = useCallback(
    (courseId: string, moduleId?: string) => {
      navigateRoute({ section: 'courses', courseId, moduleId }, false);
    },
    [navigateRoute]
  );

  const handleOpenPracticeLab = useCallback(
    (labId: string, moduleId?: string) => {
      navigateRoute({ section: 'practice-lab', labId, moduleId }, true);
    },
    [navigateRoute]
  );

  const handleNavigateLabTopic = useCallback(
    (labId: string, moduleId?: string) => {
      navigateRoute({ section: 'practice-lab', labId, moduleId }, false);
    },
    [navigateRoute]
  );

  const selectedCourseId = route.section === 'courses' ? route.courseId ?? null : null;
  const focusedCourseModuleId =
    route.section === 'courses' ? route.moduleId : undefined;

  const selectedCourse = selectedCourseId
    ? COURSES.find((c) => c.id === selectedCourseId) ?? null
    : null;

  const selectedProgress = selectedCourse
    ? state.courseProgress[selectedCourse.id]
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNav
        activeSection={route.section}
        onSelectSection={handleSelectSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1">
        {route.section === 'dashboard' && (
          <DashboardHome
            state={state}
            onSelectSection={handleSelectSection}
            onOpenCourseOverview={handleOpenCourseOverview}
            onOpenPracticeLab={handleOpenPracticeLab}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleBookmark={toggleBookmark}
            onToggleFocus={toggleFocusCourse}
            onSetCourseStatus={setCourseStatus}
          />
        )}

        {route.section === 'courses' && (
          <CoursesView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onOpenCourseOverview={handleOpenCourseOverview}
            onOpenPracticeLab={handleOpenPracticeLab}
            onToggleBookmark={toggleBookmark}
            onToggleFocus={toggleFocusCourse}
            onSetCourseStatus={setCourseStatus}
          />
        )}

        {route.section === 'practice-lab' && (
          <PracticeLabView
            state={state}
            routeLabId={route.labId}
            routeModuleId={route.moduleId}
            onNavigateLab={handleNavigateLabTopic}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onTogglePracticedLab={togglePracticedLab}
            onTogglePracticePrompt={togglePracticePrompt}
            onSetTopicAll={setPracticeTopicAll}
            onUpdateTopicNote={updatePracticeTopicNote}
            onUpdatePromptAnswer={updatePracticePromptAnswer}
            onCheckPromptAnswer={checkPracticePromptAnswer}
            onUpdateScratchpad={updatePracticeScratchpad}
            onOpenCourseOverview={handleOpenCourseOverview}
          />
        )}

        {route.section === 'interview-prep' && (
          <InterviewPrepView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onToggleInterviewItem={toggleInterviewItem}
            onOpenCourseOverview={handleOpenCourseOverview}
            onOpenPracticeLab={handleOpenPracticeLab}
          />
        )}

        {route.section === 'progress' && (
          <ProgressView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onSelectSection={handleSelectSection}
            onOpenCourseOverview={handleOpenCourseOverview}
            onOpenPracticeLab={handleOpenPracticeLab}
            onResetProgressOnly={resetProgressOnly}
          />
        )}
      </main>

      <Footer onSelectSection={handleSelectSection} />

      <CourseOverviewDrawer
        course={selectedCourse}
        progress={selectedProgress}
        isFocused={
          selectedCourse !== null &&
          state.settings.focusCourseId === selectedCourse.id
        }
        focusedModuleId={focusedCourseModuleId}
        onClose={() => navigateRoute({ section: 'courses' }, false)}
        onSelectCourse={(courseId, moduleId) =>
          handleOpenCourseOverview(courseId, moduleId)
        }
        onSelectModuleHash={(courseId, moduleId) =>
          navigateRoute({ section: 'courses', courseId, moduleId }, false)
        }
        onOpenPracticeLab={handleOpenPracticeLab}
        onToggleModule={toggleCourseModule}
        onSetStatus={setCourseStatus}
        onToggleBookmark={toggleBookmark}
        onToggleFocus={toggleFocusCourse}
        onUpdateNotes={updateCourseNotes}
        onAddPersonalLink={addPersonalLink}
        onAddPersonalLinksBatch={addPersonalLinksBatch}
        onUpdatePersonalLinkTimestamp={updatePersonalLinkTimestamp}
        onDeletePersonalLink={deletePersonalLink}
      />

      <PersonalSettingsModal
        isOpen={isSettingsOpen}
        settings={state.settings}
        fullState={state}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
        onImportJson={importStateFromJson}
        onResetProgressOnly={resetProgressOnly}
        onResetAllData={resetAllData}
      />
    </div>
  );
}
