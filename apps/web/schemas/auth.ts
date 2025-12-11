import { z } from 'zod';

const passwordRule = /^(?=.*[A-Z])(?=.*\d).{8,}$/u;

export type AuthTranslationKey =
  | 'emailRequired'
  | 'emailInvalid'
  | 'passwordTooShort'
  | 'nicknameTooLong'
  | 'codeInvalid'
  | 'confirmPasswordTooShort'
  | 'passwordRequirements'
  | 'passwordMismatch';

export type AuthFormTranslator = (key: AuthTranslationKey) => string;

export const createLoginSchema = (t: AuthFormTranslator) =>
  z.object({
    email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
    password: z.string().min(6, t('passwordTooShort')),
  });

export const createRegisterSchema = (t: AuthFormTranslator) =>
  createLoginSchema(t)
    .extend({
      nickname: z.string().max(30, t('nicknameTooLong')).optional(),
      code: z.string().regex(/^[0-9]{4,6}$/u, t('codeInvalid')),
      confirmPassword: z.string().min(6, t('confirmPasswordTooShort')),
    })
    .superRefine((data, ctx) => {
      if (!passwordRule.test(data.password)) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: t('passwordRequirements'),
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          code: z.ZodIssueCode.custom,
          message: t('passwordMismatch'),
        });
      }
    });

export const createResetPasswordSchema = (t: AuthFormTranslator) =>
  z
    .object({
      email: createLoginSchema(t).shape.email,
      code: z.string().regex(/^[0-9]{4,6}$/u, t('codeInvalid')),
      newPassword: z.string().min(8, t('passwordRequirements')),
      confirmPassword: z.string().min(6, t('confirmPasswordTooShort')),
    })
    .superRefine((data, ctx) => {
      if (!passwordRule.test(data.newPassword)) {
        ctx.addIssue({
          path: ['newPassword'],
          code: z.ZodIssueCode.custom,
          message: t('passwordRequirements'),
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          code: z.ZodIssueCode.custom,
          message: t('passwordMismatch'),
        });
      }
    });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ResetPasswordFormValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;
