import { generateToken, verifyToken } from '../src/lib/jwt';

describe('JWT Utils', () => {
  const mockUserId = '123';
  const mockEmail = 'test@example.com';

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUserId, mockEmail);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockUserId, mockEmail);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockEmail);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });
  });
});