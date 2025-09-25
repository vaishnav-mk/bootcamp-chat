import { registerSchema, loginSchema, updateProfileSchema } from '../src/validations/userSchemas';

describe('User Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        name: 'Test User'
      };

      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        username: 'testuser',
        name: 'Test User'
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
        username: 'testuser',
        name: 'Test User'
      };

      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        username: 'newusername',
        name: 'New Name'
      };

      expect(() => updateProfileSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty object', () => {
      expect(() => updateProfileSchema.parse({})).not.toThrow();
    });

    it('should reject short username', () => {
      const invalidData = {
        username: 'a'
      };

      expect(() => updateProfileSchema.parse(invalidData)).toThrow();
    });
  });
});