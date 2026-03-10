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

// ─── Configuración global ─────────────────────────────────────────────────────

export const configuracion = pgTable('configuracion', {
  clave: varchar('clave', { length: 100 }).primaryKey(),
  valor: text('valor').notNull(),
})
