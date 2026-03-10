--> statement-breakpoint
INSERT INTO "configuracion" ("clave", "valor") VALUES
  ('x_post_apertura', 'false'),
  ('x_msg_apertura', 'Apertura del mercado

💵 Dólar Blue
   Compra: $[blueCompra]
   Venta:  $[blueVenta]

🏦 Dólar Oficial
   Compra: $[oficialCompra]
   Venta:  $[oficialVenta]

⏰ [time]'),
  ('x_post_cierre', 'false'),
  ('x_msg_cierre', 'Cierre del mercado

💵 Dólar Blue
   Compra: $[blueCompra]
   Venta:  $[blueVenta]

🏦 Dólar Oficial
   Compra: $[oficialCompra]
   Venta:  $[oficialVenta]

⏰ [time]'),
  ('x_cierre_posted', '')
ON CONFLICT ("clave") DO NOTHING;
