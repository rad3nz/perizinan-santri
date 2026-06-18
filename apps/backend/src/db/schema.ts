import { JENIS_IZIN, PERIZINAN_STATUS, ROLES } from "@perizinan/shared";
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const kamar = mysqlTable("kamar", {
  id: int("id").autoincrement().primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  kapasitas: int("kapasitas").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(), // argon2 hash
    role: mysqlEnum("role", ROLES).notNull(),
    kamarId: int("kamar_id").references(() => kamar.id), // null for mudir/admin
    nis: varchar("nis", { length: 50 }), // santri only
    kelas: varchar("kelas", { length: 50 }), // santri only
    waliTelepon: varchar("wali_telepon", { length: 30 }), // santri only
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => ({
    roleIdx: index("users_role_idx").on(t.role),
    kamarIdx: index("users_kamar_idx").on(t.kamarId),
  }),
);

export const perizinan = mysqlTable(
  "perizinan",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    jenisIzin: mysqlEnum("jenis_izin", JENIS_IZIN).notNull(),
    tujuan: varchar("tujuan", { length: 255 }).notNull(),
    tanggalKeluar: date("tanggal_keluar").notNull(),
    tanggalKembaliRencana: date("tanggal_kembali_rencana").notNull(),
    tanggalKembaliAktual: date("tanggal_kembali_aktual"), // set on → kembali
    status: mysqlEnum("status", PERIZINAN_STATUS).notNull().default("menunggu_muaddib"),
    catatan: text("catatan"),
    muaddibId: int("muaddib_id").references(() => users.id),
    muaddibAt: timestamp("muaddib_at"),
    muaddibCatatan: text("muaddib_catatan"),
    mudirId: int("mudir_id").references(() => users.id),
    mudirAt: timestamp("mudir_at"),
    mudirCatatan: text("mudir_catatan"),
    alasanPenolakan: text("alasan_penolakan"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => ({
    userIdx: index("perizinan_user_idx").on(t.userId),
    statusIdx: index("perizinan_status_idx").on(t.status),
  }),
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientId: int("recipient_id")
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 50 }).notNull(),
    message: varchar("message", { length: 255 }).notNull(), // Indonesian copy
    isRead: boolean("is_read").notNull().default(false),
    perizinanId: int("perizinan_id").references(() => perizinan.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => ({
    recipientIdx: index("notifications_recipient_idx").on(t.recipientId),
    unreadIdx: index("notifications_unread_idx").on(t.recipientId, t.isRead),
  }),
);

export const kamarRelations = relations(kamar, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  kamar: one(kamar, { fields: [users.kamarId], references: [kamar.id] }),
  perizinan: many(perizinan), // as santri (user_id)
  notifications: many(notifications),
}));

export const perizinanRelations = relations(perizinan, ({ one }) => ({
  santri: one(users, { fields: [perizinan.userId], references: [users.id] }),
  muaddib: one(users, { fields: [perizinan.muaddibId], references: [users.id] }),
  mudir: one(users, { fields: [perizinan.mudirId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, { fields: [notifications.recipientId], references: [users.id] }),
  perizinan: one(perizinan, { fields: [notifications.perizinanId], references: [perizinan.id] }),
}));
