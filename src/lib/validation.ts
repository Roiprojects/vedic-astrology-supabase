import { z } from "zod";

export type BookingVariant =
  | "consultation"
  | "homam"
  | "birth-chart"
  | "chat"
  | "contact";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  service: z.string().optional(),
  message: z.string().min(10, "Please share more details"),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$|^\d{10}$/;

const baseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || phoneRegex.test(v.replace(/\s/g, "")),
      "Enter a valid 10-digit Indian mobile number"
    ),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  message: z.string().optional(),
  website: z.string().optional(), // honeypot
});

const consultationSchema = baseSchema.extend({
  dob: z.string().min(1, "Date of birth required"),
  tob: z.string().min(1, "Time of birth required"),
  pob: z.string().min(1, "Place of birth required"),
  preferredMode: z.string().optional(),
});

const homamSchema = baseSchema.extend({
  preferredDate: z.string().optional(),
});

const birthChartSchema = baseSchema.extend({
  dob: z.string().min(1, "Date of birth required"),
  tob: z.string().min(1, "Time of birth required"),
  pob: z.string().min(1, "Place of birth required"),
  gender: z.string().optional(),
});

const chatSchema = baseSchema;

const contactSchema = baseSchema.extend({
  serviceInterested: z.string().optional(),
  preferredContact: z.string().optional(),
});

const variantSchemas: Record<BookingVariant, z.ZodType<unknown>> = {
  consultation: consultationSchema,
  homam: homamSchema,
  "birth-chart": birthChartSchema,
  chat: chatSchema,
  contact: contactSchema,
};

export type BookingInput = z.infer<typeof baseSchema> &
  z.infer<typeof consultationSchema> &
  z.infer<typeof birthChartSchema> &
  z.infer<typeof contactSchema>;

export function refineForVariant(variant: BookingVariant) {
  return variantSchemas[variant];
}
