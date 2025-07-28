import { applyMigration } from './migrationUtils.js';
import { pool } from '../config.js';

async function migrateImageFilenames() {
  try {
    console.log('Iniciando migración para generar nombres de archivo estáticos para imágenes...');
    
    // Verificar primero si hay registros que necesitan actualización
    const client = await pool.connect();
    try {
      const checkResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM imagenes_productos 
        WHERE nombre_archivo IS NULL 
        OR nombre_optimizado IS NULL 
        OR nombre_miniatura IS NULL
      `);
      
      const needsUpdate = parseInt(checkResult.rows[0].count) > 0;
      
      if (needsUpdate) {
        console.log(`Se encontraron ${checkResult.rows[0].count} imágenes que necesitan actualización.`);
        
        // Aplicar la migración que actualiza los nombres de archivo
        await applyMigration('migrations/populate_image_filenames.sql');
        
        console.log('Migración de nombres de archivo completada exitosamente');
      } else {
        console.log('No se encontraron registros que requieran actualización. Todos los nombres de archivo ya están generados.');
      }
      
      // Mostrar un resumen de las imágenes
      const summaryResult = await client.query(`
        SELECT COUNT(*) as total FROM imagenes_productos
      `);
      
      console.log(`\nResumen: ${summaryResult.rows[0].total} imágenes totales en la base de datos.`);
      console.log('NOTA: Las imágenes físicas no han sido descargadas ni creadas.');
      console.log('Por favor, coloque manualmente las imágenes en la carpeta correspondiente siguiendo la convención de nombres.');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error durante la migración de nombres de archivo:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
migrateImageFilenames();
