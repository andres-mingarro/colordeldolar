CREATE TABLE "configuracion" (
  "clave" varchar(100) PRIMARY KEY,
  "valor" text NOT NULL
);

INSERT INTO "configuracion" ("clave", "valor") VALUES
  ('polling_activo',    'true'),
  ('polling_intervalo', '1')
ON CONFLICT DO NOTHING;
