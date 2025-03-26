import { LeadFormValues } from "@/types/lead";
import { get, post } from "../util/http";

const api = "/lead";

export const leadService = {
  api,

  get: async ({ _id }: { _id: string }) => {
    return await get({ api: `${api}/get/${_id}` });
  },

  create: async (data: LeadFormValues) => {
    try {
      const response = await post({
        api: `${api}/upsert`,
        options: {
          data: {
            ...data,
            number: data.mobile_phone, // Mapeo opcional para el backend
          },
        },
      });
      return response;
    } catch (error) {
      console.error("Error en create:", {
        input: { ...data, mobile_phone: "REDACTED" },
        error,
      });
      throw error;
    }
  },

  //!! Método alternativo para formularios públicos (usa /external)
  createExternal: async (data) => {
    try {
      // Añade estos campos para evitar errores
      const payload = {
        ...data,
        number: data.mobile_phone,
        // Campos que el backend espera pero no tienes
        campaign: "temp_campaign_id",
        user: "temp_user_id",
        ignore_interaction: true,
      };

      const response = await post({
        api: `${api}/external`,
        options: { data: payload },
      });

      return response;
    } catch (error) {
      console.error("Error creando lead:", error);
      throw new Error("El sistema no está completamente configurado");
    }
  },

  getPrograms: async () => {
    return await get({ api: "/api/programs" });
  },
};
