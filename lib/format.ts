export const number = (value: number) => new Intl.NumberFormat("fr-FR").format(value);
export const percent = (value: number) => new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 2 }).format(value);
export const dateTime = (value: number) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(value);
export const dateOnly = (value: number) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(value);
