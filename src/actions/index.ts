// Actions for the user workspace. The page calls them over RPC, so a task can be
// marked done without the page reloading — the server stays the source of truth and
// answers with the new state.
import type { ActionAPIContext } from "astro:actions";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import bcrypt from "bcryptjs";
import { getSession } from "auth-astro/server";
import {
  completeOccurrence,
  createActivity,
  createAssignments,
  createPost,
  createUser,
  deleteActivity,
  deleteAssignment,
  deleteAssignmentActivity,
  deletePost,
  deleteUser,
  setOccurrenceNote,
  taskStats,
  undoOccurrence,
  updateActivity,
  updatePost,
} from "../lib/db";
import { DEFAULT_USER_PASSWORD } from "../lib/defaults";
import { NOTE_MAX, parseNoteValues } from "../lib/notes";
import { PERIODES, parseActivityValues } from "../lib/activities";

/** The signed-in user, or a 401 — an action runs on the server, so it checks itself. */
async function currentUserId(context: ActionAPIContext): Promise<number> {
  const session = await getSession(context.request);
  const id = Number(session?.user?.id);
  if (!session || !Number.isInteger(id)) {
    throw new ActionError({ code: "UNAUTHORIZED", message: "Sesi Anda sudah berakhir." });
  }
  return id;
}

/** The signed-in admin, or a 401/403. */
async function currentAdminId(context: ActionAPIContext): Promise<number> {
  const session = await getSession(context.request);
  const id = Number(session?.user?.id);
  if (!session || !Number.isInteger(id)) {
    throw new ActionError({ code: "UNAUTHORIZED", message: "Sesi Anda sudah berakhir." });
  }
  if (session.user?.role !== 0) {
    throw new ActionError({ code: "FORBIDDEN", message: "Hanya admin yang bisa melakukan ini." });
  }
  return id;
}

const occurrence = z.object({
  activityId: z.number().int().positive(),
  periodKey: z.string().min(1).max(40),
});

