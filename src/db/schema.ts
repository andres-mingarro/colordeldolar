import { pgTable, serial, varchar, numeric, date, text, uniqueIndex } from 'drizzle-orm/pg-core'

export const cotizacionesDiarias = pgTable(
  'cotizaciones_diarias',
  {
    id:             serial('id').primaryKey(),
    tipo:           varchar('tipo', { length: 50 }).notNull(),      // 'blue' | 'oficial'
    fecha:          date('fecha').notNull(),                         // YYYY-MM-DD (hora AR)
    aperturaCompra: numeric('apertura_compra', { precision: 10, scale: 2 }).notNull(),
    aperturaVenta:  numeric('apertura_venta',  { precision: 10, scale: 2 }).notNull(),
    cierreCompra:   numeric('cierre_compra',   { precision: 10, scale: 2 }).notNull(),
    cierreVenta:    numeric('cierre_venta',    { precision: 10, scale: 2 }).notNull(),
  },
  (t) => [
    uniqueIndex('uniq_tipo_fecha').on(t.tipo, t.fecha),
  ]
)

export type CotizacionDiaria = typeof cotizacionesDiarias.$inferSelect
export type NuevaCotizacion  = typeof cotizacionesDiarias.$inferInsert

// ─── Snapshot dólar (fila única, siempre sobreescrita) ────────────────────────

export const dolarSnapshot = pgTable('dolar_snapshot', {
  id:              serial('id').primaryKey(),
  blueCompra:      numeric('blue_compra',      { precision: 10, scale: 2 }).notNull(),
  blueVenta:       numeric('blue_venta',       { precision: 10, scale: 2 }).notNull(),
  oficialCompra:   numeric('oficial_compra',   { precision: 10, scale: 2 }).notNull(),
  oficialVenta:    numeric('oficial_venta',    { precision: 10, scale: 2 }).notNull(),
  mepCompra:       numeric('mep_compra',       { precision: 10, scale: 2 }),
  mepVenta:        numeric('mep_venta',        { precision: 10, scale: 2 }),
  tarjetaCompra:   numeric('tarjeta_compra',   { precision: 10, scale: 2 }),
  tarjetaVenta:    numeric('tarjeta_venta',    { precision: 10, scale: 2 }),
  cclCompra:       numeric('ccl_compra',       { precision: 10, scale: 2 }),
  cclVenta:        numeric('ccl_venta',        { precision: 10, scale: 2 }),
  mayoristaCompra: numeric('mayorista_compra', { precision: 10, scale: 2 }),
  mayoristaVenta:  numeric('mayorista_venta',  { precision: 10, scale: 2 }),
  actualizadoEn:   text('actualizado_en').notNull(),
})

export type DolarSnapshot = typeof dolarSnapshot.$inferSelect

// ─── Configuración global ─────────────────────────────────────────────────────

export const configuracion = pgTable('configuracion', {
  clave: varchar('clave', { length: 100 }).primaryKey(),
  valor: text('valor').notNull(),
})
