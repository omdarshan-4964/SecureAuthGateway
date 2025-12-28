import { JWTPayload } from './index';

/**
 * EXTEND EXPRESS REQUEST TYPE
 ** "I extended Express's Request type to include our custom 'user' property.
 * This is TypeScript's declaration merging feature - it allows us to augment
 * third-party types without modifying their source code. This gives us full
 * type safety when accessing req.user in our controllers and middleware."
 */

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
