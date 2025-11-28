import z from "zod";

export const signUpValidator = z.object({
  email: z.email(),
  password: z.string().min(1, { error: "Password is required" }),
  isAdmin: z.string().optional(),
});

export const loginValidator = z.object({
  email: z.email(),
  password: z.string().min(1, { error: "Paasword is required" }),
});
