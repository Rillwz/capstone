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
  createAssignmentsBulk,
  createCategory,
  createDirectAssignment,
  createPost,
  createPosition,
  createUser,
  dailyActivityByYear,
  deleteActivity,
  deleteAssignment,
  deleteAssignmentActivity,
  deleteCategory,
  deleteDirectAssignment,
  deletePost,
  deletePosition,
  deleteUser,
  getUserById,
  markAssignmentsSeen,
  materializeOverdue,
  setOccurrenceNote,
  taskStats,
  undoOccurrence,
  updateActivity,
  updateCategory,
  updatePosition,
  updatePost,
  updateUserAccount,
} from "../lib/db";
import { ICON_PALETTE } from "../lib/categories";
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

/**
 * Siapa yang boleh memberikan penugasan langsung: admin (level 0) dan atasan (level 1).
 * Level 2 tidak pernah boleh menugaskan.
 */
async function currentAssigner(context: ActionAPIContext): Promise<{ id: number; role: number }> {
  const session = await getSession(context.request);
  const id = Number(session?.user?.id);
  if (!session || !Number.isInteger(id)) {
    throw new ActionError({ code: "UNAUTHORIZED", message: "Sesi Anda sudah berakhir." });
  }
  const role = session.user?.role;
  if (role !== 0 && role !== 1) {
    throw new ActionError({ code: "FORBIDDEN", message: "Anda tidak berhak memberikan penugasan." });
  }
  return { id, role };
}

const occurrence = z.object({
  activityId: z.number().int().positive(),
  periodKey: z.string().min(1).max(40),
  /** Tahun grafik yang sedang dilihat, biar klien bisa menyegarkan kotaknya. */
  year: z.number().int().min(2000).max(2100).optional(),
});

/**
 * Rekap grafik untuk tahun yang sedang dilihat.
 *
 * Halaman merender ulang keadaan lewat aksi, jadi angka grafik harus sama dengan
 * yang akan muncul setelah muat ulang: periodenya yang lewat dicatat dulu.
 */
