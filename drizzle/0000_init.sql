CREATE TABLE `agent_ailments` (
	`agent_id` integer NOT NULL,
	`ailment_id` integer NOT NULL,
	`severity` text NOT NULL,
	PRIMARY KEY(`agent_id`, `ailment_id`),
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ailment_id`) REFERENCES `ailments`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "agent_ailments_severity_check" CHECK(severity IN ('mild', 'moderate', 'severe'))
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`model` text NOT NULL,
	`bio` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ailments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ailments_name_unique` ON `ailments` (`name`);