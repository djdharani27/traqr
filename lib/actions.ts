"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth-server";
import {
  addTest,
  deleteTest,
  updateTest,
  addRemark,
  deleteRemark,
  addTask,
  completeTask,
  deleteTask,
} from "./services";
import type { Subject, TestType } from "@/types";

function requireUser(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function addTestAction(formData: FormData): Promise<void> {
  const user = requireUser(await getCurrentUser());
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const correct = parseInt(formData.get("correct") as string);
  const total = parseInt(formData.get("total") as string);

  await addTest(user.uid, { date, type, subject, platform, correct, total });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath(`/day/${date}`);
}

export async function updateTestAction(
  id: string,
  formData: FormData
): Promise<void> {
  const user = requireUser(await getCurrentUser());
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const correct = parseInt(formData.get("correct") as string);
  const total = parseInt(formData.get("total") as string);

  await updateTest(user.uid, id, { date, type, subject, platform, correct, total });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath(`/day/${date}`);
}

export async function deleteTestAction(id: string, date: string): Promise<void> {
  const user = requireUser(await getCurrentUser());
  await deleteTest(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath(`/day/${date}`);
}

export async function addRemarkAction(
  date: string,
  formData: FormData
): Promise<void> {
  const user = requireUser(await getCurrentUser());
  const remark = formData.get("remark") as string;
  await addRemark(user.uid, date, remark);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${date}`);
}

export async function deleteRemarkAction(
  date: string,
  index: number
): Promise<void> {
  const user = requireUser(await getCurrentUser());
  await deleteRemark(user.uid, date, index);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${date}`);
}

export async function addTaskAction(formData: FormData): Promise<void> {
  const user = requireUser(await getCurrentUser());
  const title = formData.get("title") as string;
  const sourceDate = formData.get("sourceDate") as string;
  const targetDate = formData.get("targetDate") as string;

  await addTask(user.uid, { title, sourceDate, targetDate });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${sourceDate}`);
  revalidatePath(`/day/${targetDate}`);
}

export async function completeTaskAction(id: string): Promise<void> {
  const user = requireUser(await getCurrentUser());
  await completeTask(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
}

export async function deleteTaskAction(id: string): Promise<void> {
  const user = requireUser(await getCurrentUser());
  await deleteTask(user.uid, id);
  revalidatePath("/");
  revalidatePath("/calendar");
}
