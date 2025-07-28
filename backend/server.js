import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { testConnection } from './db/config.js';
import { createTables, seedProducts } from './db/migrations.js';
import { updateImagesTable } from './db/updateMigrations.js';
import testRoutes from './api/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Obtener el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import userRoutes from './routes/userRoutes.js';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos
const pathToUploads = path.join(__dirname, 'public', 'uploads');
console.log('Sirviendo archivos estáticos desde:', pathToUploads);

// Configuramos múltiples rutas para mayor compatibilidad
app.use('/uploads', express.static(pathToUploads));
app.use('/public/uploads', express.static(pathToUploads));

// Rutas específicas para imágenes de productos
const pathToProductImages = path.join(__dirname, 'public', 'uploads', 'productos');
console.log('Sirviendo imágenes de productos desde:', pathToProductImages);

app.use('/uploads/productos', express.static(pathToProductImages));
app.use('/public/uploads/productos', express.static(pathToProductImages));

// Log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// API routes
app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/carrito', cartRoutes);
app.use('/api/user', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('ESCOMPARTE API Server is running. Use /api endpoints to interact with the API.');
});

// Ruta de diagnóstico para verificar configuración de imágenes
app.get('/api/check-images', (req, res) => {
  const pathToProductImages = path.join(__dirname, 'public', 'uploads', 'productos');
  const fs = require('fs');
  
  try {
    // Verificar si la carpeta existe
    const exists = fs.existsSync(pathToProductImages);
    
    // Listar archivos si la carpeta existe
    const files = exists ? fs.readdirSync(pathToProductImages) : [];
    
    res.json({
      success: true,
      config: {
        imagesPath: pathToProductImages,
        folderExists: exists,
        availableFiles: files,
        urls: {
          example1: `/uploads/productos/${files[0] || 'ejemplo.jpg'}`,
          example2: `/public/uploads/productos/${files[0] || 'ejemplo.jpg'}`
        }
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
const startServer = async () => {
  try {
    // Test database connection before starting the server
    const dbConnected = await testConnection();
    
    if (dbConnected) {
      // Las migraciones ahora están desactivadas para evitar ejecutarlas en cada inicio
      // Comentado para evitar ejecuciones automáticas:
      // await createTables();
      // await updateImagesTable();
      // await seedProducts();
      
      console.log('Iniciando servidor sin ejecutar migraciones automáticas.');
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Database connection status: ${dbConnected ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
