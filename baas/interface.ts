export interface User {
  userId: string;
  email: string;
  password: string;
  type: "bypass" | "google" | "passwordLess";
  confirmed: "true" | "false";
}
