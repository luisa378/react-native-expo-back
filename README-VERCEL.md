# Despliegue en Vercel

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com)
- Vercel CLI instalado (opcional): `npm i -g vercel`
- Código subido a GitHub, GitLab o Bitbucket

## Método 1: Despliegue desde CLI (Recomendado)

```bash
npm i -g vercel
vercel login
cd c:\Clases\Luisa\react-native-expo-2\back
vercel
```

## Método 2: Despliegue desde Dashboard de Vercel

1. Dirígete a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Next.js
5. Configura las **Environment Variables**:
   - `DATABASE_URL`: Tu string de conexión a PostgreSQL
   - `JWT_SECRET`: Tu clave secreta para JWT (si lo usas)
   - `AUTH_REQUIRED`: true/false según tu necesidad

## Variables de Entorno Necesarias

En el Dashboard de Vercel → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secret-key-here
AUTH_REQUIRED=false
```

## Configuración de Base de Datos

### Si usas Neon Database (Recomendado):
- Crea una cuenta en [Neon.tech](https://neon.tech)
- Obtén tu `DATABASE_URL`
- Pega el URL completo en las variables de entorno de Vercel

### Si usas PostgreSQL local:
- Asegúrate de que tu BD tenga acceso desde internet (IP 0.0.0.0/0)
- O usa una base de datos en la nube como AWS RDS, Digital Ocean, etc.

## Archivos de Configuración

- **vercel.json**: Configuración específica de Vercel
- **.vercelignore**: Archivos a ignorar en el despliegue
- **next.config.ts**: Configuración de Next.js optimizada para Vercel
- **tsconfig.json**: Configuración de TypeScript

## Verificar antes de desplegar

```bash
npm run typecheck
npm run build
npm run dev
```

## Solución de problemas

### Error: "Cannot find module"
- Ejecuta `npm install` localmente
- Verifica que todas las dependencias estén en `package.json`

### Error: "DATABASE_URL is required"
- Ve a Settings → Environment Variables en Vercel
- Asegúrate de agregar `DATABASE_URL`

### Error: "Cannot connect to database"
- Verifica que la IP de Vercel pueda conectarse (usa 0.0.0.0/0 o rangos de Vercel)
- Prueba la conexión localmente primero

### Build muy lento
- Vercel tiene límite de 45 minutos en free plan
- Optimiza el `next.config.ts` si es necesario

## Información Útil

- Dashboard: https://vercel.com/dashboard
- Logs de despliegue: https://vercel.com/dashboard/your-project/deployments
- Documentación: https://vercel.com/docs/nextjs
