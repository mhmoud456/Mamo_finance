CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int,
	`name` varchar(120) NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`month` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`type` enum('INCOME','EXPENSE') NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT '#0ea5e9',
	`icon` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_user_type_name` UNIQUE(`userId`,`type`,`name`)
);
--> statement-breakpoint
CREATE TABLE `financial_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`targetAmount` decimal(18,2) NOT NULL,
	`currentAmount` decimal(18,2) NOT NULL DEFAULT '0',
	`currency` varchar(3) NOT NULL,
	`deadline` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int,
	`paymentMethodId` int,
	`amount` decimal(18,2) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`type` enum('INCOME','EXPENSE') NOT NULL,
	`frequency` enum('WEEKLY','MONTHLY','YEARLY') NOT NULL,
	`nextDate` timestamp NOT NULL,
	`note` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recurring_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int,
	`paymentMethodId` int,
	`amount` decimal(18,2) NOT NULL,
	`currency` varchar(3) NOT NULL,
	`type` enum('INCOME','EXPENSE') NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`note` text,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(5) NOT NULL DEFAULT 'ar',
	`theme` varchar(10) NOT NULL DEFAULT 'light',
	`defaultCurrency` varchar(3) NOT NULL DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `budgets_user_month_idx` ON `budgets` (`userId`,`month`);--> statement-breakpoint
CREATE INDEX `categories_user_idx` ON `categories` (`userId`);--> statement-breakpoint
CREATE INDEX `financial_goals_user_idx` ON `financial_goals` (`userId`);--> statement-breakpoint
CREATE INDEX `payment_methods_user_idx` ON `payment_methods` (`userId`);--> statement-breakpoint
CREATE INDEX `recurring_user_date_idx` ON `recurring_transactions` (`userId`,`nextDate`);--> statement-breakpoint
CREATE INDEX `transactions_user_date_idx` ON `transactions` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `transactions_user_type_idx` ON `transactions` (`userId`,`type`);--> statement-breakpoint
CREATE INDEX `transactions_category_idx` ON `transactions` (`categoryId`);