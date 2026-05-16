export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  conditions?: string[];
  preferences?: Record<string, unknown>;
}
