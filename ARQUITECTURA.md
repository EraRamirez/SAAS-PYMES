# Arquitectura — SAAS-PYMES (Frontend)

> Documento vivo. Se actualiza conforme avanza el desarrollo del proyecto.
> Arquitectura completa del backend/agente: [S-Pback/ARQUITECTURA.md](https://github.com/EraRamirez/S-Pback/blob/main/ARQUITECTURA.md)

## 0. Estado actual vs. arquitectura objetivo

La implementación actual del repo (React 18 + Vite + TS + Tailwind + TanStack Query + React Router + PWA, ver [README.md](README.md)) es consistente con el principio "Web Mobile-First" de la arquitectura objetivo.

**Nota clave del negocio:** en la primera entrega **NO se implementa el registro por voz**. No hay botón de grabar audio, Speech-to-Text, ni interacción conversacional. El frontend cubre formularios/pantallas para productos (por pieza o a granel), movimientos (venta/compra/ajuste), materia prima (compra/uso), y reportes (resumen diario y quincenal).

**Generalización (ver [S-Pback/ARQUITECTURA.md](https://github.com/EraRamirez/S-Pback/blob/main/ARQUITECTURA.md) sección 6.10-6.13):** el modelo ya no asume solo abarrotes por pieza — soporta también venta a granel (kg/g), materia prima independiente, y apartados/reservaciones, para poder aplicarse a otros giros como un molino de masa.

**Diseño mobile-first (UI):** navegación en barra inferior fija (patrón de app móvil real, no pestañas de escritorio arriba), objetivos de toque grandes (mínimo ~52px), botones de acción con ícono + texto visible (nunca solo ícono, para usuarios no técnicos), animaciones sutiles con `framer-motion`, íconos de `lucide-react`. Kit de componentes reutilizable en `src/components/ui/`.

## 1. Objetivo del producto

Agente de Inventario por Voz para abarrotes de colonia en CDMX (fase futura). Nicho: dueños de abarrotes de 45–70 años que llevan su inventario en libreta o de memoria, usan WhatsApp, y no tienen sistema administrativo digital.

Problema que resuelve: no tienen control real de su inventario ni claridad de cuánto ganan realmente, porque llevan todo de forma informal.

## 2. Principios estratégicos (alineados al nicho)

1. Mobile-first
2. Experiencia simple
3. Interacción natural por voz (fase posterior)
4. Sin complejidad contable
5. Sin integraciones externas
6. Iteración rápida sobre infraestructura compleja

## 3. Arquitectura de alto nivel del sistema (objetivo, con voz)

```
Usuario (Dueño del Abarrote)
       │
       ▼
Web App (Mobile First)   <- este repo
       │
       ▼
Speech-to-Text
       │
       ▼
Backend FastAPI          <- repo S-Pback
       │
       ├── Agente LangChain
       │       ├── Memoria (Redis)
       │       ├── Context Loader (MongoDB)
       │       └── Tool Router
       │
       ▼
Tools (logica de negocio)
       │
       ▼
MongoDB
```

Para la primera entrega (sin voz), el flujo se reduce a: Web App → Backend → lógica de negocio → base de datos, sin STT, agente, ni Redis.

## 4. Frontend — Web Mobile-First

### Justificación

El usuario principal usa celular, no quiere instalar apps, y no es técnico. Por eso:

- Aplicación web optimizada para móvil (PWA — "Añadir a inicio")
- Botón grande para grabar voz (fase posterior; no en la primera entrega)
- Interfaz minimalista, navegación tipo app (barra inferior fija con ícono + texto)
- Visualización simple de: stock actual, productos, ganancia estimada, alertas de inventario bajo

No se desarrolla app nativa en el MVP.

### Alcance de la primera entrega (sin voz)

- Login y registro de negocio (teléfono + PIN)
- CRUD de productos, por pieza o a granel (kg/g). Solo nombre y precio de venta son obligatorios; costo, stock inicial y alerta quedan detrás de una casilla "opcional" (muchos dueños solo quieren capturar el precio de venta)
- Registrar venta / compra / ajuste de forma manual (formulario, no voz)
- Materia prima: alta, compra y uso (inventario independiente de productos, sin receta)
- Apartados: clientes que reservan producto para recoger después. Se entrega el apartado completo de una vez (no producto por producto); si se recoge en partes, se capturan apartados separados. CRUD completo mientras esté pendiente (agregar/editar/quitar producto, editar cliente/fecha/hora — común que se les olvide apartar algo). Cargo fijo de $2 si el producto va en bolsa en vez de que el cliente traiga su propio bote. Estado de pago (pagado/anticipo/sin pagar), historial permanente, resumen de cuánto se ha apartado/entregado/pendiente por producto
- Dashboard: ganancia estimada (día/semana), alerta de producto bajo en inventario, y tabla de ventas de hoy por producto (se llena sola conforme se registran ventas, sea desde Productos o al entregar un apartado)
- Reporte quincenal: ingresos vs. egresos totales, con desglose diario opcional

### Navegación (mobile-first)

- `TopBar` (`src/components/TopBar.tsx`): barra superior delgada — logo/nombre del negocio + botón de salir. No lleva los tabs de navegación.
- `BottomNav` (`src/components/BottomNav.tsx`): barra inferior fija (patrón de app móvil) con 5 pestañas — Inicio, Productos, Insumos, Apartados, Quincena — ícono + etiqueta corta, indicador activo animado. Se eligió sobre una barra superior de tabs porque es el patrón que un usuario de celular ya conoce (Instagram, WhatsApp, etc.) y queda al alcance del pulgar.

### Roadmap (cuando se agregue voz)

- Botón de grabar audio en el dashboard
- Integración con servicio de Speech-to-Text
- Pantalla de confirmación conversacional (estilo WhatsApp) para lo que el agente entendió y ejecutó

## 5. Qué NO incluye esta arquitectura (ningún MVP)

- SAT / facturación electrónica
- Sistema POS completo
- Multi-sucursal
- Permisos complejos
- Contabilidad formal
- Integraciones bancarias
- Microservicios

## 6. Métricas de validación (Sprint 0)

Meta mínima: 5 negocios activos, 3 pagos reales, al menos 3 negocios usándolo 4+ días/semana.

Meta ideal: 10–15 activos, 7–10 pagos, $3,000–$6,000 MXN MRR, 2+ referidos orgánicos.

Cuando se agregue voz: % de registros hechos por voz, tiempo de respuesta del flujo de voz (objetivo < 4s).
