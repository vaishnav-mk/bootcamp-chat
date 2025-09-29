import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError, ValidationSchemas } from '../types';

export const formatZodErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

export const validate = <TBody = any, TQuery = any, TParams = any>(
  schemas: ValidationSchemas<ZodSchema<TBody>, ZodSchema<TQuery>, ZodSchema<TParams>>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.validatedData = schemas.body.parse(req.body);
      }
      
      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query);
      }
      
      if (schemas.params) {
        req.validatedParams = schemas.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        res.status(400).json({
          error: 'Validation failed',
          details: validationErrors,
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};