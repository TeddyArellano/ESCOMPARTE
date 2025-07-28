-- Script para actualizar registros existentes con nombres de archivo estáticos
-- Este script genera nombres de archivo basados en el ID del producto y el ID de la imagen
-- Sin intentar descargar o procesar las imágenes reales

-- Actualizar los nombres de archivo para todos los registros existentes
UPDATE imagenes_productos
SET 
  nombre_archivo = 'producto_' || id_producto || '_' || id_imagen || '.jpg',
  nombre_optimizado = 'producto_' || id_producto || '_' || id_imagen || '_optimized.jpg',
  nombre_miniatura = 'producto_' || id_producto || '_' || id_imagen || '_thumb.jpg'
WHERE 
  nombre_archivo IS NULL;

-- Mostrar registros actualizados (para verificación)
SELECT id_imagen, id_producto, url_imagen, nombre_archivo, nombre_optimizado, nombre_miniatura
FROM imagenes_productos
ORDER BY id_producto, id_imagen;
