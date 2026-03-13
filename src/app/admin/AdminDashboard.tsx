'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CotizacionDiaria } from '@/db/schema'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Props {
  cotizaciones: CotizacionDiaria[]
  pollingActivo: boolean
  pollingIntervalo: number
  mercadoHoraApertura: string
  mercadoHoraCierre: string
  xPostApertura: boolean
  xMsgApertura: string
  xPostCierre: boolean
  xMsgCierre: string
  driveFolderUrl: string
}

function variacion(apertura: string, cierre: string) {
  const a = Number(apertura)
  const c = Number(cierre)
  if (a === c) return null
  const diff = c - a
  const pct = ((diff / a) * 100).toFixed(2)
  const signo = diff > 0 ? '+' : ''
  return { diff, label: `${signo}$${diff.toLocaleString('es-AR')} (${signo}${pct}%)`, positivo: diff > 0 }
}

export default function AdminDashboard({
  cotizaciones,
  pollingActivo,
  pollingIntervalo,
  mercadoHoraApertura,
  mercadoHoraCierre,
  xPostApertura,
  xMsgApertura,
  xPostCierre,
  xMsgCierre,
  driveFolderUrl,
}: Props) {
  const router = useRouter()

  const [activo, setActivo] = useState(pollingActivo)
  const [intervalo, setIntervalo] = useState(pollingIntervalo)
  const [horaApertura, setHoraApertura] = useState(mercadoHoraApertura)
  const [horaCierre, setHoraCierre] = useState(mercadoHoraCierre)
  const [guardandoPolling, setGuardandoPolling] = useState(false)
  const [guardadoPolling, setGuardadoPolling] = useState(false)

  const [xApertura, setXApertura] = useState(xPostApertura)
  const [msgApertura, setMsgApertura] = useState(xMsgApertura)
  const [xCierre, setXCierre] = useState(xPostCierre)
  const [msgCierre, setMsgCierre] = useState(xMsgCierre)
  const [guardandoX, setGuardandoX] = useState(false)
  const [guardadoX, setGuardadoX] = useState(false)

  const [generandoImagen, setGenerandoImagen] = useState(false)
  const [imagenGenerada, setImagenGenerada] = useState<{ nombre: string; preview: string; driveUrl: string } | null>(null)
  const [errorImagen, setErrorImagen] = useState(false)

  async function generarImagen() {
    setGenerandoImagen(true)
    setImagenGenerada(null)
    setErrorImagen(false)
    const res = await fetch('/api/admin/imagen', { method: 'POST' })
    setGenerandoImagen(false)
    if (res.ok) {
      const data = await res.json()
      setImagenGenerada({ nombre: data.nombre, preview: data.preview, driveUrl: data.driveUrl })
    } else {
      setErrorImagen(true)
    }
  }

  async function guardarPolling(e: { preventDefault(): void }) {
    e.preventDefault()
    setGuardandoPolling(true)
    setGuardadoPolling(false)
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polling_activo: activo, polling_intervalo: intervalo, mercado_hora_apertura: horaApertura, mercado_hora_cierre: horaCierre }),
    })
    setGuardandoPolling(false)
    setGuardadoPolling(true)
    setTimeout(() => setGuardadoPolling(false), 2000)
  }

  async function guardarX(e: { preventDefault(): void }) {
    e.preventDefault()
    setGuardandoX(true)
    setGuardadoX(false)
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x_post_apertura: xApertura,
        x_msg_apertura: msgApertura,
        x_post_cierre: xCierre,
        x_msg_cierre: msgCierre,
      }),
    })
    setGuardandoX(false)
    setGuardadoX(true)
    setTimeout(() => setGuardadoX(false), 2000)
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-3xl mx-auto px-4 py-6 gap-6">

      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Panel Admin</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">Home</a>
          </Button>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="configuracion" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="configuracion" className="flex-1">Configuración</TabsTrigger>
          <TabsTrigger value="instagram" className="flex-1">Instagram</TabsTrigger>
          <TabsTrigger value="x" className="flex-1">Opciones de X</TabsTrigger>
          <TabsTrigger value="cotizaciones" className="flex-1">Cotizaciones</TabsTrigger>
        </TabsList>

        {/* ── Configuración ── */}
        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración general</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={guardarPolling} className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="polling-activo">Actualización automática</Label>
                  <Switch
                    id="polling-activo"
                    checked={activo}
                    onCheckedChange={setActivo}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="intervalo">Intervalo (minutos)</Label>
                  <Input
                    id="intervalo"
                    type="number"
                    min={1}
                    max={60}
                    value={intervalo}
                    disabled={!activo}
                    onChange={e => setIntervalo(Number(e.target.value))}
                    className="max-w-32"
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Mercado</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="hora-apertura">Hora de apertura</Label>
                      <Input
                        id="hora-apertura"
                        type="time"
                        value={horaApertura}
                        onChange={e => setHoraApertura(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="hora-cierre">Hora de cierre</Label>
                      <Input
                        id="hora-cierre"
                        type="time"
                        value={horaCierre}
                        onChange={e => setHoraCierre(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={guardandoPolling} className="w-full">
                  {guardandoPolling ? 'Guardando…' : guardadoPolling ? '✓ Guardado' : 'Guardar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Instagram ── */}
        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle>Imagen para Instagram</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Button
                  onClick={generarImagen}
                  disabled={generandoImagen}
                  variant="secondary"
                  className="flex-1"
                >
                  {generandoImagen ? 'Generando…' : 'Generar imagen'}
                </Button>
                <Button variant="secondary" className="flex-1" asChild>
                  <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer">
                    Ver carpeta en Drive
                  </a>
                </Button>
              </div>

              {imagenGenerada && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-green-500">✓ Imagen subida: {imagenGenerada.nombre}</p>
                  <img
                    src={`data:image/png;base64,${imagenGenerada.preview}`}
                    alt="Preview"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}
              {errorImagen && (
                <p className="text-sm text-destructive">Error al generar la imagen.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Opciones de X ── */}
        <TabsContent value="x">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de X</CardTitle>
              <CardDescription>
                Variables:{' '}
                {['[blueCompra]', '[blueVenta]', '[oficialCompra]', '[oficialVenta]', '[time]', '[fecha]'].map(v => (
                  <code key={v} className="mx-0.5 rounded bg-muted px-1 py-0.5 text-xs font-mono">{v}</code>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={guardarX} className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="x-apertura">Post de apertura</Label>
                    <Switch
                      id="x-apertura"
                      checked={xApertura}
                      onCheckedChange={setXApertura}
                    />
                  </div>
                  <Textarea
                    value={msgApertura}
                    onChange={e => setMsgApertura(e.target.value)}
                    disabled={!xApertura}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="x-cierre">Post de cierre</Label>
                    <Switch
                      id="x-cierre"
                      checked={xCierre}
                      onCheckedChange={setXCierre}
                    />
                  </div>
                  <Textarea
                    value={msgCierre}
                    onChange={e => setMsgCierre(e.target.value)}
                    disabled={!xCierre}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <Button type="submit" disabled={guardandoX} className="w-full">
                  {guardandoX ? 'Guardando…' : guardadoX ? '✓ Guardado' : 'Guardar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cotizaciones de hoy ── */}
        <TabsContent value="cotizaciones">
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones de hoy</CardTitle>
              <CardDescription>
                Valores de apertura y cierre registrados hoy. La variación compara el precio de venta al cierre vs. la apertura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cotizaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos por hoy.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Ap. compra</TableHead>
                        <TableHead>Ap. venta</TableHead>
                        <TableHead>Ci. compra</TableHead>
                        <TableHead>Ci. venta</TableHead>
                        <TableHead>Variación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cotizaciones.map(c => {
                        const v = variacion(c.aperturaVenta, c.cierreVenta)
                        return (
                          <TableRow key={c.tipo}>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{c.tipo}</Badge>
                            </TableCell>
                            <TableCell>${Number(c.aperturaCompra).toLocaleString('es-AR')}</TableCell>
                            <TableCell>${Number(c.aperturaVenta).toLocaleString('es-AR')}</TableCell>
                            <TableCell>${Number(c.cierreCompra).toLocaleString('es-AR')}</TableCell>
                            <TableCell>${Number(c.cierreVenta).toLocaleString('es-AR')}</TableCell>
                            <TableCell className={v ? (v.positivo ? 'text-green-500' : 'text-destructive') : 'text-muted-foreground'}>
                              {v ? v.label : '—'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
