import { z } from "zod";

export interface ILead {
  _id?: string; // Nuevo campo para upsert
  incremental?: number;
  number?: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  interestProgram: string;
  campaign: string; // Nuevo campo requerido
  user?: string; // Opcional para usuario autenticado
  adviser?: string; // Opcional para el asesor
  status?: "active" | "inactive" | "grading" | "dropped" | "sold"; // Estados actualizados
  trackings?: Array<{
    tracking: string;
    interest?: number;
    created_at?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface IProgram {
  _id: string;
  name: string;
  description?: string;
}

// Schema para formulario público (external)
export const leadExternalSchema = z.object({
  first_name: z.string().min(2, "Mínimo 2 caracteres"),
  last_name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Correo inválido"),
  mobile_phone: z.string().regex(/^[0-9]{10,15}$/, "Teléfono inválido"),
  interestProgram: z.string().min(1, "Selecciona un programa"),
  number: z.string().optional(), // Para el campo que espera el backend
});

export const leadSchema = z.object({
  first_name: z.string().min(2, "Mínimo 2 caracteres"),
  last_name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Correo inválido"),
  mobile_phone: z.string().regex(/^[0-9]{10,15}$/, "Teléfono inválido"),
  interestProgram: z.string().min(1, "Selecciona un programa"),
  number: z.string().optional(),
  campaign: z.string().min(1, "Campaña es requerida"),
  user: z.string().min(1, "Usuario es requerido"),
  status: z.string().optional(),
  full_name: z.string().optional(),
});

// Schema para formulario autenticado (upsert)
export const leadUpsertSchema = leadExternalSchema.extend({
  campaign: z.string().min(1, "La campaña es requerida"),
  user: z.string().optional(),
  status: z
    .enum(["active", "inactive", "grading", "dropped", "sold"])
    .optional(),
});

// Tipo base
export type LeadFormValues = z.infer<typeof leadSchema>;

// Tipos específicos
export type LeadUpsertValues = z.infer<typeof leadUpsertSchema>;
export type LeadExternalValues = z.infer<typeof leadExternalSchema>;

// Tipo para respuesta del servidor
export interface LeadResponse {
  success: boolean;
  object?: ILead;
  error?: string;
  code?: number;
}
