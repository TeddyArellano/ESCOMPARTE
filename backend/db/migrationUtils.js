import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from '../config.js';

// Obtener el directorio actual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para ejecutar migraciones
export async function applyMigration(migrationName) {
  try {
    const client = await pool.connect();
    
    try {
      // Iniciar transacción
      await client.query('BEGIN');
      
      // Leer y ejecutar el archivo SQL
      const filePath = path.join(__dirname, migrationName);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Applying migration: ${migrationName}`);
      await client.query(sql);
      
      // Confirmar transacción
      await client.query('COMMIT');
      console.log(`Migration ${migrationName} applied successfully`);
    } catch (error) {
      // Revertir transacción en caso de error
      await client.query('ROLLBACK');
      console.error(`Error applying migration ${migrationName}:`, error);
      throw error;
    } finally {
      // Liberar cliente
      client.release();
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}