function graphState(userId: number, year?: number) {
  materializeOverdue(userId);
  return {
    stats: taskStats(userId),
    graph: year === undefined ? undefined : dailyActivityByYear(userId, year),
  };
}

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
      return { result, ...graphState(userId, input.year) };
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
      return { result, ...graphState(userId, input.year) };
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

  /** Kebalikannya: sejumlah aktivitas diberikan ke banyak user sekaligus. */
  assignActivitiesToUsers: defineAction({
    input: z.object({
      userIds: z.array(z.number().int().positive()).min(1).max(200),
      activityIds: z.array(z.number().int().positive()).min(1).max(500),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const added = createAssignmentsBulk(input.userIds, input.activityIds);
      return { added, skipped: input.userIds.length * input.activityIds.length - added };
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

  /**
   * Tandai "pekerjaan masuk" milik sesi ini sudah dibaca. Tanpa parameter userId:
   * klien tidak boleh menandai milik orang lain.
   */
  markAssignmentsSeen: defineAction({
    input: z.object({}),
    handler: async (_input, context) => {
      const userId = await currentUserId(context);
      return { seen: markAssignmentsSeen(userId) };
    },
  }),

  // -------------------------------------------------------------------------
  // Penugasan Langsung: admin & level 1.
  // -------------------------------------------------------------------------

  /**
   * Buat aktivitas master sekaligus memberikannya ke beberapa pengguna.
   * `createdBy` selalu dari sesi — klien tidak boleh mengaku-ngaku sebagai pemberi.
   */
  createDirectAssignment: defineAction({
    input: z.object({
      name: z.string().min(3).max(500),
      day: z.number().int().min(0).max(31),
      utama: z.boolean(),
      periodik: z.boolean(),
      bukan_tupoksi: z.boolean(),
      periode: z.enum([...PERIODES]),
      frequency: z.number().int().min(1).max(9999),
      minutes: z.number().int().min(1).max(9999),
      sdm: z.number().int().min(1).max(999),
      month: z.string().length(7).optional(),
      userIds: z.array(z.number().int().positive()).min(1).max(200),
    }),
    handler: async (input, context) => {
      const assigner = await currentAssigner(context);

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

      // Target hanya level 1 & 2 — admin tidak memegang penugasan, dan level 1 tidak
      // boleh menugaskan ke admin. Ditolak di server, bukan sekadar disaring di layar.
      const targets = input.userIds.filter((id) => {
        const row = getUserById(id);
        return row !== undefined && row.role !== 0;
      });
      if (targets.length === 0) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Pilih minimal satu pengguna yang sah." });
      }

      return createDirectAssignment(parsed.value, targets, assigner.id);
    },
  }),

  /** Lepas satu penugasan langsung; hanya yang memang diberikan sesi ini. */
  removeDirectAssignment: defineAction({
    input: z.object({ id: z.number().int().positive() }),
    handler: async (input, context) => {
      const assigner = await currentAssigner(context);
      const removed = deleteDirectAssignment(input.id, assigner.id);
      if (!removed) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "Penugasan ini bukan milik Anda atau sudah dilepas.",
        });
      }
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
      jabatan: z.string().max(160).optional(),
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
          input.jabatan ?? "",
        );
      } catch {
        throw new ActionError({ code: "CONFLICT", message: "Email sudah terdaftar." });
      }
      return {};
    },
  }),

  /** Ubah data satu akun: nama, email, jabatan, level. Kata sandi tidak disentuh. */
  updateUserAccount: defineAction({
    input: z.object({
      id: z.number().int().positive(),
      name: z.string().min(2).max(160),
      email: z.email().max(200),
      jabatan: z.string().max(160).optional(),
      role: z.number().int().min(0).max(2),
    }),
    handler: async (input, context) => {
      const adminId = await currentAdminId(context);
      // Mengubah level akun sendiri bisa mengunci admin keluar dari halaman ini.
      if (input.id === adminId && input.role !== 0) {
        throw new ActionError({ code: "FORBIDDEN", message: "Level akun sendiri tidak bisa diturunkan." });
      }
      const email = input.email.toLowerCase();
      try {
        const updated = updateUserAccount(
          input.id,
          input.name.trim(),
          email,
          input.jabatan ?? "",
          input.role === 0 ? 0 : input.role === 2 ? 2 : 1,
        );
        if (!updated) throw new ActionError({ code: "NOT_FOUND", message: "Pengguna tidak ditemukan." });
      } catch (error) {
        if (error instanceof ActionError) throw error;
        throw new ActionError({ code: "CONFLICT", message: "Email sudah dipakai akun lain." });
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
  // Admin: posisi/jabatan
  // -------------------------------------------------------------------------

  /** Tambah satu Posisi/Jabatan (pilihan dropdown di form pengguna). */
  createPosition: defineAction({
    input: z.object({ label: z.string().min(2).max(160) }),
    handler: async (input, context) => {
      await currentAdminId(context);
      try {
        createPosition(input.label);
      } catch {
        throw new ActionError({ code: "CONFLICT", message: "Jabatan itu sudah ada." });
      }
      return {};
    },
  }),

  /** Ubah nama satu jabatan; akun yang memakainya ikut diperbarui. */
  updatePosition: defineAction({
    input: z.object({ id: z.number().int().positive(), label: z.string().min(2).max(160) }),
    handler: async (input, context) => {
      await currentAdminId(context);
      try {
        if (!updatePosition(input.id, input.label)) {
          throw new ActionError({ code: "NOT_FOUND", message: "Jabatan tidak ditemukan." });
        }
      } catch (error) {
        if (error instanceof ActionError) throw error;
        throw new ActionError({ code: "CONFLICT", message: "Jabatan itu sudah ada." });
      }
      return {};
    },
  }),

  /** Hapus satu jabatan. Akun yang sudah memakainya tetap menyimpan teksnya. */
  deletePosition: defineAction({
    input: z.object({ id: z.number().int().positive() }),
    handler: async (input, context) => {
      await currentAdminId(context);
      deletePosition(input.id);
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
  // Admin: kategori (unit kerja)
  // -------------------------------------------------------------------------

  /** Buat satu kategori baru; jawabannya slug id-nya. */
  createCategory: defineAction({
    input: z.object({
      label: z.string().trim().min(2).max(80),
      icon: z.string().max(40),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const icon = input.icon in ICON_PALETTE ? input.icon : "tags";
      const id = createCategory(input.label, icon);
      if (!id) throw new ActionError({ code: "BAD_REQUEST", message: "Kategori gagal dibuat." });
      return { id };
    },
  }),

  /** Ubah nama & ikon satu kategori. */
  updateCategory: defineAction({
    input: z.object({
      id: z.string().min(1).max(60),
      label: z.string().trim().min(2).max(80),
      icon: z.string().max(40),
    }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const icon = input.icon in ICON_PALETTE ? input.icon : "tags";
      const updated = updateCategory(input.id, input.label, icon);
      if (!updated) throw new ActionError({ code: "NOT_FOUND", message: "Kategori tidak ditemukan." });
      return {};
    },
  }),

  /** Hapus satu kategori beserta seluruh aktivitas dan penugasannya. */
  deleteCategory: defineAction({
    input: z.object({ id: z.string().min(1).max(60) }),
    handler: async (input, context) => {
      await currentAdminId(context);
      const deleted = deleteCategory(input.id);
      if (!deleted) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "Unit sistem tidak bisa dihapus.",
        });
      }
      return {};
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
