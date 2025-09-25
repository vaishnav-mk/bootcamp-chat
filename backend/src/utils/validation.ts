import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

const VALIDATION_FAILED = 'Validation failed';
const QUERY_VALIDATION_FAILED = 'Query validation failed';
const PARAMETER_VALIDATION_FAILED = 'Parameter validation failed';
const INTERNAL_SERVER_ERROR = 'Internal server error';

export const formatZodErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

export const validateSchema = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = {
        body: req.body ? schema.parse(req.body) : undefined,
        query: req.query,
        params: req.params,
      };

      req.validatedData = validatedData.body as T;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        res.status(400).json({
          error: VALIDATION_FAILED,
          details: validationErrors,
        });
      } else {
        res.status(500).json({ error: INTERNAL_SERVER_ERROR });
      }
    }
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.validatedQuery = validatedQuery as T;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        res.status(400).json({
          error: QUERY_VALIDATION_FAILED,
          details: validationErrors,
        });
      } else {
        res.status(500).json({ error: INTERNAL_SERVER_ERROR });
      }
    }
  };
};

export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedParams = schema.parse(req.params);
      req.validatedParams = validatedParams as T;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        res.status(400).json({
          error: PARAMETER_VALIDATION_FAILED,
          details: validationErrors,
        });
      } else {
        res.status(500).json({ error: INTERNAL_SERVER_ERROR });
      }
    }
  };
};