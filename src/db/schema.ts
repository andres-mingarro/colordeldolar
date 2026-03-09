import { pgTable, serial, varchar, numeric, timestamp, index } from 'drizzle-orm/pg-core'

export const cotizaciones = pgTable(
  'cotizaciones',
  {
    id:        serial('id').primaryKey(),
    tipo:      varchar('tipo', { length: 50 }).notNull(),   // 'blue' | 'oficial'
    compra:    numeric('compra', { precision: 10, scale: 2 }).notNull(),
    venta:     numeric('venta',  { precision: 10, scale: 2 }).notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('idx_cotizaciones_tipo_timestamp').on(t.tipo, t.timestamp),
  ]
)

export type Cotizacion = typeof cotizaciones.$inferSelect
export type NuevaCotizacion = typeof cotizaciones.$inferInsert
