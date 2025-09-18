export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;            // uuid
  title: string;
  message: string;
  severity: AlertSeverity;
  source: "contracts" | "dutydays" | "taxes" | "income" | "system";
  createdAt: string;     // ISO
  read: boolean;
}