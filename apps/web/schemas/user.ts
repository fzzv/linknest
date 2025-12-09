import { z } from 'zod';

export type UpdateUserTranslationKey = 'emailInvalid' | 'nicknameTooLong' | 'avatarTooLong' | 'nicknameRequired';

export type UpdateUserTranslator = (key: UpdateUserTranslationKey) => string;

export const createUpdateUserSchema = (t: UpdateUserTranslator) =>
  z.object({
    avatar: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === undefined || val === null) return val;
        const trimmed = val.trim();
        return trimmed === '' ? null : trimmed;
      })
      .refine(
        (val) => val === undefined || val === null || val.length <= 2048,
        { message: t('avatarTooLong') },
      ),
    nickname: z
      .string()
      .trim()
      .min(1, t('nicknameRequired'))
      .max(30, t('nicknameTooLong')),
    email: z.string().email(t('emailInvalid')).optional(),
  });

export type UpdateUserFormValues = z.infer<ReturnType<typeof createUpdateUserSchema>>;
export type UpdateUserFormInput = z.input<ReturnType<typeof createUpdateUserSchema>>;
