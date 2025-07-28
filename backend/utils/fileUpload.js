import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtener el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definir la carpeta de destino para las imágenes de productos
const PRODUCTOS_FOLDER = path.join(__dirname, '../public/uploads/productos');

// Crear la carpeta de uploads si no existe
if (!fs.existsSync(PRODUCTOS_FOLDER)) {
  fs.mkdirSync(PRODUCTOS_FOLDER, { recursive: true });
}

// Configuración del almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCTOS_FOLDER);
  },
  filename: (req, file, cb) => {
    // Generar un nombre de archivo único basado en timestamp y ID del producto
    const productId = req.params.id || 'nuevo';
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `producto_${productId}_${timestamp}${fileExt}`);
  }
});

// Filtro para asegurar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes (jpg, jpeg, png, gif, webp)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)'), false);
  }
};

// Crear el middleware de multer
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Función para procesar la imagen y generar versiones optimizadas
export const processImage = async (filePath, fileName, targetWidth = 800) => {
  try {
    // Obtener extensión del archivo
    const ext = path.extname(fileName);
    const nameWithoutExt = fileName.replace(ext, '');
    
    // Directorio de destino
    const destDir = path.dirname(filePath);
    
    // Ruta para la imagen optimizada
    const optimizedPath = path.join(destDir, `${nameWithoutExt}_optimized${ext}`);
    
    // Ruta para la miniatura
    const thumbnailPath = path.join(destDir, `${nameWithoutExt}_thumb${ext}`);
    
    // Procesar la imagen para versión optimizada (anchura máxima de 800px)
    await sharp(filePath)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(optimizedPath);
      
    // Crear miniatura (200px)
    await sharp(filePath)
      .resize({ width: 200, height: 200, fit: sharp.fit.cover })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
      
    return {
      original: fileName,
      optimized: `${nameWithoutExt}_optimized${ext}`,
      thumbnail: `${nameWithoutExt}_thumb${ext}`
    };
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    throw error;
  }
};

// Función para eliminar archivos de imagen
export const deleteImageFiles = async (fileName) => {
  try {
    const ext = path.extname(fileName);
    const nameWithoutExt = fileName.replace(ext, '');
    
    const filePath = path.join(PRODUCTOS_FOLDER, fileName);
    const optimizedPath = path.join(PRODUCTOS_FOLDER, `${nameWithoutExt}_optimized${ext}`);
    const thumbnailPath = path.join(PRODUCTOS_FOLDER, `${nameWithoutExt}_thumb${ext}`);
    
    // Eliminar las tres versiones si existen
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(optimizedPath)) fs.unlinkSync(optimizedPath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    
    return true;
  } catch (error) {
    console.error('Error al eliminar archivos de imagen:', error);
    throw error;
  }
};
