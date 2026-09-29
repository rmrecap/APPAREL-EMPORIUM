import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address').max(150, 'Email must not exceed 150 characters'),
  phone: z.string().max(50, 'Phone must not exceed 50 characters').optional().nullable(),
  company: z.string().max(120, 'Company must not exceed 120 characters').optional().nullable(),
  country: z.string().max(100, 'Country must not exceed 100 characters').optional().nullable(),
  productInterest: z.string().max(150, 'Product interest must not exceed 150 characters').optional().nullable(),
  subject: z.string().max(200, 'Subject must not exceed 200 characters').optional().nullable(),
  message: z.string({ required_error: 'Message is required' }).trim().min(10, 'Message must be at least 10 characters').max(5000, 'Message must not exceed 5000 characters'),
});

export const rfqSchema = z.object({
  buyerName: z.string({ required_error: 'Buyer name is required' }).trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  buyerEmail: z.string({ required_error: 'Buyer email is required' }).trim().email('Invalid email address').max(150, 'Email must not exceed 150 characters'),
  companyName: z.string().max(150, 'Company name must not exceed 150 characters').optional().nullable(),
  buyerCompany: z.string().max(150, 'Company name must not exceed 150 characters').optional().nullable(),
  phone: z.string().max(50, 'Phone must not exceed 50 characters').optional().nullable(),
  buyerPhone: z.string().max(50, 'Phone must not exceed 50 characters').optional().nullable(),
  country: z.string().max(100, 'Country must not exceed 100 characters').optional().nullable(),
  buyerCountry: z.string().max(100, 'Country must not exceed 100 characters').optional().nullable(),
  productId: z.string().optional().nullable(),
  productName: z.string().max(200, 'Product name must not exceed 200 characters').optional().nullable(),
  productDetails: z.string().max(3000, 'Product details must not exceed 3000 characters').optional().nullable(),
  quantity: z.union([z.number(), z.string()], { required_error: 'Quantity is required' }).refine((val) => {
    const num = typeof val === 'number' ? val : parseInt(String(val).trim(), 10);
    return !isNaN(num) && num > 0;
  }, { message: 'Quantity must be a valid positive number' }),
  targetPrice: z.string().max(100, 'Target price must not exceed 100 characters').optional().nullable(),
  deliveryTimeline: z.string().max(100, 'Delivery timeline must not exceed 100 characters').optional().nullable(),
  deliveryDate: z.string().max(100, 'Delivery date must not exceed 100 characters').optional().nullable(),
  shippingTo: z.string().max(100, 'Shipping destination must not exceed 100 characters').optional().nullable(),
  specialRequirements: z.string().max(3000, 'Special requirements must not exceed 3000 characters').optional().nullable(),
  additionalNotes: z.string().max(3000, 'Additional notes must not exceed 3000 characters').optional().nullable(),
});

export const formSubmissionSchema = z.object({
  formId: z.string().optional().nullable(),
  data: z.record(z.any(), { required_error: 'Submission data is required' }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type RFQInput = z.infer<typeof rfqSchema>;
export type FormSubmissionInput = z.infer<typeof formSubmissionSchema>;
