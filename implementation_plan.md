# Plan de Implementación: Data Analytics Sénior SaaS

Este documento detalla la hoja de ruta para transformar el prototipo local en una plataforma SaaS B2B robusta, segura y escalable.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js (React) + Tailwind CSS + Lucid React (Iconos) + Recharts (Gráficos).
- **Backend (API)**: Node.js (Express) - Elegido por su rapidez de desarrollo y facilidad de integración con el ecosistema frontend.
- **Base de Datos**: PostgreSQL con **Row-Level Security (RLS)** para Multitenancy.
- **Autenticación**: Proporcionada por Supabase Auth para gestión de empresas y roles.
- **Procesamiento Asíncrono**: Servicios en segundo plano para OCR y extracción con LLM.
- **Almacenamiento**: Supabase Storage (S3 compatible) para gestión de facturas PDF.

### Estrategia de Multitenancy
Utilizaremos un modelo de **Aislamiento por Fila (RLS)**:
- Cada tabla tendrá una columna `tenant_id`.
- Las políticas de la base de datos garantizarán que los usuarios solo accedan a los datos de su propia empresa (empresa_id).

---

## 📅 Fases de Desarrollo

### Fase 1: Cimiento y Seguridad (Core)
- [ ] Configuración del entorno Next.js y FastAPI.
- [ ] Implementación de la base de datos PostgreSQL en Supabase.
- [ ] Sistema de Registro de Empresas (Tenants) y Usuarios.
- [ ] Definición de Roles: `Admin` (Gestión) y `Analista` (Exploración).

### Fase 2: Gestión de Documentos y Cloud Storage
- [ ] Implementación del módulo de subida (Drag & Drop) en el Frontend.
- [ ] Integración con Supabase Storage para almacenamiento seguro por Tenant.
- [ ] Sistema de estados de factura: `Pendiente`, `En Proceso`, `Procesado`.

### Fase 3: Pipeline de IA y OCR (El Motor)
- [ ] Integración de OCR para PDFs escaneados (utilizando servicios optimizados).
- [ ] Implementación del "Prompt Maestro" con un modelo LLM local/privado (vía API segura).
- [ ] Lógica de normalización de datos (Fechas, Monedas, Importes).

### Fase 4: Dashboard y Analytics Embebido
- [ ] Desarrollo del panel de KPIs (Gasto Total, Media, Proveedores).
- [ ] Gráficos interactivos de tendencias mensuales y distribución por proveedor.
- [ ] Vista de detalle de facturas con capacidad de edición manual para correcciones.

### Fase 5: Funciones Premium e Integración
- [ ] Estructura de planes de precios (Básico vs Pro).
- [ ] Módulo de conectores para exportación a ERPs.
- [ ] Seguimiento de auditoría y logs de procesamiento.

---

## 🚀 Próximos Pasos Inmediatos
1. **Inicializar el proyecto Next.js** para la nueva interfaz.
2. **Configurar la base de datos PostgreSQL** con las tablas de `tenants` y `invoices`.
3. **Migrar el diseño "Elite"** actual a componentes dinámicos de React.
