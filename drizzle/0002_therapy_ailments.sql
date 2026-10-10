CREATE TABLE `therapy_ailments` (
	`therapy_id` integer NOT NULL,
	`ailment_id` integer NOT NULL,
	`effectiveness` text NOT NULL,
	PRIMARY KEY(`therapy_id`, `ailment_id`),
	FOREIGN KEY (`therapy_id`) REFERENCES `therapies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ailment_id`) REFERENCES `ailments`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "therapy_ailments_effectiveness_check" CHECK(effectiveness IN ('low', 'medium', 'high'))
);
