import {
  getTests as fsGetTests,
  getTestsBySubject as fsGetTestsBySubject,
  addTest as fsAddTest,
  updateTest as fsUpdateTest,
  deleteTest as fsDeleteTest,
  searchTests as fsSearchTests,
  getStudyDay as fsGetStudyDay,
  getOrCreateStudyDay as fsGetOrCreateStudyDay,
  addRemark as fsAddRemark,
  deleteRemark as fsDeleteRemark,
  getAllStudyDays as fsGetAllStudyDays,
  getTasksByTargetDate as fsGetTasksByTargetDate,
  getAllTasks as fsGetAllTasks,
  addTask as fsAddTask,
  completeTask as fsCompleteTask,
  deleteTask as fsDeleteTask,
} from "./firestore";

import type { Test, StudyDay, Task, Subject } from "@/types";

export { type Test, type StudyDay, type Task, type Subject };

// ─── Tests ────────────────────────────────────────────────────────

export async function getTests(
  userId: string,
  date?: string
): Promise<Test[]> {
  return fsGetTests(userId, date);
}

export async function getTestsBySubject(
  userId: string,
  subject: Subject
): Promise<Test[]> {
  return fsGetTestsBySubject(userId, subject);
}

export async function addTest(
  userId: string,
  data: Omit<Test, "id" | "percentage">
): Promise<Test> {
  return fsAddTest(userId, data);
}

export async function updateTest(
  userId: string,
  id: string,
  data: Partial<Omit<Test, "id">>
): Promise<Test> {
  return fsUpdateTest(userId, id, data);
}

export async function deleteTest(userId: string, id: string): Promise<void> {
  return fsDeleteTest(userId, id);
}

export async function searchTests(
  userId: string,
  query: string
): Promise<Test[]> {
  return fsSearchTests(userId, query);
}

// ─── Study Days / Remarks ─────────────────────────────────────────

export async function getStudyDay(
  userId: string,
  date: string
): Promise<StudyDay | null> {
  return fsGetStudyDay(userId, date);
}

export async function getOrCreateStudyDay(
  userId: string,
  date: string
): Promise<StudyDay> {
  return fsGetOrCreateStudyDay(userId, date);
}

export async function addRemark(
  userId: string,
  date: string,
  remark: string
): Promise<StudyDay> {
  return fsAddRemark(userId, date, remark);
}

export async function deleteRemark(
  userId: string,
  date: string,
  remarkIndex: number
): Promise<StudyDay> {
  return fsDeleteRemark(userId, date, remarkIndex);
}

export async function getAllStudyDays(userId: string): Promise<StudyDay[]> {
  return fsGetAllStudyDays(userId);
}

// ─── Tasks ────────────────────────────────────────────────────────

export async function getTasksByTargetDate(
  userId: string,
  date: string
): Promise<Task[]> {
  return fsGetTasksByTargetDate(userId, date);
}

export async function getAllTasks(userId: string): Promise<Task[]> {
  return fsGetAllTasks(userId);
}

export async function addTask(
  userId: string,
  data: Omit<Task, "id" | "completed">
): Promise<Task> {
  return fsAddTask(userId, data);
}

export async function completeTask(userId: string, id: string): Promise<Task> {
  return fsCompleteTask(userId, id);
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  return fsDeleteTask(userId, id);
}
