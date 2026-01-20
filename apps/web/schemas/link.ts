import { z } from 'zod';

export type AddLinkTranslationKey =
  | 'titleRequired'
  | 'urlInvalid'
  | 'descriptionRequired'
  | 'sortOrderInvalid'
  | 'categoryRequired';

export type AddLinkTranslator = (key: AddLinkTranslationKey) => string;

export const createAddLinkSchema = (t: AddLinkTranslator) =>
  z.object({
    title: z.string().trim().min(1, t('titleRequired')),
    url: z.string().trim().url(t('urlInvalid')),
    description: z.string().trim().min(1, t('descriptionRequired')),
    icon: z
      .union([z.string(), z.undefined(), z.null()])
      .transform((val) => (val === '' || val === null ? undefined : val)),
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
    categoryId: z
      .coerce.number({ error: t('categoryRequired') }).min(1, t('categoryRequired')),
    isPublic: z.boolean().default(false),
  });

export type AddLinkFormValues = z.infer<ReturnType<typeof createAddLinkSchema>>;
export type AddLinkFormInput = z.input<ReturnType<typeof createAddLinkSchema>>;
