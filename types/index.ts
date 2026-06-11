export type TestType = "sectional" | "overall";
export type Subject = "Math" | "Reasoning" | "GK" | "English" | "Overall";

export interface Test {
  id: string;
  date: string;
  type: TestType;
  subject: Subject;
  platform: string;
  correct: number;
  total: number;
  percentage: number;
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
}
