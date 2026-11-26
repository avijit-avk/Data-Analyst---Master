import {
  BarChart3,
  Briefcase,
  Database,
  FileSpreadsheet,
  FolderKanban,
  MessageSquareText,
  Sigma,
  Terminal,
} from 'lucide-react';
import { ModuleIconKey } from '../types/academy';

interface CourseIconProps {
  iconKey: ModuleIconKey;
  className?: string;
}

export function CourseIcon({ iconKey, className = 'w-5 h-5' }: CourseIconProps) {
  switch (iconKey) {
    case 'business':
      return <Briefcase className={className} aria-hidden="true" />;
    case 'excel':
      return <FileSpreadsheet className={className} aria-hidden="true" />;
    case 'sql':
      return <Database className={className} aria-hidden="true" />;
    case 'python':
      return <Terminal className={className} aria-hidden="true" />;
    case 'statistics':
      return <Sigma className={className} aria-hidden="true" />;
    case 'powerbi':
      return <BarChart3 className={className} aria-hidden="true" />;
    case 'projects':
      return <FolderKanban className={className} aria-hidden="true" />;
    case 'interview':
      return <MessageSquareText className={className} aria-hidden="true" />;
  }
}
