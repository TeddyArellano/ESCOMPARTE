-- Actualizar la tabla imagenes_productos de manera segura
-- Verificar si la columna nombre_archivo existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'imagenes_productos' AND column_name = 'nombre_archivo'
    ) THEN
        ALTER TABLE imagenes_productos ADD COLUMN nombre_archivo VARCHAR(255);
    END IF;
    
    -- Verificar si la columna nombre_optimizado existe antes de agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'imagenes_productos' AND column_name = 'nombre_optimizado'
    ) THEN
        ALTER TABLE imagenes_productos ADD COLUMN nombre_optimizado VARCHAR(255);
    END IF;
    
    -- Verificar si la columna nombre_miniatura existe antes de agregarla
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'imagenes_productos' AND column_name = 'nombre_miniatura'
    ) THEN
        ALTER TABLE imagenes_productos ADD COLUMN nombre_miniatura VARCHAR(255);
    END IF;
END $$;
