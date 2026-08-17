CREATE TABLE `api_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(160) NOT NULL,
	`sourceUrl` varchar(1024) NOT NULL,
	`rowSelector` varchar(255) NOT NULL DEFAULT 'table tr',
	`fieldMap` text NOT NULL,
	`lastPreviewJson` text,
	`lastFetchedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_sources_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_sources_slug_unique` UNIQUE(`slug`)
);
