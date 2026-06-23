import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    all: string;
    loading: string;
    empty: string;
    clients: (n: number | string) => string;
    dash: string;
    status: {
      NEW: string;
      CONTACTED: string;
      QUALIFIED: string;
      DISCARDED: string;
    };
    locale: string;
  }
> = {
  pt: {
    title: "Leads (interesse)",
    subtitle: "Manifestações de interesse vindas da landing (cadastro self-service também disponível).",
    all: "Todos",
    loading: "Carregando...",
    empty: "Nenhum lead ainda.",
    clients: (n) => `${n} clientes`,
    dash: "—",
    status: {
      NEW: "Novo",
      CONTACTED: "Contatado",
      QUALIFIED: "Qualificado",
      DISCARDED: "Descartado",
    },
    locale: "pt-BR",
  },
  en: {
    title: "Leads (interest)",
    subtitle: "Interest submissions coming from the landing page (self-service sign-up also available).",
    all: "All",
    loading: "Loading...",
    empty: "No leads yet.",
    clients: (n) => `${n} clients`,
    dash: "—",
    status: {
      NEW: "New",
      CONTACTED: "Contacted",
      QUALIFIED: "Qualified",
      DISCARDED: "Discarded",
    },
    locale: "en-US",
  },
  es: {
    title: "Leads (interés)",
    subtitle: "Manifestaciones de interés provenientes de la landing (registro self-service también disponible).",
    all: "Todos",
    loading: "Cargando...",
    empty: "Aún no hay leads.",
    clients: (n) => `${n} clientes`,
    dash: "—",
    status: {
      NEW: "Nuevo",
      CONTACTED: "Contactado",
      QUALIFIED: "Calificado",
      DISCARDED: "Descartado",
    },
    locale: "es-419",
  },
};
