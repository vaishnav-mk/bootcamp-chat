import { asyncWrap } from '../src/middleware/asyncWrap';
import { Request, Response, NextFunction } from 'express';

describe('AsyncWrap Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call next() for successful async function', async () => {
    const successHandler = async (req: Request, res: Response, next: NextFunction) => {
      res.json({ success: true });
    };

    const wrappedHandler = asyncWrap(successHandler);
    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
  });

  it('should call next() with error for failing async function', async () => {
    const error = new Error('Test error');
    const errorHandler = async () => {
      throw error;
    };

    const wrappedHandler = asyncWrap(errorHandler);
    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should handle promise rejection', async () => {
    const error = new Error('Promise rejected');
    const rejectHandler = async () => Promise.reject(error);

    const wrappedHandler = asyncWrap(rejectHandler);
    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});