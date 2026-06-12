export type TestType = "sectional" | "overall";
export type Subject = "Math" | "Reasoning" | "GK" | "English" | "Overall";

export interface TestSubjectScores {
  mathCorrect: number;
  mathTotal: number;
  reasoningCorrect: number;
  reasoningTotal: number;
  gkCorrect: number;
  gkTotal: number;
  englishCorrect: number;
  englishTotal: number;
}

export interface Test {
  id: string;
  date: string;
  type: TestType;
  subject: Subject;
  platform: string;
  correct: number;
  total: number;
  percentage: number;
  remark?: string;
  subjectScores?: TestSubjectScores;
}

export interface StudyDay {
  id: string;
  date: string;
  remarks: string[];
}

export interface Task {
  id: string;
  title: string;
  sourceDate: string;
  targetDate: string;
  completed: boolean;
  classicCycle?: boolean;
  parentTaskId?: string;
  cycleNumber?: number;
  skipped?: boolean;
}
