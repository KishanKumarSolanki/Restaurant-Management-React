import { z } from 'zod';

const REQUIRED = 'This field is required.';

const text = (max = 255) =>
  z.string({ required_error: REQUIRED, invalid_type_error: REQUIRED }).trim().min(1, REQUIRED).max(max, `Maximum ${max} characters allowed.`);

// optional text: '' / null / undefined -> null
const optText = (max = 255) =>
  z.string().trim().max(max, `Maximum ${max} characters allowed.`).nullish().transform((v) => v || null);

const emptyToNull = (v) => (v === '' || v === undefined ? null : v);

const optNumber = (min, max) =>
  z.preprocess(
    emptyToNull,
    z.coerce.number({ invalid_type_error: 'Must be a number.' }).min(min, `Minimum ${min}.`).max(max, `Maximum ${max}.`).nullable()
  );

const optDate = z.preprocess(emptyToNull, z.coerce.date({ invalid_type_error: 'Invalid date.' }).nullable());

const email = z.string({ required_error: REQUIRED }).trim().toLowerCase().email('Enter a valid email address.').max(255);
const password = z.string({ required_error: REQUIRED }).min(8, 'Password must be at least 8 characters.');

const mustMatch = (schema, field = 'passwordConfirmation') =>
  schema.refine((d) => d[field] === d.password, { path: [field], message: 'Password confirmation does not match.' });

// ---------- auth ----------
export const registerSchema = mustMatch(z.object({ name: text(), email, password, passwordConfirmation: z.string().optional() }));
export const loginSchema = z.object({ email, password: z.string({ required_error: REQUIRED }).min(1, REQUIRED) });
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = mustMatch(z.object({ token: text(500), email, password, passwordConfirmation: z.string().optional() }));
export const profileSchema = z.object({ name: text(), email });
export const passwordUpdateSchema = mustMatch(z.object({ currentPassword: text(), password, passwordConfirmation: z.string().optional() }));
export const deleteAccountSchema = z.object({ password: text() });

// ---------- customers ----------
export const customerSchema = z.object({
  customerno: text(),
  name: text(),
  phone: text(20),
  address: text(),
  notes: optText(500),
  preferences: optText(500),
  feedback: optText(500),
});

// ---------- menu ----------
export const menuCategorySchema = z.object({
  name: text(),
  description: optText(255),
  isActive: z.boolean({ required_error: REQUIRED, invalid_type_error: REQUIRED }),
});

export const itemSchema = z.object({
  name: text(),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number.' }).min(1, 'Minimum price is 1.').max(9999.99, 'Maximum price is 9999.99.'),
  menuCategory: text(50),
  description: optText(500),
  isAvailable: z.boolean({ required_error: REQUIRED, invalid_type_error: REQUIRED }),
});

// ---------- orders ----------
export const orderSchema = z.object({
  ordername: text(),
  customerno: text(),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled'], { errorMap: () => ({ message: 'Invalid status.' }) }),
  notes: optText(500),
  items: z
    .array(
      z.object({
        item: text(50),
        quantity: z.coerce.number({ invalid_type_error: 'Quantity must be a number.' }).int().min(1, 'Minimum 1.').max(50, 'Maximum 50.'),
        itemNotes: optText(255),
        itemStatus: z.enum(['pending', 'preparing', 'ready', 'served']).default('pending'),
      })
    )
    .min(1, 'Add at least one item.'),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'online'], { errorMap: () => ({ message: 'Choose cash or online.' }) }),
});

// ---------- staff ----------
const staffBase = { name: text(), email, phone: optText(20), role: text(100), wage: optNumber(0, 99999.99), hireDate: optDate };

export const staffCreateSchema = mustMatch(z.object({ ...staffBase, password, passwordConfirmation: z.string().optional() }));

export const staffUpdateSchema = z
  .object({
    ...staffBase,
    password: z.string().optional().transform((v) => v || undefined),
    passwordConfirmation: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.password) {
      if (d.password.length < 8) ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must be at least 8 characters.' });
      if (d.password !== d.passwordConfirmation)
        ctx.addIssue({ code: 'custom', path: ['passwordConfirmation'], message: 'Password confirmation does not match.' });
    }
  });

const hhmm = z.string({ required_error: REQUIRED }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm format.');
export const shiftSchema = z
  .object({
    user: text(50),
    shiftDate: z.coerce.date({ invalid_type_error: 'Invalid date.', required_error: REQUIRED }),
    startTime: hhmm,
    endTime: hhmm,
    section: optText(100),
    status: z.enum(['scheduled', 'in-progress', 'completed', 'off']),
    notes: optText(500),
  })
  .refine((d) => d.endTime > d.startTime, { path: ['endTime'], message: 'End time must be after start time.' });

export const assignmentSchema = z.object({
  order: text(50),
  assignedTo: text(50),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  assignmentNotes: optText(500),
});
