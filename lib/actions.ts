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
import type { Subject, TestType, TestSubjectScores } from "@/types";

function parseSubjectScores(formData: FormData): TestSubjectScores | undefined {
  const mathCorrect = formData.get("mathCorrect") as string;
  if (!mathCorrect && mathCorrect !== "0") return undefined;
  return {
    mathCorrect: parseInt(mathCorrect) || 0,
    mathTotal: parseInt(formData.get("mathTotal") as string) || 0,
    reasoningCorrect: parseInt(formData.get("reasoningCorrect") as string) || 0,
    reasoningTotal: parseInt(formData.get("reasoningTotal") as string) || 0,
    gkCorrect: parseInt(formData.get("gkCorrect") as string) || 0,
    gkTotal: parseInt(formData.get("gkTotal") as string) || 0,
    englishCorrect: parseInt(formData.get("englishCorrect") as string) || 0,
    englishTotal: parseInt(formData.get("englishTotal") as string) || 0,
  };
}

export async function addTestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const correct = parseInt(formData.get("correct") as string);
  const total = parseInt(formData.get("total") as string);
  const remark = (formData.get("remark") as string) || undefined;
  const subjectScores = parseSubjectScores(formData);

  await addTest(user.uid, { date, type, subject, platform, correct, total, remark, subjectScores });
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
  const correct = parseInt(formData.get("correct") as string);
  const total = parseInt(formData.get("total") as string);
  const remark = (formData.get("remark") as string) || undefined;
  const subjectScores = parseSubjectScores(formData);

  await updateTest(user.uid, id, { date, type, subject, platform, correct, total, remark, subjectScores });
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
  const remark = formData.get("remark") as string;
  await addRemark(user.uid, date, remark);
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