export const server = {
  /** Tandai satu kemunculan selesai. */
  completeTask: defineAction({
    input: occurrence,
    handler: async (input, context) => {
      const userId = await currentUserId(context);
      const result = completeOccurrence(userId, input.activityId, input.periodKey);
      if (result === "invalid") {
        throw new ActionError({ code: "NOT_FOUND", message: "Kemunculan tugas ini tidak ada." });
      }
      return { result, stats: taskStats(userId) };
    },
  }),

  /** Batalkan tanda selesai. */
  undoTask: defineAction({
    input: occurrence,
    handler: async (input, context) => {
      const userId = await currentUserId(context);
      const result = undoOccurrence(userId, input.activityId, input.periodKey);
      if (!result) {
        throw new ActionError({ code: "NOT_FOUND", message: "Tanda selesai ini tidak ada." });
      }
      return { result, stats: taskStats(userId) };
    },
  }),

  /** Simpan (atau hapus) catatan & tautan satu kemunculan. */
  saveNote: defineAction({
    input: occurrence.extend({
      note: z.string().max(NOTE_MAX),
      link: z.string().max(2000),
    }),
    handler: async (input, context) => {
      const userId = await currentUserId(context);
      const parsed = parseNoteValues(input.note, input.link);
      if ("error" in parsed) {
        throw new ActionError({ code: "BAD_REQUEST", message: parsed.error });
      }
      const removed = setOccurrenceNote(
        userId,
        input.activityId,
        input.periodKey,
        parsed.value.note,
        parsed.value.link,
      );
      return { removed, stats: taskStats(userId) };
    },
  }),

  // -------------------------------------------------------------------------
  // Admin: penugasan
  // -------------------------------------------------------------------------

  /** Beri satu user sejumlah aktivitas. */
  assignActivities: defineAction({
    input: z.object({
      userId: z.number().int().positive(),
      activityIds: z.array(z.number().int().positive()).min(1),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const added = createAssignments(input.userId, input.activityIds);
      return { added };
    },
  }),

  /** Lepas satu aktivitas dari satu user. */
  removeActivity: defineAction({
    input: z.object({
      userId: z.number().int().positive(),
      activityId: z.number().int().positive(),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      deleteAssignmentActivity(input.userId, input.activityId);
      return {};
    },
  }),

  /** Lepas semua penugasan seorang user. */
  clearAssignments: defineAction({
    input: z.object({ userId: z.number().int().positive() }),
    handler: async (input, context) => {
      await currentAdminId(context);
      deleteAssignment(input.userId);
      return {};
    },
  }),

  // -------------------------------------------------------------------------
  // Admin: pengguna
  // -------------------------------------------------------------------------

  /** Buat akun baru dengan kata sandi default. */
  createUserAccount: defineAction({
    input: z.object({
      name: z.string().min(2).max(160),
      email: z.email().max(200),
      role: z.number().int().min(1).max(2),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const email = input.email.toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Format email tidak valid." });
      }
      try {
        createUser(
          input.name.trim(),
          email,
          await bcrypt.hash(DEFAULT_USER_PASSWORD, 10),
          input.role === 2 ? 2 : 1,
        );
      } catch {
        throw new ActionError({ code: "CONFLICT", message: "Email sudah terdaftar." });
      }
      return {};
    },
  }),

  /** Hapus satu akun (selain akun sendiri). */
  deleteUserAccount: defineAction({
    input: z.object({ id: z.number().int().positive() }),
    handler: async (input, context) => {
      const adminId = await currentAdminId(context);
      if (input.id === adminId) {
        throw new ActionError({ code: "FORBIDDEN", message: "Akun sendiri tidak bisa dihapus." });
      }
      deleteUser(input.id);
      return {};
    },
  }),

  // -------------------------------------------------------------------------
  // Admin: jenis aktivitas
  // -------------------------------------------------------------------------

  /** Simpan (atau ubah) satu jenis aktivitas. */
  saveActivity: defineAction({
    input: z.object({
      categoryId: z.string().min(1).max(60),
      id: z.number().int().positive().optional(),
      name: z.string().min(3).max(500),
      day: z.number().int().min(0).max(31),
      utama: z.boolean(),
      periodik: z.boolean(),
      bukan_tupoksi: z.boolean(),
      periode: z.enum([...PERIODES]),
      frequency: z.number().int().min(1).max(9999),
      minutes: z.number().int().min(1).max(9999),
      sdm: z.number().int().min(1).max(999),
      /** "YYYY-MM" baris yang disunting — baris lamabring bulan sendiri. */
      month: z.string().length(7).optional(),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const parsed = parseActivityValues(
        {
          name: input.name,
          day: input.day,
          utama: input.utama,
          periodik: input.periodik,
          bukan_tupoksi: input.bukan_tupoksi,
          periode: input.periode,
          frequency: input.frequency,
          minutes: input.minutes,
          sdm: input.sdm,
        },
        input.month,
      );
      if ("error" in parsed) {
        throw new ActionError({ code: "BAD_REQUEST", message: parsed.error });
      }
      if (input.id) {
        updateActivity(input.id, input.categoryId, parsed.value);
        return { id: input.id };
      }
      return { id: createActivity(input.categoryId, parsed.value) };
    },
  }),

  /** Hapus beberapa jenis activity satu unit. */
  deleteActivities: defineAction({
    input: z.object({
      categoryId: z.string().min(1).max(60),
      ids: z.array(z.number().int().positive()).min(1),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      for (const id of input.ids) deleteActivity(id, input.categoryId);
      return { deleted: input.ids.length };
    },
  }),

  // -------------------------------------------------------------------------
  // Admin: postingan
  // -------------------------------------------------------------------------

  /** Hapus satu postingan. */
  deletePost: defineAction({
    input: z.object({ id: z.number().int().positive() }),
    handler: async (input, context) => {
      await currentAdminId(context);
      deletePost(input.id);
      return {};
    },
  }),

  /** Terbitkan atau ubah satu postingan; jawabannya URL tujuan. */
  savePost: defineAction({
    input: z.object({
      id: z.number().int().positive().optional(),
      title: z.string().min(1).max(200),
      body: z.string().min(1).max(100_000),
    }),
    handler: async (input, context) => {
      const adminId = await currentAdminId(context);
      if (input.id) {
        updatePost(input.id, input.title.trim(), input.body.trim());
        return { url: `/dashboard/posts/${input.id}` };
      }
      const id = createPost(input.title.trim(), input.body.trim(), adminId);
      return { url: `/dashboard/posts/${id}` };
    },
  }),
};
