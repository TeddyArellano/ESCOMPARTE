import { pool } from './config.js';

// Add a column to an existing table if it doesn't exist
const addColumnIfNotExists = async (client, table, column, dataType) => {
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = '${table}'
        AND column_name = '${column}'
      ) THEN
        ALTER TABLE ${table} ADD COLUMN ${column} ${dataType};
      END IF;
    END
    $$;
  `);
};

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Create role_usuario_enum if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_usuario_enum') THEN
          CREATE TYPE role_usuario_enum AS ENUM ('usuario', 'vendedor');
        END IF;
      END
      $$;
    `);
    
    // Add rol column to usuarios table if it doesn't exist
    await addColumnIfNotExists(client, 'usuarios', 'rol', 'role_usuario_enum DEFAULT \'usuario\'');

    // Create usuario table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario SERIAL PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        p_apellido VARCHAR(100) NOT NULL,
        s_apellido VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL UNIQUE,
        telefono VARCHAR(15),
        rol role_usuario_enum DEFAULT 'usuario',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create info_academica table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS info_academica (
        id_info_academica SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        escuela VARCHAR(255) NOT NULL,
        carrera VARCHAR(255) NOT NULL,
        semestre VARCHAR(50),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      )
    `);
    
    // Create estado_producto_enum if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_producto_enum') THEN
          CREATE TYPE estado_producto_enum AS ENUM ('nuevo', 'usado', 'donacion');
        END IF;
      END
      $$;
    `);
    
    // Create estado_carrito_enum if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_carrito_enum') THEN
          CREATE TYPE estado_carrito_enum AS ENUM ('activo', 'procesando', 'completado', 'cancelado');
        END IF;
      END
      $$;
    `);
    
    // Create productos table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id_producto SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        existencia INTEGER CHECK (existencia >= 0),
        precio NUMERIC(10,2),
        estado estado_producto_enum,
        id_usuario INTEGER,
        fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      )
    `);
    
    // Create imagenes_productos table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS imagenes_productos (
        id_imagen SERIAL PRIMARY KEY,
        id_producto INTEGER,
        url_imagen VARCHAR(255),
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
      )
    `);
    
    // Create carritos table if not exists (representa el carrito de un usuario)
    await client.query(`
      CREATE TABLE IF NOT EXISTS carritos (
        id_carrito SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado estado_carrito_enum DEFAULT 'activo',
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      )
    `);
    
    // Create items_carrito table if not exists (productos en un carrito)
    await client.query(`
      CREATE TABLE IF NOT EXISTS items_carrito (
        id_item_carrito SERIAL PRIMARY KEY,
        id_carrito INTEGER NOT NULL,
        id_producto INTEGER NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        precio_unitario NUMERIC(10,2) NOT NULL,
        fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito) ON DELETE CASCADE,
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
        UNIQUE(id_carrito, id_producto)
      )
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database tables created or already exist');
    return true;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error creating database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const seedProducts = async () => {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if we already have products
    const checkResult = await client.query('SELECT COUNT(*) FROM productos');
    if (parseInt(checkResult.rows[0].count) > 0) {
      console.log('Products already seeded, skipping seed');
      await client.query('COMMIT');
      return;
    }
    
    // Get first user for sample products
    const userResult = await client.query('SELECT id_usuario FROM usuarios LIMIT 1');
    
    if (userResult.rows.length === 0) {
      console.log('No users found, cannot seed products');
      await client.query('COMMIT');
      return;
    }
    
    const userId = userResult.rows[0].id_usuario;
    
    // Sample products
    const sampleProducts = [
      {
        nombre: "Arduino Mega 2560",
        descripcion: "Placa de desarrollo con 54 pines digitales I/O, ideal para proyectos complejos",
        existencia: 5,
        precio: 350,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Kit de Resistencias 1/4W",
        descripcion: "Set completo de 500 resistencias de diferentes valores (10Ω - 1MΩ)",
        existencia: 10,
        precio: 120,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Sensores Ultrasónicos HC-SR04",
        descripcion: "Pack de 3 sensores para medición de distancia, rango de 2-400cm",
        existencia: 8,
        precio: 90,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Pantalla OLED 0.96 pulgadas I2C",
        descripcion: "Display OLED monocromático 128x64 para visualización de datos",
        existencia: 15,
        precio: 65,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Módulo ESP32",
        descripcion: "Microcontrolador con conectividad WiFi y Bluetooth para proyectos IoT",
        existencia: 3,
        precio: 180,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Raspberry Pi 4 (4GB)",
        descripcion: "Computadora de placa única, ideal para proyectos de automatización",
        existencia: 2,
        precio: 1500,
        estado: "usado",
        id_usuario: userId
      },
      {
        nombre: "Kit de Protoboard y Jumpers",
        descripcion: "Protoboard 830 puntos con 120 cables jumper M/M, M/H, H/H",
        existencia: 7,
        precio: 150,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Display LCD 16x2 con I2C",
        descripcion: "Pantalla LCD con adaptador I2C para facilitar la conexión",
        existencia: 12,
        precio: 85,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Sensor de Temperatura DS18B20",
        descripcion: "Sensor digital de temperatura impermeable con rango -55°C a +125°C",
        existencia: 20,
        precio: 60,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Motor Servo SG90",
        descripcion: "Mini servo de 9g, rotación 180°, ideal para proyectos de robótica",
        existencia: 15,
        precio: 45,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Módulo Relé 4 Canales",
        descripcion: "Módulo de relés optoacoplado para control de dispositivos de alta potencia",
        existencia: 5,
        precio: 95,
        estado: "nuevo",
        id_usuario: userId
      },
      {
        nombre: "Libro 'Fundamentos de Arduino'",
        descripcion: "Manual completo para aprender a programar Arduino desde nivel básico a avanzado",
        existencia: 1,
        precio: 280,
        estado: "usado",
        id_usuario: userId
      }
    ];
    
    // Insert sample products
    for (const product of sampleProducts) {
      const insertQuery = `
        INSERT INTO productos 
          (nombre, descripcion, existencia, precio, estado, id_usuario)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        RETURNING id_producto
      `;
      
      const result = await client.query(insertQuery, [
        product.nombre,
        product.descripcion,
        product.existencia,
        product.precio,
        product.estado,
        product.id_usuario
      ]);
      
      const productId = result.rows[0].id_producto;
      
      // Add a placeholder image for each product
      await client.query(
        'INSERT INTO imagenes_productos (id_producto, url_imagen) VALUES ($1, $2)',
        [productId, `https://via.placeholder.com/300?text=${encodeURIComponent(product.nombre)}`]
      );
    }
    
    console.log('Sample products and images created successfully');
    await client.query('COMMIT');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error seeding products:', error);
  } finally {
    client.release();
  }
};

export { createTables, seedProducts };
