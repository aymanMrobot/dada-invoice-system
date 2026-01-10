CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`taxId` varchar(100),
	`addressLine1` varchar(255),
	`addressLine2` varchar(255),
	`city` varchar(100),
	`county` varchar(100),
	`postcode` varchar(20),
	`country` varchar(100) DEFAULT 'Ireland',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`customerId` int NOT NULL,
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`status` enum('draft','sent','paid','overdue') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(10,2) NOT NULL,
	`vatRate` decimal(5,2) NOT NULL DEFAULT '23.00',
	`vatAmount` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
