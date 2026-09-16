import { createContext, useContext, useState, type ReactNode } from "react";
import { ConsultationModal, type ConsultationService } from "./ConsultationModal";

interface ContextValue {
  openConsultation: (service: ConsultationService) => void;
}

const Ctx = createContext<ContextValue>({ openConsultation: () => {} });

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [service, setService] = useState<ConsultationService | null>(null);

  return (
    <Ctx.Provider value={{ openConsultation: setService }}>
      {children}
      {service && (
        <ConsultationModal service={service} onClose={() => setService(null)} />
      )}
    </Ctx.Provider>
  );
}

export function useConsultation() {
  return useContext(Ctx);
}
