CREATE TABLE "cotizaciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"compra" numeric(10, 2) NOT NULL,
	"venta" numeric(10, 2) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_cotizaciones_tipo_timestamp" ON "cotizaciones" USING btree ("tipo","timestamp");