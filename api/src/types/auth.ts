export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

// Augment Express's Request so `req.user` and `req.id` are typed everywhere.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      id?: string;
    }
  }
}
