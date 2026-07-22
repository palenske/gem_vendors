import type { ResellerStatus } from "@localizador/shared";

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

/**
 * Configurações para exibição de status de revendedora.
 *
 * Design system: Pro-Locate Unified System
 */
export function getStatusConfig(status: ResellerStatus): StatusConfig {
  const baseConfig: Record<ResellerStatus, StatusConfig> = {
    ATIVA: {
      label: "Ativa",
      bgColor: "bg-tertiary-container",
      textColor: "text-tertiary-on-container",
    },
    INATIVA: {
      label: "Inativa",
      bgColor: "bg-surface-container-high",
      textColor: "text-on-surface-variant",
    },
    EM_PROSPECCAO: {
      label: "Em Prospecção",
      bgColor: "bg-surface-container-highest",
      textColor: "text-on-surface-variant",
    },
  };

  return baseConfig[status];
}
