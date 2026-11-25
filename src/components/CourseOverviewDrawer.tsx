import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Crosshair,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { COURSES, PRACTICE_LAB_PREVIEWS } from '../data/curriculum';
import {
  NewPersonalLinkInput,
  normalizeSafeHttpUrl,
} from '../hooks/useLocalStorageState';
import {
  Course,
  CourseProgressEntry,
  CourseStatus,
  CuratedResourceFormat,
  PersonalLinkFormat,
} from '../types/academy';
import { buildHashHref, buildShareableUrl } from '../utils/hashRouter';
import { autoAssignStudyResource } from '../utils/resourceMatcher';
import {
  extractTimestampFromYouTubeUrl,
  fetchYouTubeTitle,
  formatSecondsToTimestamp,
  isYouTubeUrl,
  parseTimestampToSeconds,
  parseYouTubeChapters,
} from '../utils/youtubeOembed';
import { CourseIcon } from './CourseIcon';

interface CourseOverviewDrawerProps {
  course: Course | null;
  progress: CourseProgressEntry | null;
  isFocused: boolean;
  focusedModuleId?: string;
  onClose: () => void;
  onSelectCourse: (courseId: string, moduleId?: string) => void;
  onSelectModuleHash?: (courseId: string, moduleId?: string) => void;
  onOpenPracticeLab?: (labId: string, moduleId?: string) => void;
  onToggleModule: (courseId: string, moduleId: string) => void;
  onSetStatus: (courseId: string, status: CourseStatus) => void;
  onToggleBookmark: (courseId: string) => void;
  onToggleFocus: (courseId: string) => void;
  onUpdateNotes: (courseId: string, notes: string) => void;
  onAddPersonalLink: (
    courseId: string,
    label: string,
    url: string,
    format: PersonalLinkFormat,
    moduleIds: string[],
    startSeconds?: number | null
  ) => boolean;
  onAddPersonalLinksBatch: (items: NewPersonalLinkInput[]) => number;
  onUpdatePersonalLinkTimestamp: (
    courseId: string,
    linkId: string,
    startSeconds: number | null
  ) => void;
  onDeletePersonalLink: (courseId: string, linkId: string) => void;
}

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

const PERSONAL_FORMAT_OPTIONS: PersonalLinkFormat[] = [
  'Video',
  'NotebookLM',
  'Article',
  'Practice',
];

function getCuratedFormatClasses(format: CuratedResourceFormat): string {
  switch (format) {
    case 'Official Docs / Guide':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Video Tutorial':
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    case 'Interactive / Practice':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
  }
}

function getPersonalFormatClasses(format: PersonalLinkFormat): string {
  switch (format) {
    case 'Video':
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    case 'NotebookLM':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    case 'Article':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Practice':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
  }
}

