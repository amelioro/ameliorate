import { z } from "zod";

export type InfoCategory = "breakdown" | "research" | "justification";

export const formats = ["diagram", "table"] as const;
export const zFormats = z.enum(formats);
export type Format = z.infer<typeof zFormats>;
