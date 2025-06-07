CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" text NOT NULL,
	"password" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
