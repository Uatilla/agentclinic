CREATE TABLE `therapies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`duration` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `therapies_name_unique` ON `therapies` (`name`);