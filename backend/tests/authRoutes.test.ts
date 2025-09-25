import { registerSchema, loginSchema } from '../src/validations/userSchemas';

describe('Auth Integration', () => {
  describe('Registration validation', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        name: 'Test User'
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid registration data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
        username: 'a',
        name: ''
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Login validation', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});