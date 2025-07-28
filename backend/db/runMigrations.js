import { updateImagesTable } from './updateMigrations.js';
import { migrateImages } from './imageMigration.js';

// Función para ejecutar todas las migraciones
async function runMigrations() {
  try {
    // Esquema ya actualizado, solo migrar las imágenes existentes
    console.log('Iniciando migración de imágenes existentes...');
    await migrateImages();
    
    console.log('Migración de imágenes aplicada correctamente');
  } catch (error) {
    console.error('Error al aplicar migraciones:', error);
    process.exit(1);
  }
}

// Ejecutar migraciones
runMigrations();
