"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addTest, deleteTest, updateTest } from "./services";
import { addRemark, deleteRemark } from "./services";
import { addTask, completeTask, deleteTask } from "./services";
import type { Subject, TestType } from "@/types";

export async function addTestAction(formData: FormData): Promise<void> {
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const correct = parseInt(formData.get("correct") as string);
  const total = parseInt(formData.get("total") as string);

  await addTest({ date, type, subject, platform, correct, total });
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
  const date = formData.get("date") as string;
  const type = formData.get("type") as TestType;
  const subject = formData.get("subject") as Subject;
  const platform = formData.get("platform") as string;
  const correct = parseInt(formData.get("correct") as string);
  const total = parseInt(formData.get("total") as string);

  await updateTest(id, { date, type, subject, platform, correct, total });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/tests");
  revalidatePath("/analytics");
  revalidatePath(`/day/${date}`);
}

export async function deleteTestAction(id: string, date: string): Promise<void> {
  await deleteTest(id);
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
  const remark = formData.get("remark") as string;
  await addRemark(date, remark);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${date}`);
}

export async function deleteRemarkAction(
  date: string,
  index: number
): Promise<void> {
  await deleteRemark(date, index);
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${date}`);
}

export async function addTaskAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const sourceDate = formData.get("sourceDate") as string;
  const targetDate = formData.get("targetDate") as string;

  await addTask({ title, sourceDate, targetDate });
  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath(`/day/${sourceDate}`);
  revalidatePath(`/day/${targetDate}`);
}

export async function completeTaskAction(id: string): Promise<void> {
  await completeTask(id);
  revalidatePath("/");
  revalidatePath("/calendar");
}

export async function deleteTaskAction(id: string): Promise<void> {
  await deleteTask(id);
  revalidatePath("/");
  revalidatePath("/calendar");
}
