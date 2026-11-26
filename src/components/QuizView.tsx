import { ArrowLeft, ArrowRight, Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getQuizById, LMS_QUIZZES } from '../data/lmsQuizzes';
import { LmsLocalState } from '../types/academy';

interface QuizViewProps {
  quizId?: string;
  state: LmsLocalState;
  onSubmitQuiz: (quizId: string, selectedAnswers: Record<string, number>) => void;
}

export function QuizView({ quizId, state, onSubmitQuiz }: QuizViewProps) {
  const quiz = quizId ? getQuizById(quizId) : undefined;
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!quiz) {
      setSelectedAnswers({});
      setShowReview(false);
      return;
    }
    const prev = state.quizResults[quiz.id];
    if (prev && Object.keys(prev.lastAnswers).length > 0) {
      setSelectedAnswers(prev.lastAnswers);
      setShowReview(true);
    } else {
      setSelectedAnswers({});
      setShowReview(false);
    }
  }, [quiz?.id]);

  if (!quiz) {
    const moduleQuizzes = LMS_QUIZZES.filter((q) => !q.isCapstone);
    const capstone = LMS_QUIZZES.find((q) => q.isCapstone);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            Graded Knowledge Checks &amp; Capstone
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Assessments
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Score 80% or higher on every module quiz and the 12-question Final Job-Readiness Capstone
            Assessment. Every submission includes full answer explanations.
          </p>
        </div>

        {capstone && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>Final Job-Readiness Assessment</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {capstone.title}
              </h2>
              <p className="text-sm text-slate-600">{capstone.subtitle}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              {state.quizResults[capstone.id] && (
                <div className="text-sm tabular-nums">
                  <p className="font-semibold text-slate-900">
                    Best: {state.quizResults[capstone.id].bestScorePercent}%
                  </p>
                  <p
                    className={`text-xs ${
                      state.quizResults[capstone.id].passed
                        ? 'text-emerald-700 font-medium'
                        : 'text-amber-700 font-medium'
                    }`}
                  >
                    {state.quizResults[capstone.id].passed ? 'Passed' : 'Retry Needed'} ·{' '}
                    {state.quizResults[capstone.id].attempts} attempt(s)
                  </p>
                </div>
              )}
              <a
                href={`#/quiz/${capstone.id}`}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                <span>
                  {state.quizResults[capstone.id] ? 'Review or Retake Capstone' : 'Start Capstone'}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {moduleQuizzes.map((q) => {
            const rec = state.quizResults[q.id];
            return (
              <article
                key={q.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 tabular-nums">
                    {q.questions.length} questions · {q.passingPercent}% pass
                  </p>
                  <h3 className="font-display text-base font-semibold text-slate-900">{q.title}</h3>
                  <p className="text-sm text-slate-600">{q.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      rec?.passed
                        ? 'text-emerald-700'
                        : rec
                          ? 'text-amber-700'
                          : 'text-slate-500'
                    }`}
                  >
                    {rec
                      ? `Best ${rec.bestScorePercent}% · ${rec.passed ? 'Passed' : 'Retry'}`
                      : 'Not attempted'}
                  </span>
                  <a
                    href={`#/quiz/${q.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <span>{rec ? 'Review / Retake' : 'Take Quiz'}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const answeredCount = quiz.questions.filter((q) => selectedAnswers[q.id] !== undefined).length;
  const allAnswered = answeredCount === totalQuestions;
  const savedResult = state.quizResults[quiz.id];

  const handleSubmit = () => {
    if (!allAnswered) return;
    onSubmitQuiz(quiz.id, selectedAnswers);
    setShowReview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setShowReview(false);
  };

  let lastCorrectCount = 0;
  if (showReview) {
    for (const q of quiz.questions) {
      if (selectedAnswers[q.id] === q.correctIndex) {
        lastCorrectCount += 1;
      }
    }
  }
  const currentScorePct =
    showReview && totalQuestions > 0 ? Math.round((lastCorrectCount / totalQuestions) * 100) : 0;
  const currentPassed = currentScorePct >= quiz.passingPercent;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <a
          href="#/quiz"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>All Assessments</span>
        </a>
        {quiz.moduleId && (
          <a
            href={`#/module/${quiz.moduleId}`}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Back to Module Overview
          </a>
        )}
      </div>

      {/* Header */}
      <header className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
            {quiz.isCapstone ? 'Final Capstone Assessment' : 'Graded Module Quiz'} ·{' '}
            {totalQuestions} Questions · {quiz.passingPercent}% Pass
          </p>
          {savedResult && (
            <span className="text-xs font-medium text-slate-600 tabular-nums">
              Attempts: {savedResult.attempts} · Best Score: {savedResult.bestScorePercent}%
            </span>
          )}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">{quiz.title}</h1>
        <p className="text-sm text-slate-600">{quiz.subtitle}</p>
      </header>

      {/* Graded Result Banner */}
      {showReview && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            currentPassed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-display text-lg font-bold tabular-nums">
              {currentPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-700" aria-hidden="true" />
              )}
              <span>
                Score: {currentScorePct}% ({lastCorrectCount} / {totalQuestions} correct) —{' '}
                {currentPassed ? 'Passed' : `Needs Review (${quiz.passingPercent}% required)`}
              </span>
            </div>
            <p className="text-sm opacity-90">
              {currentPassed
                ? 'Strong analytical reasoning. Review the explanations below or advance to the next module.'
                : 'Review each explanation below, revisit the module lessons if needed, and retake the quiz anytime.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Retake Assessment</span>
          </button>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {quiz.questions.map((q, qIdx) => {
          const picked = selectedAnswers[q.id];
          const isCorrect = showReview && picked === q.correctIndex;

          return (
            <article
              key={q.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 tabular-nums">
                <span className="font-semibold text-slate-700">
                  Question {qIdx + 1} of {totalQuestions} · {q.topicTag}
                </span>
                {showReview && (
                  <span
                    className={`font-semibold ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              <h2 className="font-display text-base font-semibold text-slate-900 leading-snug">
                {q.prompt}
              </h2>

              {q.codeSnippet && (
                <pre className="font-mono text-xs bg-slate-900 text-slate-100 rounded-lg p-3.5 overflow-x-auto leading-relaxed">
                  <code>{q.codeSnippet}</code>
                </pre>
              )}

              <div className="space-y-2" role="radiogroup" aria-label={`Question ${qIdx + 1}`}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = picked === optIdx;
                  const isCorrectOpt = showReview && optIdx === q.correctIndex;
                  const isWrongPick = showReview && isSelected && optIdx !== q.correctIndex;

                  let styleClass =
                    'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                  if (isCorrectOpt) {
                    styleClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium';
                  } else if (isWrongPick) {
                    styleClass = 'bg-red-50 border-red-300 text-red-950';
                  } else if (isSelected) {
                    styleClass = 'bg-blue-50 border-blue-400 text-blue-950 font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={showReview}
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [q.id]: optIdx,
                        }))
                      }
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-start gap-3 ${
                        showReview ? 'cursor-default' : 'cursor-pointer'
                      } ${styleClass}`}
                    >
                      <span className="font-mono text-xs mt-0.5 shrink-0">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showReview && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Submit Bar */}
      {!showReview && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-600 tabular-nums">
            Answered {answeredCount} of {totalQuestions} questions
          </p>
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              allAnswered
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {allAnswered
              ? 'Submit & Grade Assessment'
              : `Answer ${totalQuestions - answeredCount} more to submit`}
          </button>
        </div>
      )}
    </div>
  );
}
