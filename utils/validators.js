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

export const createProductValidator = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  price: z
    .number()
    .min(0, { error: "Price is required and must be greater than zero (0)" }),
  description: z.string().min(1, { error: "Description is required" }),
  stock: z
    .number()
    .min(0, { error: "Price is required and must be greater than zero (0)" }),
});

export const updateProductValidator = createProductValidator.partial();

export const searchQueryValidator = z
  .string()
  .min(1, { error: "Search query must be a string and must not be empty." });

export const addProductToCartValidator = z.object({
  product: z
    .string()
    .min(1, { error: "Product must be included. Cannot be empty" }),
  amount: z.number().min(1, { error: "Amount cannot be negative or empty" }),
});

export const editCartValidator = addProductToCartValidator.partial();
