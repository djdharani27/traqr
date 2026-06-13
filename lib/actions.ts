"use server";

import { revalidatePath } from "next/cache";
import {
  addTest,
  deleteTest,
  updateTest,
  addRemark,
  deleteRemark,
  addTask,
  completeTask,
  deleteTask,
  skipTask,
} from "./services";
import { requireUser } from "./auth-server";
import { calculateMarks, calculateUnanswered } from "./calculations";
import type { Subject, TestType, TestSubjectScores, TestRemark, SectionScore } from "@/types";

const SUBJECTS: Subject[] = ["Math", "Reasoning", "GK", "English"];

function parseSectionScore(formData: FormData, prefix: string): SectionScore {
  const correct = parseInt(formData.get(`${prefix}Correct`) as string) || 0;
  const incorrect = parseInt(formData.get(`${prefix}Incorrect`) as string) || 0;
  const total = parseInt(formData.get(`${prefix}Total`) as string) || 25;
  return { correct, incorrect, total };
}

function parseSubjectScores(formData: FormData): TestSubjectScores | undefined {
  const mathTotal = formData.get("mathTotal") as string;
  if (!mathTotal && mathTotal !== "0") return undefined;
  return {
    math: parseSectionScore(formData, "math"),
    reasoning: parseSectionScore(formData, "reasoning"),
    gk: parseSectionScore(formData, "gk"),
    english: parseSectionScore(formData, "english"),
  };
}

function parseRemarks(formData: FormData, subject?: Subject): TestRemark[] {
  const remarks: TestRemark[] = [];
  // overall remarks (subject-specific)
  if (subject) {
    formData.getAll("remarkText").forEach((text) => {
      const t = text as string;
      if (t.trim()) remarks.push({ text: t.trim(), subject });
    });
  }
  // subject-wise remarks
  for (const subj of SUBJECTS) {
    formData.getAll(`remark_${subj}`).forEach((text) => {
      const t = text as string;
      if (t.trim()) remarks.push({ text: t.trim(), subject: subj });
    });
  }
  return remarks;
}

function computeOverallMarks(subjectScores: TestSubjectScores): {
  correct: number;
  incorrect: number;
  total: number;
  unanswered: number;
  marks: number;
} {
  let correct = 0;
  let incorrect = 0;
  let total = 0;
  for (const subj of SUBJECTS) {
    const s = subjectScores[subj.toLowerCase() as keyof TestSubjectScores];
    correct += s.correct;
    incorrect += s.incorrect;
    total += s.total;
  }
  const unanswered = calculateUnanswered(total, correct, incorrect);
  const marks = calculateMarks(correct, incorrect);
  return { correct, incorrect, total, unanswered, marks };
}

export async function addTestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const subjectScores = parseSubjectScores(formData);

  let correct: number;
  let incorrect: number;
  let total: number;
  let unanswered: number;
  let marks: number;

  if (type === "overall" && subjectScores) {
    const overall = computeOverallMarks(subjectScores);
    correct = overall.correct;
    incorrect = overall.incorrect;
    total = overall.total;
    unanswered = overall.unanswered;
    marks = overall.marks;
  } else {
    correct = parseInt(formData.get("correct") as string) || 0;
    incorrect = parseInt(formData.get("incorrect") as string) || 0;
    total = parseInt(formData.get("total") as string) || 25;
    unanswered = calculateUnanswered(total, correct, incorrect);
    marks = calculateMarks(correct, incorrect);
  }

  const remark = (formData.get("remark") as string) || undefined;
  const remarks = parseRemarks(formData, type === "sectional" ? subject : undefined);

  await addTest(user.uid, {
    date, type, subject, platform,
    correct, incorrect, total, unanswered, marks,
    remark, remarks, subjectScores,
  });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath("/remarks");
  revalidatePath(`/day/${date}`);
}

export async function updateTestAction(
  id: string,
  formData: FormData
): Promise<void> {
  const user = await requireUser();
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const subjectScores = parseSubjectScores(formData);

  let correct: number;
  let incorrect: number;
  let total: number;
  let unanswered: number;
  let marks: number;

  if (type === "overall" && subjectScores) {
    const overall = computeOverallMarks(subjectScores);
    correct = overall.correct;
    incorrect = overall.incorrect;
    total = overall.total;
    unanswered = overall.unanswered;
    marks = overall.marks;
  } else {
    correct = parseInt(formData.get("correct") as string) || 0;
    incorrect = parseInt(formData.get("incorrect") as string) || 0;
    total = parseInt(formData.get("total") as string) || 25;
    unanswered = calculateUnanswered(total, correct, incorrect);
    marks = calculateMarks(correct, incorrect);
  }

  const remark = (formData.get("remark") as string) || undefined;
  const remarks = parseRemarks(formData, type === "sectional" ? subject : undefined);

  await updateTest(user.uid, id, {
    date, type, subject, platform,
    correct, incorrect, total, unanswered, marks,
    remark, remarks, subjectScores,
  });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath("/remarks");
  revalidatePath(`/day/${date}`);
}

export async function deleteTestAction(id: string, date: string): Promise<void> {
  const user = await requireUser();
  await deleteTest(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath("/remarks");
  revalidatePath(`/day/${date}`);
}

export async function addRemarkAction(
  date: string,
  formData: FormData
): Promise<void> {
  const user = await requireUser();
  const remarks = formData.getAll("remark") as string[];
  for (const remark of remarks) {
    const trimmed = remark.trim();
    if (trimmed) {
      await addRemark(user.uid, date, trimmed);
    }
  }
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/remarks");
  revalidatePath(`/day/${date}`);
}

export async function deleteRemarkAction(
  date: string,
  index: number
): Promise<void> {
  const user = await requireUser();
  await deleteRemark(user.uid, date, index);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${date}`);
}

export async function addTaskAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const title = formData.get("title") as string;
  const sourceDate = formData.get("sourceDate") as string;
  const targetDate = formData.get("targetDate") as string;
  const classicCycle = formData.get("classicCycle") === "true";

  await addTask(user.uid, {
    title,
    sourceDate,
    targetDate,
    classicCycle,
    cycleNumber: classicCycle ? 0 : undefined,
  });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${sourceDate}`);
  revalidatePath(`/day/${targetDate}`);
}

export async function completeTaskAction(id: string): Promise<void> {
  const user = await requireUser();
  await completeTask(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
}

export async function skipTaskAction(id: string): Promise<void> {
  const user = await requireUser();
  await skipTask(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
}

export async function deleteTaskAction(id: string): Promise<void> {
  const user = await requireUser();
  await deleteTask(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
}
