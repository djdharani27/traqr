import { v4 as uuid } from "uuid";
import type { Test, StudyDay, Task, Subject } from "@/types";
import { readJson, writeJson, findById } from "./storage";

const TESTS_FILE = "tests.json";
const STUDY_DAYS_FILE = "study-days.json";
const TASKS_FILE = "tasks.json";

// ─── Tests ────────────────────────────────────────────────────────

export async function getTests(date?: string): Promise<Test[]> {
  const tests = await readJson<Test>(TESTS_FILE);
  if (date) return tests.filter((t) => t.date === date);
  return tests;
}

export async function getTestsBySubject(subject: Subject): Promise<Test[]> {
  const tests = await readJson<Test>(TESTS_FILE);
  return tests.filter((t) => t.subject === subject);
}

export async function addTest(
  data: Omit<Test, "id" | "percentage">
): Promise<Test> {
  const tests = await readJson<Test>(TESTS_FILE);
  const percentage = Math.round((data.correct / data.total) * 100);
  const test: Test = { id: uuid(), ...data, percentage };
  tests.push(test);
  await writeJson(TESTS_FILE, tests);
  return test;
}

export async function updateTest(
  id: string,
  data: Partial<Omit<Test, "id">>
): Promise<Test> {
  const tests = await readJson<Test>(TESTS_FILE);
  const index = tests.findIndex((t) => t.id === id);
  if (index === -1) throw new Error(`Test ${id} not found`);

  const updated = { ...tests[index], ...data };
  if (data.correct !== undefined || data.total !== undefined) {
    updated.percentage = Math.round(
      (updated.correct / updated.total) * 100
    );
  }
  tests[index] = updated;
  await writeJson(TESTS_FILE, tests);
  return updated;
}

export async function deleteTest(id: string): Promise<void> {
  const tests = await readJson<Test>(TESTS_FILE);
  await writeJson(
    TESTS_FILE,
    tests.filter((t) => t.id !== id)
  );
}

export async function searchTests(query: string): Promise<Test[]> {
  const tests = await readJson<Test>(TESTS_FILE);
  const q = query.toLowerCase();
  return tests.filter(
    (t) =>
      t.date.includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.platform.toLowerCase().includes(q)
  );
}

// ─── Study Days / Remarks ─────────────────────────────────────────

export async function getStudyDay(date: string): Promise<StudyDay | null> {
  const days = await readJson<StudyDay>(STUDY_DAYS_FILE);
  return days.find((d) => d.date === date) ?? null;
}

export async function getOrCreateStudyDay(date: string): Promise<StudyDay> {
  const days = await readJson<StudyDay>(STUDY_DAYS_FILE);
  let day = days.find((d) => d.date === date);
  if (!day) {
    day = { id: uuid(), date, remarks: [] };
    days.push(day);
    await writeJson(STUDY_DAYS_FILE, days);
  }
  return day;
}

export async function addRemark(
  date: string,
  remark: string
): Promise<StudyDay> {
  const days = await readJson<StudyDay>(STUDY_DAYS_FILE);
  let day = days.find((d) => d.date === date);
  if (!day) {
    day = { id: uuid(), date, remarks: [remark] };
    days.push(day);
  } else {
    day.remarks.push(remark);
  }
  await writeJson(STUDY_DAYS_FILE, days);
  return day;
}

export async function deleteRemark(
  date: string,
  remarkIndex: number
): Promise<StudyDay> {
  const days = await readJson<StudyDay>(STUDY_DAYS_FILE);
  const day = days.find((d) => d.date === date);
  if (!day) throw new Error(`Study day ${date} not found`);
  day.remarks.splice(remarkIndex, 1);
  await writeJson(STUDY_DAYS_FILE, days);
  return day;
}

export async function getAllStudyDays(): Promise<StudyDay[]> {
  return readJson<StudyDay>(STUDY_DAYS_FILE);
}

// ─── Tasks ────────────────────────────────────────────────────────

export async function getTasksByTargetDate(date: string): Promise<Task[]> {
  const tasks = await readJson<Task>(TASKS_FILE);
  return tasks.filter((t) => t.targetDate === date);
}

export async function getAllTasks(): Promise<Task[]> {
  return readJson<Task>(TASKS_FILE);
}

export async function addTask(
  data: Omit<Task, "id" | "completed">
): Promise<Task> {
  const tasks = await readJson<Task>(TASKS_FILE);
  const task: Task = { id: uuid(), ...data, completed: false };
  tasks.push(task);
  await writeJson(TASKS_FILE, tasks);
  return task;
}

export async function completeTask(id: string): Promise<Task> {
  const tasks = await readJson<Task>(TASKS_FILE);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error(`Task ${id} not found`);
  tasks[index].completed = !tasks[index].completed;
  await writeJson(TASKS_FILE, tasks);
  return tasks[index];
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await readJson<Task>(TASKS_FILE);
  await writeJson(
    TASKS_FILE,
    tasks.filter((t) => t.id !== id)
  );
}
