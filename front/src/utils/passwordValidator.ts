import { z } from "zod";

export const passwordSchema = z
    .string()
    .min(15, "Le mot de passe doit contenir au moins 15 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial");

export const registerSchema = z.object({
    email: z.email("Adresse email invalide"),
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.email("Adresse email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
