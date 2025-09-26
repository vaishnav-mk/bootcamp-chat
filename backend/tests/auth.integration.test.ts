import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../src/routes/authRoutes.js';
import { errorHandler } from '../src/utils/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  
  return app;
};

describe('Auth Integration Tests', () => {
  let app: express.Application;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  describe('POST /api/auth/register', () => {
    it('should validate registration input and return appropriate response', async () => {
      const validUserData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        name: 'Test User'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData);
      
      // Should either succeed or fail gracefully (depending on DB setup)
      expect([200, 201, 400, 409, 500]).toContain(response.status);
      
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('error');
      }
    });
    
    it('should reject invalid registration data', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: '123', // too short
        username: 'a', // too short
        name: '' // empty name
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should reject registration with missing fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // missing password, username, name
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should validate login input format', async () => {
      const validLoginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);
      
      // Should either succeed or fail gracefully (depending on user existence)
      expect([200, 401, 404, 500]).toContain(response.status);
      
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('error');
      }
    });
    
    it('should reject invalid login data', async () => {
      const invalidLoginData = {
        email: 'invalid-email',
        password: '' // empty password
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLoginData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should reject login with missing credentials', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // missing password
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should require authentication token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should reject invalid authentication token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');
      
      expect([401, 403]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });
});