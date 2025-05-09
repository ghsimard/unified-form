# Formularios COSMO

Aplicación unificada para los formularios de Docentes, Estudiantes y Acudientes.

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear un archivo `.env` en el directorio raíz con las siguientes variables:
   ```
   VITE_API_URL=http://localhost:3001
   ```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Construcción

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos generados se encontrarán en el directorio `dist`.

## Estructura del Proyecto

```
src/
  ├── components/         # Componentes React
  │   ├── DocentesForm.tsx
  │   ├── EstudiantesForm.tsx
  │   └── AcudientesForm.tsx
  ├── types/             # Definiciones de tipos TypeScript
  │   └── form.ts
  ├── data/              # Datos estáticos
  │   └── questions.ts
  ├── App.tsx           # Componente principal
  └── main.tsx          # Punto de entrada
```

## API

La aplicación se comunica con el backend a través de los siguientes endpoints:

- `/api/docentes` - Formulario de docentes
- `/api/estudiantes` - Formulario de estudiantes
- `/api/acudientes` - Formulario de acudientes

## Variables de Entorno

La aplicación utiliza las siguientes variables de entorno:

- `VITE_API_URL`: URL del servidor backend (por defecto: http://localhost:3001)

Para configurar las variables de entorno:

1. Crear un archivo `.env` en el directorio raíz
2. Copiar las variables necesarias del archivo `.env.example`
3. Ajustar los valores según el entorno

## Licencia

Este proyecto es privado y confidencial. 