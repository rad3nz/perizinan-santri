CREATE TABLE `kamar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(100) NOT NULL,
	`kapasitas` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kamar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipient_id` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`message` varchar(255) NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`perizinan_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perizinan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`jenis_izin` enum('pulang','keluar_kota','kegiatan_sekolah','lainnya') NOT NULL,
	`tujuan` varchar(255) NOT NULL,
	`tanggal_keluar` date NOT NULL,
	`tanggal_kembali_rencana` date NOT NULL,
	`tanggal_kembali_aktual` date,
	`status` enum('menunggu_muaddib','ditolak_muaddib','menunggu_mudir','ditolak_mudir','disetujui','berangkat','kembali') NOT NULL DEFAULT 'menunggu_muaddib',
	`catatan` text,
	`muaddib_id` int,
	`muaddib_at` timestamp,
	`muaddib_catatan` text,
	`mudir_id` int,
	`mudir_at` timestamp,
	`mudir_catatan` text,
	`alasan_penolakan` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `perizinan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(150) NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('santri','muaddib','mudir','admin') NOT NULL,
	`kamar_id` int,
	`nis` varchar(50),
	`kelas` varchar(50),
	`wali_telepon` varchar(30),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_id_users_id_fk` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_perizinan_id_perizinan_id_fk` FOREIGN KEY (`perizinan_id`) REFERENCES `perizinan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `perizinan` ADD CONSTRAINT `perizinan_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `perizinan` ADD CONSTRAINT `perizinan_muaddib_id_users_id_fk` FOREIGN KEY (`muaddib_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `perizinan` ADD CONSTRAINT `perizinan_mudir_id_users_id_fk` FOREIGN KEY (`mudir_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_kamar_id_kamar_id_fk` FOREIGN KEY (`kamar_id`) REFERENCES `kamar`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notifications_recipient_idx` ON `notifications` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `notifications_unread_idx` ON `notifications` (`recipient_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `perizinan_user_idx` ON `perizinan` (`user_id`);--> statement-breakpoint
CREATE INDEX `perizinan_status_idx` ON `perizinan` (`status`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_kamar_idx` ON `users` (`kamar_id`);