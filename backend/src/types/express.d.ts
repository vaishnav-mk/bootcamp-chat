declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      validatedData?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

export {};