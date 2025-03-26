import { app } from "@/atoms/kuepa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { leadService } from "@/services/leadService";
import { IProgram, LeadFormValues, leadSchema } from "@/types/lead";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";

export interface LeadsProps {
  mode?: "list" | "create";
}

const predefinedPrograms: IProgram[] = [
  {
    _id: "1",
    name: "Técnico laboral en auxiliar administrativo",
    description: "Programa de formación en labores administrativas básicas",
  },
  {
    _id: "2",
    name: "Técnico laboral en mercadeo y ventas",
    description: "Formación en técnicas de ventas y estrategias de mercadeo",
  },
  {
    _id: "3",
    name: "Técnico laboral en hoteleria y turismo",
    description: "Capacitación en servicios hoteleros y turísticos",
  },
  {
    _id: "4",
    name: "Técnico laboral en procesamiento y digitación de datos",
    description:
      "Entrenamiento en manejo y procesamiento de información digital",
  },
  {
    _id: "5",
    name: "Técnico laboral en contabilidad y finanzas",
    description: "Formación en principios contables y financieros básicos",
  },
];

const DEFAULT_CAMPAIGN_ID = "67e46027c13cec9e6b46b799";
const DEFAULT_USER_ID = "67e3720c2b0e4aa7ffe7a190";

export default function Leads(props?: LeadsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"list" | "create">(props?.mode || "list");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastData, setToastData] = useState({
    title: "",
    description: "",
    variant: "default" as "default" | "destructive",
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      campaign: DEFAULT_CAMPAIGN_ID,
      user: DEFAULT_USER_ID,
    },
  });

  useEffect(() => {
    app.set({
      ...(app.get() || {}),
      app: "kuepa",
      module: "leads",
      window: "crm",
      back: mode === "create" ? () => setMode("list") : null,
      accent: "purple",
      breadcrumb: [
        {
          title: "Leads",
          url: "/leads",
        },
        ...(mode === "create" ? [{ title: "Nuevo", url: "/leads/new" }] : []),
      ],
    });
  }, [mode]);

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    setToastData({
      title,
      description:
        description.length > 100
          ? `${description.substring(0, 100)}...`
          : description,
      variant,
    });
    setToastOpen(true);
  };

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true);

    try {
      const selectedProgram = predefinedPrograms.find(
        (program) => program._id === data.interestProgram
      );

      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        mobile_phone: data.mobile_phone,
        interestProgram: selectedProgram?.name || "",
        campaign: data.campaign,
        user: data.user,
        status: "active",
        full_name: `${data.first_name} ${data.last_name}`,
      };

      console.log(
        "Payload enviado al backend:",
        JSON.stringify(payload, null, 2)
      );

      const response = await leadService.create(payload);

      console.log("Respuesta del backend:", response);

      if (response?.success) {
        showToast("Éxito", "Lead creado correctamente");
        reset();
        setMode("list");
      } else {
        showToast(
          "Error",
          response?.error || "Error al crear lead",
          "destructive"
        );
      }
    } catch (error: any) {
      showToast(
        "Error",
        error.message || "Error en la conexión con el servidor",
        "destructive"
      );
      console.error("Error al crear lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "first_name",
      label: "Nombre",
      type: "text",
      colSpan: "md:col-span-1",
    },
    {
      name: "last_name",
      label: "Apellido",
      type: "text",
      colSpan: "md:col-span-1",
    },
    {
      name: "email",
      label: "Correo electrónico",
      type: "email",
      colSpan: "md:col-span-2",
    },
    {
      name: "mobile_phone",
      label: "Teléfono móvil",
      type: "tel",
      colSpan: "md:col-span-2",
    },
    {
      name: "campaign",
      type: "hidden",
    },
    {
      name: "user",
      type: "hidden",
    },
  ];

  const renderCreateView = () => (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          accent="purple"
          onClick={() => setMode("list")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold text-purple-800">Nuevo Lead</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formFields.map((field) =>
            field.type === "hidden" ? (
              <input
                key={field.name}
                type="hidden"
                {...register(field.name as keyof LeadFormValues)}
              />
            ) : (
              <div key={field.name} className={`space-y-2 ${field.colSpan}`}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <Input
                  id={field.name}
                  type={field.type}
                  {...register(field.name as keyof LeadFormValues)}
                  className="w-full"
                />
                {errors[field.name as keyof typeof errors] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            )
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="interestProgram"
            className="block text-sm font-medium text-gray-700"
          >
            Programa de interés
          </label>
          <Controller
            name="interestProgram"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un programa" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedPrograms.map((program) => (
                    <SelectItem key={program._id} value={program._id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.interestProgram && (
            <p className="text-sm text-red-500 mt-1">
              {errors.interestProgram.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full mt-4" tone="purple" size="lg">
          {loading ? "Guardando..." : "Crear Lead"}
        </Button>
      </form>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-800">Gestión de Leads</h1>
        <Button
          onClick={() => setMode("create")}
          tone="purple"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Lead
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No hay leads registrados aún</p>
      </div>
    </div>
  );

  return (
    <ToastProvider swipeDirection="right">
      {mode === "create" ? renderCreateView() : renderListView()}

      <ToastViewport className="fixed bottom-0 right-0 z-[100] w-full max-w-[420px] p-4" />
      <Toast
        open={toastOpen}
        onOpenChange={setToastOpen}
        duration={5000}
        variant={toastData.variant}
      >
        <ToastTitle>{toastData.title}</ToastTitle>
        <ToastDescription>{toastData.description}</ToastDescription>
      </Toast>
    </ToastProvider>
  );
}
