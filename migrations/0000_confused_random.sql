CREATE TABLE "clt_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_address" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"affected_systems" text,
	"attack_vectors" text,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"contact_info" varchar(255) NOT NULL,
	"evidence_urls" text,
	"ai_analysis" text,
	"assigned_analyst" varchar(255),
	"assigned_certifier" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"client_wallet" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stake_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_address" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"client_address" varchar(255) NOT NULL,
	"analyst_address" varchar(255),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"evidence_hash" varchar(64) NOT NULL,
	"report_hash" varchar(64),
	"status" integer DEFAULT 0 NOT NULL,
	"stake_amount" integer NOT NULL,
	"transaction_hash" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer,
	"from_address" varchar(255) NOT NULL,
	"to_address" varchar(255),
	"transaction_hash" varchar(64) NOT NULL,
	"transaction_type" varchar(50) NOT NULL,
	"amount" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"clt_balance" integer DEFAULT 0 NOT NULL,
	"stake_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ticket_id_tickets_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("ticket_id") ON DELETE no action ON UPDATE no action;