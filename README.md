# Calendario Web Básico

Una aplicación web básica de calendario desarrollada con Node.js y Express.

## Características

- Visualización de calendario mensual
- Resaltado del día actual
- Interfaz responsiva
- Selección de días con eventos de clic

## Tecnologías utilizadas

- Node.js
- Express
- EJS (plantillas)
- CSS3
- JavaScript

## Requisitos previos

- Node.js (versión 12 o superior)
- npm (gestor de paquetes de Node.js)

## Instalación

1. Clona este repositorio o descarga los archivos
2. Navega hasta la carpeta del proyecto
3. Instala las dependencias:

```bash
npm install
```

## Uso

### Iniciar el servidor

```bash
npm start
```

La aplicación estará disponible en: http://localhost:3000

### Modo desarrollo (con recarga automática)

```bash
npm run dev
```

## Estructura del proyecto

```
/
├── index.js           # Archivo principal del servidor
├── package.json       # Configuración del proyecto
├── public/            # Archivos estáticos
│   ├── css/           # Hojas de estilo
│   │   └── styles.css # Estilos del calendario
│   └── js/            # JavaScript del cliente
│       └── script.js  # Funcionalidad del calendario
└── views/             # Plantillas EJS
    └── calendar.ejs   # Plantilla del calendario
```

## Personalización

Puedes personalizar el calendario modificando los siguientes archivos:

- `public/css/styles.css` - Para cambiar la apariencia
- `public/js/script.js` - Para añadir más funcionalidad
- `views/calendar.ejs` - Para modificar la estructura HTML
- `index.js` - Para cambiar la lógica del servidor

## Licencia

ISC