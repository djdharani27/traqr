export type TestType = "sectional" | "overall";
export type Subject = "Math" | "Reasoning" | "GK" | "English" | "Overall";

export interface SectionScore {
  correct: number;
  incorrect: number;
  total: number;
}

export interface TestSubjectScores {
  math: SectionScore;
  reasoning: SectionScore;
  gk: SectionScore;
  english: SectionScore;
}

export interface TestRemark {
  text: string;
  subject?: Subject;
}

export interface Test {
  id: string;
  date: string;
  type: TestType;
  subject: Subject;
  platform: string;
  correct: number;
  incorrect: number;
  total: number;
  unanswered: number;
  marks: number;
  percentage: number;
  remark?: string;
  remarks: TestRemark[];
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
