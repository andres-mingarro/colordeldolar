-- Elimina la tabla anterior (sin datos productivos aún)
DROP TABLE IF EXISTS "cotizaciones";

-- Tabla nueva: una fila por (tipo, día) con apertura y cierre
CREATE TABLE "cotizaciones_diarias" (
  "id"              serial PRIMARY KEY,
  "tipo"            varchar(50) NOT NULL,
  "fecha"           date NOT NULL,
  "apertura_compra" numeric(10, 2) NOT NULL,
  "apertura_venta"  numeric(10, 2) NOT NULL,
  "cierre_compra"   numeric(10, 2) NOT NULL,
  "cierre_venta"    numeric(10, 2) NOT NULL
);

CREATE UNIQUE INDEX "uniq_tipo_fecha" ON "cotizaciones_diarias" ("tipo", "fecha");
