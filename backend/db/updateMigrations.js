import { applyMigration } from './migrationUtils.js';

// Aplicar la migración para actualizar la tabla de imágenes
export async function updateImagesTable() {
  try {
    // Ruta correcta relativa a migrationUtils.js
    await applyMigration('./migrations/update_images_table.sql');
    console.log('Tabla de imágenes actualizada correctamente');
  } catch (error) {
    // El script SQL ahora verifica si las columnas existen, por lo que este error no debería ocurrir,
    // pero mantenemos el manejo de errores por seguridad
    if (error.message && (
        error.message.includes('column already exists') || 
        error.message.includes('ya existe la columna')
      )) {
      console.log('Migration already applied or partially applied');
    } else {
      console.error('Error aplicando la migración:', error);
      throw error;
    }
  }
}
