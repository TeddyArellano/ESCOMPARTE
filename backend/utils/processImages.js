import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta a la carpeta de imágenes de productos
const PRODUCTOS_FOLDER = path.join(__dirname, '../public/uploads/productos');

// Función para procesar una imagen y generar versiones optimizadas
async function processImage(fileName) {
  try {
    // Ruta completa al archivo
    const filePath = path.join(PRODUCTOS_FOLDER, fileName);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`El archivo ${fileName} no existe`);
      return false;
    }
    
    // Obtener extensión del archivo
    const ext = path.extname(fileName);
    const nameWithoutExt = fileName.replace(ext, '');
    
    // Nombres para versiones optimizadas
    const optimizedName = `${nameWithoutExt}_optimized${ext}`;
    const thumbnailName = `${nameWithoutExt}_thumb${ext}`;
    
    // Rutas para versiones optimizadas
    const optimizedPath = path.join(PRODUCTOS_FOLDER, optimizedName);
    const thumbnailPath = path.join(PRODUCTOS_FOLDER, thumbnailName);
    
    console.log(`Procesando imagen: ${fileName}`);
    
    // Crear versión optimizada (máximo 800px de ancho)
    await sharp(filePath)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(optimizedPath);
      
    console.log(`Versión optimizada creada: ${optimizedName}`);
    
    // Crear miniatura (200x200)
    await sharp(filePath)
      .resize({ width: 200, height: 200, fit: 'cover' })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
      
    console.log(`Miniatura creada: ${thumbnailName}`);
    
    return true;
  } catch (error) {
    console.error(`Error al procesar la imagen ${fileName}:`, error);
    return false;
  }
}

// Función para procesar todas las imágenes originales en la carpeta
async function processAllImages() {
  try {
    // Verificar que la carpeta existe
    if (!fs.existsSync(PRODUCTOS_FOLDER)) {
      console.error(`La carpeta ${PRODUCTOS_FOLDER} no existe`);
      console.log('Creando carpeta...');
      fs.mkdirSync(PRODUCTOS_FOLDER, { recursive: true });
      console.log('Carpeta creada. Por favor coloque las imágenes originales y vuelva a ejecutar este script.');
      return;
    }
    
    // Leer todos los archivos en la carpeta
    const files = fs.readdirSync(PRODUCTOS_FOLDER);
    
    // Filtrar solo archivos de imagen originales (que no sean _optimized o _thumb)
    const originalImages = files.filter(file => {
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
      const isOriginal = !file.includes('_optimized') && !file.includes('_thumb');
      return isImage && isOriginal;
    });
    
    if (originalImages.length === 0) {
      console.log('No se encontraron imágenes originales en la carpeta.');
      console.log(`Por favor coloque las imágenes en: ${PRODUCTOS_FOLDER}`);
      return;
    }
    
    console.log(`Se encontraron ${originalImages.length} imágenes originales.`);
    
    // Procesar cada imagen
    let processed = 0;
    let failed = 0;
    
    for (const image of originalImages) {
      const success = await processImage(image);
      if (success) {
        processed++;
      } else {
        failed++;
      }
    }
    
    console.log('\n===== RESUMEN =====');
    console.log(`Total de imágenes: ${originalImages.length}`);
    console.log(`Procesadas exitosamente: ${processed}`);
    console.log(`Fallidas: ${failed}`);
    
  } catch (error) {
    console.error('Error al procesar las imágenes:', error);
  }
}

// Ejecutar el procesamiento
console.log('Utilidad de procesamiento de imágenes para ESCOMPARTE');
console.log('Esta herramienta procesa imágenes originales y genera versiones optimizadas y miniaturas');
console.log(`Carpeta de imágenes: ${PRODUCTOS_FOLDER}`);
console.log('-------------------------------------------');

processAllImages();
