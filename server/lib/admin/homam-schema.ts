import { z } from "zod";
import type { Homam } from "@/lib/data/types";

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
});

const stringItem = z.string().trim().min(1, "Cannot be empty").max(400);

export const homamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  name: z.string().trim().min(1, "Name is required").max(160),
  icon: z.string().trim().min(1, "Icon is required").max(24),
  image: z.string().trim().max(500).nullable().optional(),
  shortBenefit: z.string().trim().min(1, "Short benefit is required").max(400),
  fullDescription: z.string().trim().min(1, "Full description is required").max(4000),
  price: z.coerce.number().int().min(0),
  discountPrice: z
    .union([z.coerce.number().int().min(0), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  duration: z.string().trim().min(1, "Duration is required").max(120),
  gradient: z.string().trim().min(1, "Gradient is required").max(160),
  benefits: z.array(stringItem),
  suitableFor: z.array(stringItem),
  poojaItems: z.array(stringItem),
  bookingInstructions: z.string().trim().max(2000),
  faqs: z.array(faqSchema),
  featured: z.boolean(),
  order: z.coerce.number().int(),
  active: z.boolean(),
});

export function toHomam(data: z.output<typeof homamSchema>): Homam {
  return {
    ...data,
    discountPrice: data.discountPrice ?? null,
  };
}
