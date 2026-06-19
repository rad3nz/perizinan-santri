ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_perizinan_id_perizinan_id_fk`;
--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_perizinan_id_perizinan_id_fk` FOREIGN KEY (`perizinan_id`) REFERENCES `perizinan`(`id`) ON DELETE cascade ON UPDATE no action;