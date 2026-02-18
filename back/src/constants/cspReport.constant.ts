export const MAX_REPORTS = 100;

export const VALID_CSP_FIELDS: string[] = [
    "document-uri",
    "referrer",
    "violated-directive",
    "effective-directive",
    "original-policy",
    "disposition",
    "blocked-uri",
    "line-number",
    "column-number",
    "source-file",
    "status-code",
    "script-sample",
] as const;
