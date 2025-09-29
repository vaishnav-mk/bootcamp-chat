import request from 'supertest';
import express from 'express';
import messageRoutes from '../src/routes/messageRoutes.js';


const createSimpleTestApp = () => {
  const app = express();
  app.use(express.json());
  
  
  app.use((req: any, res: any, next: any) => {
    req.user = { id: '123456789', email: 'test@example.com' };
    next();
  });
  
  app.use('/api/messages', messageRoutes);
  
  
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(500).json({ error: err.message });
  });
  
  return app;
};

describe('Message Routes Basic Tests', () => {
  let app: express.Application;
  
  beforeAll(() => {
    app = createSimpleTestApp();
  });

  describe('POST /api/messages', () => {
    it('should return error for invalid message data', async () => {
      const invalidData = {
        conversation_id: '', 
        content: ''  
      };

      const response = await request(app)
        .post('/api/messages')
        .send(invalidData);

      
      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    it('should return error when missing required fields', async () => {
      const incompleteData = {
        content: 'Valid content'
        
      };

      const response = await request(app)
        .post('/api/messages')
        .send(incompleteData);

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/messages/:messageId', () => {
    it('should return error for invalid edit data', async () => {
      const invalidEditData = {
        content: '' 
      };

      const response = await request(app)
        .put('/api/messages/123456789')
        .send(invalidEditData);

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/messages/conversations/:conversationId', () => {
    it('should accept valid conversation ID format', async () => {
      
      
      const response = await request(app)
        .get('/api/messages/conversations/123456789');

      
      expect(response.status).not.toBe(400);
    });

    it('should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/messages/conversations/123456789?limit=10&offset=0');

      
      expect(response.status).not.toBe(400);
    });
  });
});