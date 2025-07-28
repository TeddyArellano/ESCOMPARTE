import { pool } from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta a la carpeta de imágenes de productos
const PRODUCTOS_FOLDER = path.join(__dirname, '../public/uploads/productos');

// Función para verificar y reportar el estado de las imágenes
async function checkImagesStatus() {
  try {
    // Conectar a la base de datos
    const client = await pool.connect();
    
    try {
      console.log('Consultando registros de imágenes en la base de datos...');
      
      // Obtener todos los registros de imágenes
      const result = await client.query(`
        SELECT id_imagen, id_producto, url_imagen, nombre_archivo, nombre_optimizado, nombre_miniatura 
        FROM imagenes_productos 
        ORDER BY id_producto, id_imagen
      `);
      
      if (result.rows.length === 0) {
        console.log('No se encontraron registros de imágenes en la base de datos.');
        return;
      }
      
      console.log(`Se encontraron ${result.rows.length} registros de imágenes.`);
      
      // Verificar que la carpeta de imágenes existe
      if (!fs.existsSync(PRODUCTOS_FOLDER)) {
        console.error(`La carpeta ${PRODUCTOS_FOLDER} no existe.`);
        console.log('Necesitará crear esta carpeta antes de colocar las imágenes.');
        return;
      }
      
      // Obtener lista de archivos en la carpeta
      const existingFiles = fs.readdirSync(PRODUCTOS_FOLDER);
      
      // Mostrar estado de cada imagen
      console.log('\nEstado de las imágenes:');
      console.log('----------------------------------------');
      console.log('ID Prod | ID Img | Original | Optimizada | Miniatura');
      console.log('----------------------------------------');
      
      let missingOriginals = 0;
      let missingOptimized = 0;
      let missingThumbs = 0;
      
      // Generar un reporte para guardar en un archivo
      let reportContent = '# Reporte de Estado de Imágenes\n\n';
      reportContent += 'Este archivo lista todos los nombres de archivo necesarios para la migración de imágenes.\n\n';
      reportContent += '## Imágenes faltantes\n\n';
      reportContent += 'Para completar la migración, necesita crear los siguientes archivos:\n\n';
      
      for (const row of result.rows) {
        const { id_producto, id_imagen, nombre_archivo, nombre_optimizado, nombre_miniatura } = row;
        
        const originalExists = existingFiles.includes(nombre_archivo);
        const optimizedExists = existingFiles.includes(nombre_optimizado);
        const thumbExists = existingFiles.includes(nombre_miniatura);
        
        console.log(`${id_producto.toString().padEnd(8)} | ${id_imagen.toString().padEnd(7)} | ${originalExists ? '✓' : '✗'} | ${optimizedExists ? '✓' : '✗'} | ${thumbExists ? '✓' : '✗'}`);
        
        if (!originalExists) {
          missingOriginals++;
          reportContent += `- \`${nombre_archivo}\` (Original para producto ${id_producto})\n`;
        }
        
        if (!optimizedExists) missingOptimized++;
        if (!thumbExists) missingThumbs++;
      }
      
      // Resumen
      console.log('----------------------------------------');
      console.log(`Total: ${result.rows.length} imágenes`);
      console.log(`Originales faltantes: ${missingOriginals}`);
      console.log(`Optimizadas faltantes: ${missingOptimized}`);
      console.log(`Miniaturas faltantes: ${missingThumbs}`);
      
      // Guardar el reporte
      reportContent += '\n## Todas las imágenes requeridas\n\n';
      reportContent += 'Lista completa de todas las imágenes necesarias:\n\n';
      
      for (const row of result.rows) {
        const { id_producto, id_imagen, nombre_archivo, nombre_optimizado, nombre_miniatura } = row;
        reportContent += `### Producto ${id_producto}, Imagen ${id_imagen}\n\n`;
        reportContent += `- Original: \`${nombre_archivo}\`\n`;
        reportContent += `- Optimizada: \`${nombre_optimizado}\`\n`;
        reportContent += `- Miniatura: \`${nombre_miniatura}\`\n\n`;
      }
      
      const reportPath = path.join(__dirname, '../public/uploads/reporte_imagenes.md');
      fs.writeFileSync(reportPath, reportContent);
      
      console.log(`\nSe ha guardado un reporte detallado en: ${reportPath}`);
      console.log('Este reporte le ayudará a identificar todas las imágenes necesarias para la migración.');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al verificar el estado de las imágenes:', error);
  }
}

// Ejecutar la verificación
console.log('Herramienta de verificación de imágenes para ESCOMPARTE');
console.log('Esta herramienta verifica qué imágenes están presentes y cuáles faltan');
console.log(`Carpeta de imágenes: ${PRODUCTOS_FOLDER}`);
console.log('-------------------------------------------');

checkImagesStatus();
