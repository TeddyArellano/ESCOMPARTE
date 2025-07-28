
## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 14.0.0 o superior)
- [npm](https://www.npmjs.com/) (generalmente se instala con Node.js)
- Un editor de código (recomendamos [Visual Studio Code](https://code.visualstudio.com/))
- [Git](https://git-scm.com/) (opcional, para clonar el repositorio)

## Instalación y Ejecución Local

Sigue estos pasos para configurar el proyecto en tu máquina local:

### 1. Clona o descarga el repositorio

```powershell
# Usando Git
git clone https://github.com/tu-usuario/ESCOMPARTE.git

# O descarga el ZIP y extráelo
```

### 2. Navega al directorio del proyecto

```powershell
cd ESCOMPARTE/escomparte
```

### 3. Instala las dependencias

```powershell
npm install
```

Este comando instalará todas las dependencias necesarias, incluyendo React y otras bibliotecas utilizadas en el proyecto.

### 4. Inicia el servidor de desarrollo

```powershell
npm run dev
```

Una vez ejecutado este comando, Vite iniciará un servidor de desarrollo local. Abre tu navegador y navega a la URL mostrada en la terminal (típicamente http://localhost:5173/).

## Estructura del Proyecto

```
escomparte/
├── public/             # Archivos públicos y estáticos
├── src/                # Código fuente
│   ├── assets/         # Imágenes y recursos
│   ├── components/     # Componentes React
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Punto de entrada
├── index.html          # Plantilla HTML
├── package.json        # Dependencias y scripts
└── vite.config.js      # Configuración de Vite
```

## Tecnologías Utilizadas

- **React**: Biblioteca JavaScript para construir interfaces de usuario
- **Vite**: Herramienta de compilación ultrarrápida para desarrollo web
- **React Router DOM**: Enrutador para React
- **CSS Moderno**: Variables CSS, Flexbox y Grid para el diseño

## Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Compila el proyecto para producción
- `npm run preview`: Previsualiza la versión compilada

## Instalación de React y Vite desde Cero

Si deseas crear un nuevo proyecto con React y Vite desde cero:

### 1. Instala Node.js y npm

Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/)

### 2. Crea un nuevo proyecto con Vite

```powershell
# Crea un nuevo proyecto
npm create vite@latest mi-proyecto -- --template react

# Navega al directorio del proyecto
cd mi-proyecto

# Instala dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```

### 3. Instala React Router (si necesitas navegación)

```powershell
npm install react-router-dom
```

## Solución de Problemas Comunes

### El servidor no inicia
- Verifica que el puerto no esté siendo usado por otra aplicación
- Asegúrate de haber instalado todas las dependencias con `npm install`
- Comprueba que la versión de Node.js sea compatible

### Errores de dependencias
- Elimina la carpeta `node_modules` y el archivo `package-lock.json`
- Ejecuta `npm install` nuevamente


Desarrollado con ❤️ por estudiantes de ESCOM-IPN © 2025
