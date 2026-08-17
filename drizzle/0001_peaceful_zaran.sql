CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` varchar(128) NOT NULL,
	`startDate` varchar(80) NOT NULL,
	`eventName` text NOT NULL,
	`eventType` varchar(255) NOT NULL,
	`organizer` text NOT NULL,
	`endDate` varchar(80) NOT NULL,
	`eventUrl` varchar(1024),
	`sourceUrl` varchar(1024) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_source_id_unique` UNIQUE(`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `refresh_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`lastSuccessAt` timestamp,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `refresh_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_jobs_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(16) NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `events_active_index` ON `events` (`isActive`);--> statement-breakpoint
CREATE INDEX `refresh_jobs_task_uid_index` ON `refresh_jobs` (`scheduleCronTaskUid`);