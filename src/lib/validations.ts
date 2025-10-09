import { z } from 'zod';

export const joinFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  
  location: z.string()
    .trim()
    .min(2, "Location required")
    .max(100, "Location must be less than 100 characters"),
  
  craftType: z.string()
    .min(1, "Please select a craft type"),
  
  story: z.string()
    .trim()
    .min(20, "Story must be at least 20 characters")
    .max(500, "Story must be less than 500 characters"),
  
  specialty: z.string()
    .trim()
    .max(300, "Specialty must be less than 300 characters")
    .optional()
    .or(z.literal("")),
  
  website: z.string()
    .trim()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  
  instagram: z.string()
    .trim()
    .regex(/^@?[A-Za-z0-9._]{1,30}$/, "Invalid Instagram handle")
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .trim()
    .regex(/^[\d\s()+-]{10,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal(""))
});

export const contactRequestSchema = z.object({
  sender_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  
  sender_email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email too long"),
  
  message: z.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message too long")
});