export function CourseOverviewDrawer({
  course,
  progress,
  isFocused,
  focusedModuleId,
  onClose,
  onSelectCourse,
  onSelectModuleHash,
  onOpenPracticeLab,
  onToggleModule,
  onSetStatus,
  onToggleBookmark,
  onToggleFocus,
  onUpdateNotes,
  onAddPersonalLink,
  onAddPersonalLinksBatch,
  onUpdatePersonalLinkTimestamp,
  onDeletePersonalLink,
}: CourseOverviewDrawerProps) {
  const [expandedModuleIds, setExpandedModuleIds] = useState<string[]>([]);
  const [pendingExpandModuleIds, setPendingExpandModuleIds] = useState<string[]>(
    []
  );
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFormat, setNewFormat] = useState<PersonalLinkFormat>('Video');
  const [manualFormatTouched, setManualFormatTouched] = useState(false);
  const [manualTimestampInput, setManualTimestampInput] = useState('');
  const [chaptersText, setChaptersText] = useState('');

  const [manualCourseId, setManualCourseId] = useState<string | null>(null);
  const [manualModuleIds, setManualModuleIds] = useState<string[] | null>(null);

  const [excludedChapterIds, setExcludedChapterIds] = useState<string[]>([]);
  const [chapterTargetOverrides, setChapterTargetOverrides] = useState<
    Record<string, string>
  >({});

  const [editingTsLinkId, setEditingTsLinkId] = useState<string | null>(null);
  const [editingTsValue, setEditingTsValue] = useState('');
  const [editingTsError, setEditingTsError] = useState('');

  const [oembedStatus, setOembedStatus] = useState<
    'idle' | 'loading' | 'fetched' | 'failed'
  >('idle');
  const [addError, setAddError] = useState('');
  const [saveSummaryNotice, setSaveSummaryNotice] = useState<{
    message: string;
    jumpCourseId?: string;
    jumpCourseTitle?: string;
    jumpModuleIds?: string[];
  } | null>(null);

  const titleRef = useRef(newTitle);
  titleRef.current = newTitle;
  const tsInputRef = useRef(manualTimestampInput);
  tsInputRef.current = manualTimestampInput;

  useEffect(() => {
    if (course && pendingExpandModuleIds.length > 0) {
      const validSet = new Set(course.modules.map((m) => m.id));
      setExpandedModuleIds(pendingExpandModuleIds.filter((id) => validSet.has(id)));
      setPendingExpandModuleIds([]);
    } else if (course && focusedModuleId) {
      const validSet = new Set(course.modules.map((m) => m.id));
      setExpandedModuleIds(validSet.has(focusedModuleId) ? [focusedModuleId] : []);
    } else {
      setExpandedModuleIds([]);
    }
    setCopiedShareLink(false);
    setNewTitle('');
    setNewUrl('');
    setNewFormat('Video');
    setManualFormatTouched(false);
    setManualTimestampInput('');
    setChaptersText('');
    setManualCourseId(null);
    setManualModuleIds(null);
    setExcludedChapterIds([]);
    setChapterTargetOverrides({});
    setEditingTsLinkId(null);
    setEditingTsError('');
    setOembedStatus('idle');
    setAddError('');
    setSaveSummaryNotice(null);
  }, [course?.id]);

  useEffect(() => {
    if (!course || !focusedModuleId) return;
    const valid = course.modules.some((m) => m.id === focusedModuleId);
    if (!valid) return;
    setExpandedModuleIds((prev) =>
      prev.includes(focusedModuleId) ? prev : [...prev, focusedModuleId]
    );
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`study-module-${focusedModuleId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [course, focusedModuleId]);

  useEffect(() => {
    if (!course) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [course, onClose]);

  // Auto-fetch YouTube video title via free public oEmbed when URL is YouTube and title is blank
  useEffect(() => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl || !isYouTubeUrl(trimmedUrl)) {
      setOembedStatus('idle');
      return;
    }

    if (!manualFormatTouched) {
      setNewFormat('Video');
    }

    // Pre-fill manual timestamp if URL already contains ?t= / &t= and timestamp input is blank
    if (tsInputRef.current.trim() === '') {
      const extracted = extractTimestampFromYouTubeUrl(trimmedUrl);
      if (extracted !== null) {
        setManualTimestampInput(formatSecondsToTimestamp(extracted));
      }
    }

    if (titleRef.current.trim() !== '') {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (titleRef.current.trim() !== '') return;
      setOembedStatus('loading');
      const fetchedTitle = await fetchYouTubeTitle(trimmedUrl, controller.signal);
      if (controller.signal.aborted) return;

      if (fetchedTitle && titleRef.current.trim() === '') {
        setNewTitle(fetchedTitle);
        setOembedStatus('fetched');
      } else if (!fetchedTitle) {
        setOembedStatus('failed');
      } else {
        setOembedStatus('idle');
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [newUrl, manualFormatTouched]);

  const autoMatch = useMemo(() => {
    if (!course) return null;
    return autoAssignStudyResource(newTitle, newUrl, course.id);
  }, [course, newTitle, newUrl]);

  const parsedChapters = useMemo(
    () => parseYouTubeChapters(chaptersText),
    [chaptersText]
  );

  const chapterAssignments = useMemo(() => {
    if (!course || !autoMatch || parsedChapters.length === 0) return [];
    const anchorCourseId = autoMatch.course.id;

    return parsedChapters.map((ch) => {
      const override = chapterTargetOverrides[ch.id];
      if (override) {
        const [cId, mId] = override.split('::');
        const c = COURSES.find((item) => item.id === cId);
        const m = c?.modules.find((item) => item.id === mId);
        if (c && m) {
          return {
            chapter: ch,
            course: c,
            module: m,
            included: !excludedChapterIds.includes(ch.id),
          };
        }
      }

      const matched = autoAssignStudyResource(ch.title, newUrl, anchorCourseId);
      return {
        chapter: ch,
        course: matched.course,
        module: matched.modules[0],
        included: !excludedChapterIds.includes(ch.id),
      };
    });
  }, [
    course,
    autoMatch,
    parsedChapters,
    chapterTargetOverrides,
    excludedChapterIds,
    newUrl,
  ]);

  const resolvedTarget = useMemo(() => {
    if (!course || !autoMatch) return null;

    const targetCourse =
      (manualCourseId && COURSES.find((c) => c.id === manualCourseId)) ||
      autoMatch.course;

    const validModuleIdSet = new Set(targetCourse.modules.map((m) => m.id));

    let selectedModuleIds: string[];
    if (manualModuleIds !== null) {
      selectedModuleIds = manualModuleIds.filter((id) =>
        validModuleIdSet.has(id)
      );
    } else if (manualCourseId && manualCourseId !== autoMatch.course.id) {
      selectedModuleIds = [targetCourse.modules[0].id];
    } else {
      selectedModuleIds = autoMatch.modules.map((m) => m.id);
    }

    const isOverridden = manualCourseId !== null || manualModuleIds !== null;
    const isAllSelected =
      targetCourse.modules.length > 0 &&
      selectedModuleIds.length === targetCourse.modules.length;

    return {
      course: targetCourse,
      selectedModuleIds,
      isAllSelected,
      isOverridden,
      confidence: autoMatch.confidence,
    };
  }, [course, autoMatch, manualCourseId, manualModuleIds]);

  if (!course || !progress || !resolvedTarget) return null;

  const totalModules = course.modules.length;
  const completedCount = progress.completedModuleIds.length;
  const percent =
    totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const personalLinks = progress.personalLinks ?? [];
  const allExpanded =
    course.modules.length > 0 &&
    expandedModuleIds.length === course.modules.length;

  const isChapterSplitMode = chapterAssignments.length > 0;
  const includedChapters = chapterAssignments.filter((c) => c.included);
  const showTimestampField =
    !isChapterSplitMode && (newFormat === 'Video' || isYouTubeUrl(newUrl));

  const matchingPracticeLab = PRACTICE_LAB_PREVIEWS.find(
    (lab) => lab.courseId === course.id
  );

  const toggleModuleExpanded = (moduleId: string) => {
    const currentlyExpanded = expandedModuleIds.includes(moduleId);
    setExpandedModuleIds((prev) =>
      currentlyExpanded
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
    if (!currentlyExpanded) {
      onSelectModuleHash?.(course.id, moduleId);
    } else if (focusedModuleId === moduleId) {
      onSelectModuleHash?.(course.id, undefined);
    }
  };

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedModuleIds([]);
      if (focusedModuleId) {
        onSelectModuleHash?.(course.id, undefined);
      }
    } else {
      setExpandedModuleIds(course.modules.map((m) => m.id));
    }
  };

  const handleCopyShareLink = async () => {
    const activeMod =
      focusedModuleId && expandedModuleIds.includes(focusedModuleId)
        ? focusedModuleId
        : expandedModuleIds.length === 1
        ? expandedModuleIds[0]
        : undefined;
    const shareUrl = buildShareableUrl({
      section: 'courses',
      courseId: course.id,
      moduleId: activeMod,
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      window.setTimeout(() => setCopiedShareLink(false), 2000);
    } catch {
      // Fallback: focus location hash if clipboard is unavailable
      onSelectModuleHash?.(course.id, activeMod);
    }
  };

  const handleToggleTargetModule = (moduleId: string) => {
    const current = resolvedTarget.selectedModuleIds;
    const exists = current.includes(moduleId);
    const next = exists
      ? current.filter((id) => id !== moduleId)
      : [...current, moduleId];
    setManualCourseId(resolvedTarget.course.id);
    setManualModuleIds(next);
    if (addError) setAddError('');
  };

  const handleToggleAllTargetModules = () => {
    setManualCourseId(resolvedTarget.course.id);
    if (resolvedTarget.isAllSelected) {
      setManualModuleIds([resolvedTarget.course.modules[0].id]);
    } else {
      setManualModuleIds(resolvedTarget.course.modules.map((m) => m.id));
    }
    if (addError) setAddError('');
  };

  const handleSwitchTargetCourse = (nextCourseId: string) => {
    const nextCourse = COURSES.find((c) => c.id === nextCourseId);
    if (!nextCourse) return;
    setManualCourseId(nextCourse.id);
    setManualModuleIds([nextCourse.modules[0].id]);
    if (addError) setAddError('');
  };

  const handleResetToAuto = () => {
    setManualCourseId(null);
    setManualModuleIds(null);
    if (addError) setAddError('');
  };

  const handleAddResource = (e: FormEvent) => {
    e.preventDefault();

    if (!normalizeSafeHttpUrl(newUrl)) {
      setAddError('Enter a valid http:// or https:// web address.');
      return;
    }

    // Branch A: Multi-Chapter YouTube Split Mode
    if (isChapterSplitMode) {
      if (includedChapters.length === 0) {
        setAddError('Select at least one chapter to add.');
        return;
      }

      const batchItems: NewPersonalLinkInput[] = includedChapters.map((item) => ({
        courseId: item.course.id,
        label: item.chapter.title,
        url: newUrl,
        format: newFormat,
        moduleIds: [item.module.id],
        startSeconds: item.chapter.seconds,
      }));

      const addedCount = onAddPersonalLinksBatch(batchItems);
      if (addedCount === 0) {
        setAddError('Could not save chapters. Check your URL and try again.');
        return;
      }

      const currentCourseModuleIds = includedChapters
        .filter((item) => item.course.id === course.id)
        .map((item) => item.module.id);

      const otherCourseItem = includedChapters.find(
        (item) => item.course.id !== course.id
      );

      setNewTitle('');
      setNewUrl('');
      setManualFormatTouched(false);
      setManualTimestampInput('');
      setChaptersText('');
      setExcludedChapterIds([]);
      setChapterTargetOverrides({});
      setOembedStatus('idle');
      setAddError('');

      if (currentCourseModuleIds.length > 0) {
        setExpandedModuleIds((prev) =>
          Array.from(new Set([...prev, ...currentCourseModuleIds]))
        );
      }

      if (otherCourseItem) {
        const otherCourseIds = includedChapters
          .filter((item) => item.course.id === otherCourseItem.course.id)
          .map((item) => item.module.id);
        setSaveSummaryNotice({
          message: `Added ${addedCount} timestamped chapter${
            addedCount === 1 ? '' : 's'
          } across matched modules.`,
          jumpCourseId: otherCourseItem.course.id,
          jumpCourseTitle: otherCourseItem.course.title,
          jumpModuleIds: otherCourseIds,
        });
      } else {
        setSaveSummaryNotice({
          message: `Added ${addedCount} timestamped chapter${
            addedCount === 1 ? '' : 's'
          } to ${course.title}.`,
        });
      }
      return;
    }

    // Branch B: Standard Single Resource Mode
    const cleanTitle = newTitle.trim();
    if (!cleanTitle) {
      setAddError('Enter a resource title.');
      return;
    }

    let parsedSeconds: number | null = null;
    if (manualTimestampInput.trim() !== '') {
      parsedSeconds = parseTimestampToSeconds(manualTimestampInput);
      if (parsedSeconds === null) {
        setAddError('Enter start timestamp as MM:SS or HH:MM:SS (e.g. 1:15:30).');
        return;
      }
    }

    if (resolvedTarget.selectedModuleIds.length === 0) {
      setAddError('Select at least one syllabus topic chip.');
      return;
    }

    const targetCourse = resolvedTarget.course;
    const targetModuleIds = resolvedTarget.selectedModuleIds;

    const added = onAddPersonalLink(
      targetCourse.id,
      cleanTitle,
      newUrl,
      newFormat,
      targetModuleIds,
      parsedSeconds
    );
    if (!added) {
      setAddError('Could not save resource. Check the title and URL.');
      return;
    }

    setNewTitle('');
    setNewUrl('');
    setManualFormatTouched(false);
    setManualTimestampInput('');
    setManualCourseId(null);
    setManualModuleIds(null);
    setOembedStatus('idle');
    setAddError('');

    if (targetCourse.id === course.id) {
      setSaveSummaryNotice(null);
      setExpandedModuleIds((prev) =>
        Array.from(new Set([...prev, ...targetModuleIds]))
      );
    } else {
      const summaryLabel =
        targetModuleIds.length === targetCourse.modules.length
          ? 'Full Course (All Modules)'
          : `${targetModuleIds.length} module${
              targetModuleIds.length === 1 ? '' : 's'
            }`;
      setSaveSummaryNotice({
        message: `Saved inside ${targetCourse.title} → ${summaryLabel}.`,
        jumpCourseId: targetCourse.id,
        jumpCourseTitle: targetCourse.title,
        jumpModuleIds: targetModuleIds,
      });
    }
  };

  const handleStartEditTimestamp = (
    linkId: string,
    currentSeconds: number | null | undefined
  ) => {
    setEditingTsLinkId(linkId);
    setEditingTsValue(
      currentSeconds !== null && currentSeconds !== undefined
        ? formatSecondsToTimestamp(currentSeconds)
        : ''
    );
    setEditingTsError('');
  };

  const handleSaveEditedTimestamp = (linkId: string) => {
    const trimmed = editingTsValue.trim();
    if (trimmed === '') {
      onUpdatePersonalLinkTimestamp(course.id, linkId, null);
      setEditingTsLinkId(null);
      setEditingTsError('');
      return;
    }

    const parsed = parseTimestampToSeconds(trimmed);
    if (parsed === null) {
      setEditingTsError('Use MM:SS or HH:MM:SS (e.g. 12:30 or 1:15:30).');
      return;
    }

    onUpdatePersonalLinkTimestamp(course.id, linkId, parsed);
    setEditingTsLinkId(null);
    setEditingTsError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/25 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <CourseIcon iconKey={course.iconKey} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 tabular-nums">
                <span className="font-mono text-slate-400">{course.indexLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{course.category}</span>
                <span aria-hidden="true">·</span>
                <span>{course.estimatedHours} hours planned</span>
              </div>
              <h2
                id="course-drawer-title"
                className="font-display text-xl font-semibold text-slate-900 tracking-tight mt-0.5"
              >
                {course.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyShareLink}
              title="Copy direct shareable link to this study guide"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close study guide"
              className="w-10 h-10 rounded-lg inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              {course.shortDescription}
            </p>
            {matchingPracticeLab && (
              <a
                href={buildHashHref({
                  section: 'practice-lab',
                  labId: matchingPracticeLab.id,
                })}
                onClick={(e) => {
                  if (
                    e.metaKey ||
                    e.ctrlKey ||
                    e.shiftKey ||
                    e.altKey ||
                    e.button !== 0 ||
                    !onOpenPracticeLab
                  ) {
                    return;
                  }
                  e.preventDefault();
                  onOpenPracticeLab(matchingPracticeLab.id);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                <span>Open Practice Lab</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          {/* Status + focus/bookmark controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-slate-100">
            <div
              role="group"
              aria-label="Course status"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            >
              {STATUS_OPTIONS.map((opt) => {
                const active = progress.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSetStatus(course.id, opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFocus(course.id)}
                aria-pressed={isFocused}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isFocused
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isFocused ? 'Current Focus' : 'Set Current Focus'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleBookmark(course.id)}
                aria-pressed={progress.bookmarked}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  progress.bookmarked
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${progress.bookmarked ? 'fill-white' : ''}`}
                  aria-hidden="true"
                />
                <span>{progress.bookmarked ? 'Bookmarked' : 'Bookmark Course'}</span>
              </button>
            </div>
          </div>

          {/* Course Overview Curated Free Resources */}
          <section aria-labelledby="course-overview-resources-heading">
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h3
                id="course-overview-resources-heading"
                className="font-display text-sm font-semibold text-slate-900"
              >
                Course Overview Resources
              </h3>
              <span className="text-xs text-slate-500">
                Multi-format free starting points
              </span>
            </div>

            <ul className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {course.overviewResources.map((res) => (
                <li key={res.url}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${getCuratedFormatClasses(
                            res.format
                          )}`}
                        >
                          {res.format}
                        </span>
                        <span className="text-xs text-slate-500">{res.source}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors mt-1">
                        {res.title}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-white group-hover:border-blue-200 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-700 inline-flex items-center justify-center shrink-0 transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Unified Add Study Resource Form with YouTube oEmbed, Chapter Splitter & Multi-Module Chips */}
          <section aria-labelledby="add-study-resource-heading" className="space-y-3">
            <div>
              <h3
                id="add-study-resource-heading"
                className="font-display text-sm font-semibold text-slate-900"
              >
                Add Study Resource
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste a YouTube link to auto-fetch its title, or paste YouTube chapters to split each timestamp directly into matching syllabus modules.
              </p>
            </div>

            <form
              onSubmit={handleAddResource}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (oembedStatus !== 'idle') setOembedStatus('idle');
                    if (addError) setAddError('');
                  }}
                  aria-label="Study resource title"
                  placeholder="Title (auto-fills for YouTube URLs)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value);
                    if (addError) setAddError('');
                  }}
                  aria-label="Study resource URL"
                  placeholder="URL (youtube.com, youtu.be, NotebookLM...)"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {oembedStatus === 'loading' && (
                <p className="inline-flex items-center gap-1.5 text-xs text-blue-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Fetching YouTube video title...</span>
                </p>
              )}
              {oembedStatus === 'fetched' && (
                <p className="text-xs text-emerald-700">
                  Fetched YouTube title and matched topics automatically.
                </p>
              )}
              {oembedStatus === 'failed' && (
                <p className="text-xs text-slate-500">
                  Could not fetch title automatically — enter a title above or paste chapters below.
                </p>
              )}

              {/* Optional YouTube Chapters / Description Paste Area */}
              <div>
                <label
                  htmlFor="youtube-chapters-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Paste YouTube Chapters / Description (optional)
                </label>
                <textarea
                  id="youtube-chapters-input"
                  rows={3}
                  value={chaptersText}
                  onChange={(e) => {
                    setChaptersText(e.target.value);
                    if (addError) setAddError('');
                  }}
                  placeholder={`00:00 Intro\n1:15:30 NumPy Arrays\n2:40:10 Pandas DataFrames`}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Format selector + Optional manual timestamp input */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div
                  role="group"
                  aria-label="Resource format"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg"
                >
                  {PERSONAL_FORMAT_OPTIONS.map((fmt) => {
                    const active = newFormat === fmt;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          setNewFormat(fmt);
                          setManualFormatTouched(true);
                        }}
                        aria-pressed={active}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>

                {showTimestampField && (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="manual-start-timestamp"
                      className="text-xs text-slate-500 whitespace-nowrap"
                    >
                      Start time:
                    </label>
                    <input
                      id="manual-start-timestamp"
                      type="text"
                      value={manualTimestampInput}
                      onChange={(e) => {
                        setManualTimestampInput(e.target.value);
                        if (addError) setAddError('');
                      }}
                      placeholder="MM:SS or HH:MM:SS"
                      className="w-36 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {isChapterSplitMode
                      ? `Add ${includedChapters.length} Timestamped Chapter${
                          includedChapters.length === 1 ? '' : 's'
                        }`
                      : `Add to ${
                          resolvedTarget.isAllSelected
                            ? 'All Modules'
                            : `${resolvedTarget.selectedModuleIds.length} Topic${
                                resolvedTarget.selectedModuleIds.length === 1 ? '' : 's'
                              }`
                        }`}
                  </span>
                </button>
              </div>

              {/* Preview Mode A: Multi-Chapter Timestamp Split Preview */}
              {isChapterSplitMode ? (
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-800">
                      Chapter Deep-Link Split Preview
                    </span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {includedChapters.length} / {chapterAssignments.length} selected
                    </span>
                  </div>

                  <ul className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white max-h-64 overflow-y-auto">
                    {chapterAssignments.map((item) => {
                      const selectValue = `${item.course.id}::${item.module.id}`;
                      return (
                        <li
                          key={item.chapter.id}
                          className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                            item.included ? '' : 'opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.included}
                              onChange={() => {
                                setExcludedChapterIds((prev) =>
                                  prev.includes(item.chapter.id)
                                    ? prev.filter((id) => id !== item.chapter.id)
                                    : [...prev, item.chapter.id]
                                );
                              }}
                              aria-label={`Include chapter ${item.chapter.title}`}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer shrink-0"
                            />
                            <span className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 tabular-nums shrink-0">
                              {item.chapter.rawTimestamp}
                            </span>
                            <span className="text-xs font-medium text-slate-900 truncate">
                              {item.chapter.title}
                            </span>
                          </div>

                          <select
                            value={selectValue}
                            onChange={(e) =>
                              setChapterTargetOverrides((prev) => ({
                                ...prev,
                                [item.chapter.id]: e.target.value,
                              }))
                            }
                            aria-label={`Assigned module for ${item.chapter.title}`}
                            className="w-full sm:w-56 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer shrink-0"
                          >
                            {COURSES.map((c) => (
                              <optgroup key={c.id} label={`${c.indexLabel}. ${c.title}`}>
                                {c.modules.map((m, idx) => (
                                  <option key={m.id} value={`${c.id}::${m.id}`}>
                                    {c.title} · 0{idx + 1}. {m.title}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                /* Preview Mode B: Single Link Multi-Select Module Chips */
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs text-slate-600 min-w-0">
                      <span className="text-slate-500">
                        {resolvedTarget.isOverridden
                          ? 'Assigned to: '
                          : 'Auto-assigned to: '}
                      </span>
                      <span className="font-medium text-slate-900">
                        {resolvedTarget.course.title}
                      </span>
                      <span className="text-slate-400 mx-1">&rarr;</span>
                      <span className="font-medium text-slate-900">
                        {resolvedTarget.isAllSelected
                          ? 'Full Course / All Modules'
                          : `${resolvedTarget.selectedModuleIds.length} matched topic${
                              resolvedTarget.selectedModuleIds.length === 1 ? '' : 's'
                            }`}
                      </span>
                      {resolvedTarget.isOverridden && (
                        <button
                          type="button"
                          onClick={handleResetToAuto}
                          className="ml-2 text-blue-700 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Reset to auto
                        </button>
                      )}
                    </div>

                    <select
                      value={resolvedTarget.course.id}
                      onChange={(e) => handleSwitchTargetCourse(e.target.value)}
                      aria-label="Target course"
                      className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer shrink-0"
                    >
                      {COURSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.indexLabel}. {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Multi-select interactive module chips */}
                  <div
                    role="group"
                    aria-label="Select syllabus topics for this resource"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    <button
                      type="button"
                      onClick={handleToggleAllTargetModules}
                      aria-pressed={resolvedTarget.isAllSelected}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                        resolvedTarget.isAllSelected
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {resolvedTarget.isAllSelected && (
                        <Check className="w-3 h-3" aria-hidden="true" />
                      )}
                      <span>All Modules</span>
                    </button>

                    {resolvedTarget.course.modules.map((mod, idx) => {
                      const selected = resolvedTarget.selectedModuleIds.includes(
                        mod.id
                      );
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleToggleTargetModule(mod.id)}
                          aria-pressed={selected}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                            selected
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {selected && (
                            <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
                          )}
                          <span className="font-mono text-[11px] opacity-75 tabular-nums">
                            0{idx + 1}
                          </span>
                          <span className="truncate max-w-[180px]">{mod.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {addError && <p className="text-xs text-red-600">{addError}</p>}

              {saveSummaryNotice && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-blue-900">{saveSummaryNotice.message}</p>
                  {saveSummaryNotice.jumpCourseId &&
                    saveSummaryNotice.jumpCourseTitle && (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingExpandModuleIds(
                            saveSummaryNotice.jumpModuleIds ?? []
                          );
                          onSelectCourse(saveSummaryNotice.jumpCourseId!);
                        }}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        View in {saveSummaryNotice.jumpCourseTitle} &rarr;
                      </button>
                    )}
                </div>
              )}
            </form>
          </section>

          {/* Compact Expandable Syllabus Roadmap & Unified Multi-Format Resources */}
          <section aria-labelledby="syllabus-roadmap-heading">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3
                id="syllabus-roadmap-heading"
                className="font-display text-sm font-semibold text-slate-900"
              >
                Study Roadmap &amp; Topic Resources
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {completedCount} of {totalModules} checked ({percent}%)
                </span>
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="text-xs font-medium text-blue-700 hover:text-blue-800 cursor-pointer whitespace-nowrap"
                >
                  {allExpanded ? 'Collapse All Topics' : 'Expand All Topics'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              All curated resources and your saved custom links live together inside each topic.
            </p>

            <ul className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
              {course.modules.map((mod, idx) => {
                const checked = progress.completedModuleIds.includes(mod.id);
                const isExpanded = expandedModuleIds.includes(mod.id);
                const moduleCustomLinks = personalLinks.filter((link) =>
                  link.moduleIds.includes(mod.id)
                );
                const totalResources =
                  mod.resources.length + moduleCustomLinks.length;

                return (
                  <li key={mod.id} id={`study-module-${mod.id}`} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleModule(course.id, mod.id)}
                        aria-pressed={checked}
                        className="text-left flex items-start gap-3 group cursor-pointer flex-1 min-w-0"
                      >
                        <span
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            checked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400 tabular-nums">
                              0{idx + 1}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                checked
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-900 group-hover:text-blue-700'
                              }`}
                            >
                              {mod.title}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            {mod.summary}
                          </p>
                        </div>
                      </button>

                      {/* Resource count badge trigger */}
                      <button
                        type="button"
                        onClick={() => toggleModuleExpanded(mod.id)}
                        aria-expanded={isExpanded}
                        className={`self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isExpanded
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="tabular-nums">
                          {totalResources} resources
                          {moduleCustomLinks.length > 0
                            ? ` · ${moduleCustomLinks.length} custom`
                            : ''}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    {/* Unified Topic Resources List (Curated + Custom + Timestamped Deep Links) */}
                    {isExpanded && (
                      <div className="mt-3.5 pl-8 space-y-2">
                        {mod.resources.map((res) => (
                          <a
                            key={res.url}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 transition-colors group"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${getCuratedFormatClasses(
                                    res.format
                                  )}`}
                                >
                                  {res.format}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {res.source}
                                </span>
                              </div>
                              <span className="block text-xs font-medium text-slate-900 group-hover:text-blue-700 mt-1">
                                {res.title}
                              </span>
                            </div>
                            <ArrowUpRight
                              className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0"
                              aria-hidden="true"
                            />
                          </a>
                        ))}

                        {moduleCustomLinks.map((link) => {
                          const canEditTimestamp =
                            link.format === 'Video' || isYouTubeUrl(link.url);
                          const isEditingTs = editingTsLinkId === link.id;
                          const hasTimestamp =
                            link.startSeconds !== null &&
                            link.startSeconds !== undefined;

                          return (
                            <div
                              key={link.id}
                              className="rounded-lg bg-white border border-slate-200 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-slate-50/80 rounded-lg group">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="min-w-0 flex-1 flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span
                                        className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${getPersonalFormatClasses(
                                          link.format
                                        )}`}
                                      >
                                        {link.format}
                                      </span>
                                      <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 whitespace-nowrap">
                                        Custom
                                      </span>
                                      {hasTimestamp && (
                                        <span className="inline-block rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-blue-800 tabular-nums whitespace-nowrap">
                                          Starts at{' '}
                                          {formatSecondsToTimestamp(
                                            link.startSeconds!
                                          )}
                                        </span>
                                      )}
                                      {link.moduleIds.length > 1 && (
                                        <span className="text-[11px] text-slate-400 tabular-nums">
                                          Linked to {link.moduleIds.length} topics
                                        </span>
                                      )}
                                    </div>
                                    <span className="block text-xs font-medium text-slate-900 group-hover:text-blue-700 mt-1">
                                      {link.label}
                                    </span>
                                  </div>
                                  <ArrowUpRight
                                    className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0"
                                    aria-hidden="true"
                                  />
                                </a>

                                <div className="flex items-center gap-1 shrink-0">
                                  {canEditTimestamp && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartEditTimestamp(
                                          link.id,
                                          link.startSeconds
                                        )
                                      }
                                      aria-label={`Edit start timestamp for ${link.label}`}
                                      title="Edit start timestamp"
                                      className="w-7 h-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                                    >
                                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onDeletePersonalLink(course.id, link.id)
                                    }
                                    aria-label={`Delete custom link ${link.label}`}
                                    title="Delete custom resource"
                                    className="w-7 h-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>

                              {isEditingTs && (
                                <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label
                                      htmlFor={`edit-ts-${link.id}`}
                                      className="text-[11px] font-medium text-slate-600"
                                    >
                                      Start timestamp:
                                    </label>
                                    <input
                                      id={`edit-ts-${link.id}`}
                                      type="text"
                                      value={editingTsValue}
                                      onChange={(e) => {
                                        setEditingTsValue(e.target.value);
                                        if (editingTsError) setEditingTsError('');
                                      }}
                                      placeholder="MM:SS or HH:MM:SS"
                                      className="w-36 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditedTimestamp(link.id)}
                                      className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md cursor-pointer"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTsLinkId(null);
                                        setEditingTsError('');
                                      }}
                                      className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  {editingTsError && (
                                    <p className="text-[11px] text-red-600">
                                      {editingTsError}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Personal study notes */}
          <div>
            <label
              htmlFor="course-personal-notes"
              className="block font-display text-sm font-semibold text-slate-900 mb-2"
            >
              Personal Study Notes
            </label>
            <textarea
              id="course-personal-notes"
              rows={4}
              value={progress.notes}
              onChange={(e) => onUpdateNotes(course.id, e.target.value)}
              placeholder={`Add personal takeaways, dataset observations, or study reminders for ${course.title}...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Saved automatically to browser local storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
