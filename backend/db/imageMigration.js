import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from '../config.js';
import https from 'https';
import http from 'http';
import url from 'url';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';

// Obtener el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorio para las imágenes
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'productos');

// Asegurar que los directorios existan
async function ensureDirectoriesExist() {
  try {
    await fsPromises.mkdir(uploadsDir, { recursive: true });
    console.log(`Directorios creados o verificados: ${uploadsDir}`);
  } catch (err) {
    console.error('Error al crear directorios:', err);
    throw err;
  }
}

// Función para descargar una imagen desde una URL
function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    // Validar URL
    if (!imageUrl) {
      return reject(new Error('URL de imagen vacía'));
    }

    try {
      const parsedUrl = url.parse(imageUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      // Generar un nombre único para el archivo
      const fileExtension = path.extname(parsedUrl.pathname || '.jpg').toLowerCase() || '.jpg';
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      
      const file = fs.createWriteStream(filePath);
      
      const request = protocol.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Error al descargar la imagen: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve({
            fileName,
            filePath
          });
        });
      });
      
      request.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Borrar archivo parcial en caso de error
        reject(err);
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Borrar archivo parcial en caso de error
        reject(err);
      });
    } catch (err) {
      reject(new Error(`Error al procesar la URL: ${err.message}`));
    }
  });
}

// Función para optimizar imágenes y crear miniaturas
async function processImage(filePath, fileName) {
  try {
    const optimizedName = `opt_${fileName}`;
    const thumbnailName = `thumb_${fileName}`;
    
    const optimizedPath = path.join(uploadsDir, optimizedName);
    const thumbnailPath = path.join(uploadsDir, thumbnailName);
    
    // Optimizar imagen (redimensionar a máximo 1200px de ancho, manteniendo proporción)
    await sharp(filePath)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);
      
    // Crear miniatura (250px cuadrados)
    await sharp(filePath)
      .resize(250, 250, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);
      
    return {
      originalName: fileName,
      optimizedName,
      thumbnailName
    };
  } catch (err) {
    console.error('Error al procesar la imagen:', err);
    throw err;
  }
}

// Función principal para migrar imágenes
export async function migrateImages() {
  const client = await pool.connect();
  
  try {
    // Asegurar que existen los directorios
    await ensureDirectoriesExist();
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    // Obtener todas las imágenes que no han sido migradas
    const res = await client.query(`
      SELECT id_imagen, url_imagen 
      FROM imagenes_productos 
      WHERE url_imagen IS NOT NULL 
      AND (nombre_archivo IS NULL OR nombre_optimizado IS NULL OR nombre_miniatura IS NULL)
    `);
    
    console.log(`Encontradas ${res.rows.length} imágenes para migrar`);
    
    // Procesar cada imagen
    for (const row of res.rows) {
      try {
        console.log(`Procesando imagen ID ${row.id_imagen}, URL: ${row.url_imagen}`);
        
        // Descargar la imagen
        const { fileName, filePath } = await downloadImage(row.url_imagen);
        
        // Procesar la imagen (optimizar y generar miniatura)
        const { originalName, optimizedName, thumbnailName } = await processImage(filePath, fileName);
        
        // Actualizar el registro en la base de datos
        await client.query(`
          UPDATE imagenes_productos 
          SET nombre_archivo = $1, nombre_optimizado = $2, nombre_miniatura = $3 
          WHERE id_imagen = $4
        `, [originalName, optimizedName, thumbnailName, row.id_imagen]);
        
        console.log(`Imagen ID ${row.id_imagen} migrada exitosamente`);
      } catch (err) {
        console.error(`Error al migrar imagen ID ${row.id_imagen}:`, err);
        // Continuar con la siguiente imagen en caso de error
      }
    }
    
    // Confirmar transacción
    await client.query('COMMIT');
    console.log('Migración de imágenes completada exitosamente');
  } catch (err) {
    // Revertir transacción en caso de error
    await client.query('ROLLBACK');
    console.error('Error durante la migración de imágenes:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Ejecutar migración si se llama directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateImages()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Error en la migración:', err);
      process.exit(1);
    });
}
