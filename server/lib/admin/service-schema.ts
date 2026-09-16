import { z } from "zod";
import type { Service } from "@/lib/data/types";

/** Validation schema for a Service coming from the admin form. */
const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
});

const stringItem = z.string().trim().min(1, "Cannot be empty").max(400);

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  title: z.string().trim().min(1, "Title is required").max(160),
  categorySlug: z.string().trim().min(1, "Category is required").max(120),
  icon: z.string().trim().min(1, "Icon is required").max(24),
  image: z.string().trim().max(500).nullable().optional(),
  shortDescription: z.string().trim().min(1, "Short description is required").max(400),
  fullDescription: z.string().trim().min(1, "Full description is required").max(4000),
  problem: z.string().trim().min(1, "Problem text is required").max(4000),
  price: z.coerce.number().int().min(0),
  discountPrice: z
    .union([z.coerce.number().int().min(0), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  duration: z.string().trim().min(1, "Duration is required").max(120),
  gradient: z.string().trim().min(1, "Gradient is required").max(160),
  analysis: z.array(stringItem),
  receive: z.array(stringItem),
  benefits: z.array(stringItem),
  remedies: z.array(stringItem),
  faqs: z.array(faqSchema),
  featured: z.boolean(),
  order: z.coerce.number().int(),
  active: z.boolean(),
});

export type ServiceInput = z.input<typeof serviceSchema>;

/** Normalise a validated payload into a fully-typed Service record. */
export function toService(data: z.output<typeof serviceSchema>): Service {
  return {
    ...data,
    discountPrice: data.discountPrice ?? null,
  };
}
