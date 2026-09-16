import { z } from "zod";

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(2000),
});

export const pageContentSchema = z.object({
  eyebrow: z.string().trim().max(120),
  title: z.string().trim().min(1, "Title is required").max(160),
  subtitle: z.string().trim().max(500),
  price: z
    .union([z.coerce.number().int().min(0), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  priceNote: z.string().trim().max(200),
  includes: z.array(z.string().trim().min(1).max(400)),
  faqs: z.array(faqSchema),
});
