import { getAdminDb } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { Query } from "firebase-admin/firestore";
import type { Test, StudyDay, Task, Subject } from "@/types";

const TESTS_COL = "tests";
const STUDY_DAYS_COL = "studyDays";
const TASKS_COL = "tasks";

function db() {
  return getAdminDb();
}

function arrayUnion(...elements: string[]) {
  return FieldValue.arrayUnion(...elements);
}

// ─── Tests ────────────────────────────────────────────────────────

export async function getTests(
  userId: string,
  date?: string
): Promise<Test[]> {
  const baseQuery: Query = db()
    .collection(TESTS_COL)
    .where("userId", "==", userId);

  if (date) {
    const snapshot = await baseQuery.where("date", "==", date).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Test[];
  }

  const snapshot = await baseQuery.get();
  const tests = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Test[];
  return tests.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTestsBySubject(
  userId: string,
  subject: Subject
): Promise<Test[]> {
  const snapshot = await db()
    .collection(TESTS_COL)
    .where("userId", "==", userId)
    .where("subject", "==", subject)
    .get();

  const tests = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Test[];
  return tests.sort((a, b) => b.date.localeCompare(a.date));
}

export async function addTest(
  userId: string,
  data: Omit<Test, "id" | "percentage">
): Promise<Test> {
  const percentage = Math.round((data.correct / data.total) * 100);
  const now = new Date().toISOString();
  const docRef = await db().collection(TESTS_COL).add({
    userId,
    ...data,
    percentage,
    createdAt: now,
    updatedAt: now,
  });
  return { id: docRef.id, ...data, percentage };
}

export async function updateTest(
  userId: string,
  id: string,
  data: Partial<Omit<Test, "id">>
): Promise<Test> {
  const docRef = db().collection(TESTS_COL).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error(`Test ${id} not found`);

  const docData = doc.data()!;
  const existing = { id: doc.id, ...docData } as Test;

  const updated = {
    ...existing,
    ...data,
    percentage:
      data.correct !== undefined || data.total !== undefined
        ? Math.round(
            (
              (data.correct ?? existing.correct) /
              (data.total ?? existing.total)
            ) * 100
          )
        : existing.percentage,
  };

  await docRef.update({
    date: updated.date,
    type: updated.type,
    subject: updated.subject,
    platform: updated.platform,
    correct: updated.correct,
    total: updated.total,
    percentage: updated.percentage,
    updatedAt: new Date().toISOString(),
  });

  return updated;
}

export async function deleteTest(
  userId: string,
  id: string
): Promise<void> {
  await db().collection(TESTS_COL).doc(id).delete();
}

export async function searchTests(
  userId: string,
  query: string
): Promise<Test[]> {
  const snapshot = await db()
    .collection(TESTS_COL)
    .where("userId", "==", userId)
    .get();

  const q = query.toLowerCase();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Test))
    .filter(
      (t) =>
        t.date.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.platform.toLowerCase().includes(q)
    );
}

// ─── Study Days / Remarks ─────────────────────────────────────────

export async function getStudyDay(
  userId: string,
  date: string
): Promise<StudyDay | null> {
  const snapshot = await db()
    .collection(STUDY_DAYS_COL)
    .where("userId", "==", userId)
    .where("date", "==", date)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as StudyDay;
}

export async function getOrCreateStudyDay(
  userId: string,
  date: string
): Promise<StudyDay> {
  const existing = await getStudyDay(userId, date);
  if (existing) return existing;

  const now = new Date().toISOString();
  const docRef = await db().collection(STUDY_DAYS_COL).add({
    userId,
    date,
    remarks: [],
    createdAt: now,
    updatedAt: now,
  });

  return { id: docRef.id, date, remarks: [] };
}

export async function addRemark(
  userId: string,
  date: string,
  remarkText: string
): Promise<StudyDay> {
  const day = await getStudyDay(userId, date);

  if (!day) {
    const now = new Date().toISOString();
    const docRef = await db().collection(STUDY_DAYS_COL).add({
      userId,
      date,
      remarks: [remarkText],
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, date, remarks: [remarkText] };
  }

  await db()
    .collection(STUDY_DAYS_COL)
    .doc(day.id)
    .update({
      remarks: arrayUnion(remarkText),
      updatedAt: new Date().toISOString(),
    });

  return { ...day, remarks: [...day.remarks, remarkText] };
}

export async function deleteRemark(
  userId: string,
  date: string,
  remarkIndex: number
): Promise<StudyDay> {
  const day = await getStudyDay(userId, date);
  if (!day) throw new Error(`Study day ${date} not found`);
  if (remarkIndex < 0 || remarkIndex >= day.remarks.length) {
    throw new Error(`Remark index ${remarkIndex} out of bounds`);
  }

  const updatedRemarks = day.remarks.filter(
    (_, i) => i !== remarkIndex
  );

  await db()
    .collection(STUDY_DAYS_COL)
    .doc(day.id)
    .update({
      remarks: updatedRemarks,
      updatedAt: new Date().toISOString(),
    });

  return { ...day, remarks: updatedRemarks };
}

export async function getAllStudyDays(
  userId: string
): Promise<StudyDay[]> {
  const snapshot = await db()
    .collection(STUDY_DAYS_COL)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StudyDay[];
}

// ─── Tasks ────────────────────────────────────────────────────────

export async function getTasksByTargetDate(
  userId: string,
  date: string
): Promise<Task[]> {
  const snapshot = await db()
    .collection(TASKS_COL)
    .where("userId", "==", userId)
    .where("targetDate", "==", date)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
}

export async function getAllTasks(userId: string): Promise<Task[]> {
  const snapshot = await db()
    .collection(TASKS_COL)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
}

export async function addTask(
  userId: string,
  data: Omit<Task, "id" | "completed">
): Promise<Task> {
  const now = new Date().toISOString();
  const docRef = await db().collection(TASKS_COL).add({
    userId,
    ...data,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });

  return { id: docRef.id, ...data, completed: false };
}

export async function completeTask(
  userId: string,
  id: string
): Promise<Task> {
  const docRef = db().collection(TASKS_COL).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error(`Task ${id} not found`);

  const data = doc.data() as Task;
  const newCompleted = !data.completed;
  await docRef.update({
    completed: newCompleted,
    updatedAt: new Date().toISOString(),
  });

  return { ...data, id: doc.id, completed: newCompleted };
}

export async function deleteTask(
  userId: string,
  id: string
): Promise<void> {
  await db().collection(TASKS_COL).doc(id).delete();
}
