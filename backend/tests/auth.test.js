import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import { pool } from '../db/config.js';

describe('Auth API Tests', () => {
  let app;
  
  beforeAll(async () => {
    // Create express app for testing
    app = express();
    app.use(express.json());
    app.use('/api', authRoutes);
    
    // Clean test database before tests
    const client = await pool.connect();
    await client.query('BEGIN');
    try {
      // Delete test records if they exist
      await client.query('DELETE FROM info_academica WHERE id_usuario IN (SELECT id_usuario FROM usuarios WHERE correo = $1)', ['test@example.com']);
      await client.query('DELETE FROM usuarios WHERE correo = $1', ['test@example.com']);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error cleaning test database:', error);
    } finally {
      client.release();
    }
  });
  
  afterAll(async () => {
    // Close database connection
    await pool.end();
  });
  
  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          nombre: 'Test',
          apellidos: 'User Ejemplo',
          email: 'test@example.com',
          password: 'password123',
          escuela: 'Escuela Superior de Cómputo',
          carrera: 'Ingeniería en Sistemas Computacionales',
          semestre: '5'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toEqual('test@example.com');
    });
    
    it('should not register a user with existing email', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          nombre: 'Test',
          apellidos: 'User Duplicado',
          email: 'test@example.com', // Same email as previous test
          password: 'password123',
          escuela: 'Escuela Superior de Cómputo',
          carrera: 'Ingeniería en Sistemas Computacionales',
          semestre: '5'
        });
      
      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
    
    it('should not register a user with missing required fields', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          nombre: 'Test',
          email: 'another@example.com',
          password: 'password123'
          // Missing apellidos, escuela, carrera
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
  
  describe('POST /api/login', () => {
    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toEqual('test@example.com');
    });
    
    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
    
    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
    
    it('should require both email and password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com'
          // Missing password
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
});
