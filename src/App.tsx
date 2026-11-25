import { useState } from 'react';
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

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCourse = selectedCourseId
    ? COURSES.find((c) => c.id === selectedCourseId) ?? null
    : null;

  const selectedProgress = selectedCourse
    ? state.courseProgress[selectedCourse.id]
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNav
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1">
        {activeSection === 'dashboard' && (
          <DashboardHome
            state={state}
            onSelectSection={handleSelectSection}
            onOpenCourseOverview={(courseId) => setSelectedCourseId(courseId)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleBookmark={toggleBookmark}
            onToggleFocus={toggleFocusCourse}
            onSetCourseStatus={setCourseStatus}
          />
        )}

        {activeSection === 'courses' && (
          <CoursesView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onOpenCourseOverview={(courseId) => setSelectedCourseId(courseId)}
            onToggleBookmark={toggleBookmark}
            onToggleFocus={toggleFocusCourse}
            onSetCourseStatus={setCourseStatus}
          />
        )}

        {activeSection === 'practice-lab' && (
          <PracticeLabView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onTogglePracticedLab={togglePracticedLab}
            onTogglePracticePrompt={togglePracticePrompt}
            onSetTopicAll={setPracticeTopicAll}
            onUpdateTopicNote={updatePracticeTopicNote}
            onUpdatePromptAnswer={updatePracticePromptAnswer}
            onCheckPromptAnswer={checkPracticePromptAnswer}
            onUpdateScratchpad={updatePracticeScratchpad}
            onOpenCourseOverview={(courseId) => setSelectedCourseId(courseId)}
          />
        )}

        {activeSection === 'interview-prep' && (
          <InterviewPrepView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onToggleInterviewItem={toggleInterviewItem}
            onOpenCourseOverview={(courseId) => setSelectedCourseId(courseId)}
          />
        )}

        {activeSection === 'progress' && (
          <ProgressView
            state={state}
            onBackToDashboard={() => handleSelectSection('dashboard')}
            onSelectSection={handleSelectSection}
            onOpenCourseOverview={(courseId) => setSelectedCourseId(courseId)}
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
        onClose={() => setSelectedCourseId(null)}
        onSelectCourse={(courseId) => setSelectedCourseId(courseId)}
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
