import type { CspReportDto } from "@/api/cspReport.api";

type CspReportView = {
  id: number;
  violatedDirective: string;
  documentUri: string;
  blockedUri: string;
  date: string;
};

const toView = (dto: CspReportDto): CspReportView => ({
  id: dto.id,
  violatedDirective: dto.payload["violated-directive"] ?? "",
  documentUri: dto.payload["document-uri"] ?? "",
  blockedUri: dto.payload["blocked-uri"] ?? "",
  date: new Date(dto.createdAt).toLocaleString("fr-FR"),
});

export { toView };
export type { CspReportView };
