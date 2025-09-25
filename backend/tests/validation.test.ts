import { validate, formatZodErrors } from '../src/utils/validation';
import { z, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

interface ExtendedRequest extends Request {
  validatedData?: any;
  validatedQuery?: any;
  validatedParams?: any;
}

describe('Validation Utils', () => {
  let mockReq: Partial<ExtendedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {}, query: {}, params: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('validate', () => {
    const userSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
    });

    it('should validate body successfully', () => {
      mockReq.body = { name: 'John', email: 'john@example.com' };
      
      const middleware = validate({ body: userSchema });
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.validatedData).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should return validation error for invalid data', () => {
      mockReq.body = { name: '', email: 'invalid' };
      
      const middleware = validate({ body: userSchema });
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.any(Array),
      });
    });
  });

  describe('formatZodErrors', () => {
    it('should format Zod errors correctly', () => {
      try {
        z.string().parse(123);
      } catch (error) {
        if (error instanceof ZodError) {
          const formatted = formatZodErrors(error);
          expect(formatted).toHaveLength(1);
          expect(formatted[0].field).toBe('');
          expect(typeof formatted[0].message).toBe('string');
        }
      }
    });
  });
});