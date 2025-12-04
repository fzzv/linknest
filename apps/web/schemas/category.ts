import { z } from 'zod';

export type CategoryFormTranslationKey = 'nameRequired' | 'iconRequired' | 'sortOrderInvalid';

export type CategoryFormTranslator = (key: CategoryFormTranslationKey) => string;

export const createCategorySchema = (t: CategoryFormTranslator) =>
  z.object({
    name: z.string().trim().min(1, t('nameRequired')),
    icon: z.string().trim().min(1, t('iconRequired')),
    sortOrder: z
      .union([z.string(), z.number(), z.undefined(), z.null()])
      .transform((val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const num = Number(val);
        return Number.isNaN(num) ? Number.NaN : num;
      })
      .refine((val) => val === undefined || !Number.isNaN(val), {
        message: t('sortOrderInvalid'),
      }),
  });

export type CategoryFormValues = z.infer<ReturnType<typeof createCategorySchema>>;
export type CategoryFormInput = z.input<ReturnType<typeof createCategorySchema>>;
