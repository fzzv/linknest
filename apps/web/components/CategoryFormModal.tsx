'use client';

import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, InputField, Modal, useMessage, type MessageApi } from '@linknest/ui';
import { useTranslations } from 'next-intl';
import IconRadioGroup, { COMMON_ICON_NAMES } from './IconRadioGroup';
import { createCategory } from '@/services/categories';
import { createCategorySchema, type CategoryFormInput, type CategoryFormValues } from '@/schemas/category';

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (categoryId: number) => void;
  messageApi?: MessageApi;
};

const CategoryFormModal = ({ open, onClose, onCreated, messageApi }: CategoryFormModalProps) => {
  const t = useTranslations('CategoryFormModal');
  const [internalMessage, messageHolder] = useMessage({ placement: 'top' });
  const message = messageApi ?? internalMessage;

  const schema = useMemo(() => createCategorySchema((key) => t(key)), [t]);
  const defaultValues = useMemo(
    () => ({
      name: '',
      icon: COMMON_ICON_NAMES[0] ?? '',
      sortOrder: undefined as number | undefined,
    }),
    [],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const created = await createCategory(values);
      message.success(t('createSuccess'));
      onCreated?.(created.id);
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('createFailed');
      message.error(errorMessage);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('title')}
      draggable={true}
      dragHandleClassName="ln-modal-drag-handle"
      footer={(
        <>
          <Button type="button" variant="outline" color="primary" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            form="create-category-form"
            variant="custom"
            color="primary"
            isLoading={isSubmitting}
          >
            {t('submit')}
          </Button>
        </>
      )}
    >
      {messageApi ? null : messageHolder}
      <form
        id="create-category-form"
        className="grid grid-cols-1 gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <InputField
          label={t('nameLabel')}
          placeholder={t('namePlaceholder')}
          {...register('name')}
          fullWidth
          error={errors.name?.message}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-white">{t('iconLabel')}</p>
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <IconRadioGroup
                value={field.value}
                onChange={(iconName) => field.onChange(iconName)}
              />
            )}
          />
          {errors.icon?.message ? (
            <p className="text-xs text-error">{errors.icon.message}</p>
          ) : (
            <p className="text-xs text-white/60">{t('iconHelper')}</p>
          )}
        </div>

        <InputField
          label={t('sortOrderLabel')}
          type="number"
          inputMode="numeric"
          placeholder={t('sortOrderPlaceholder')}
          {...register('sortOrder')}
          error={errors.sortOrder?.message}
        />
      </form>
    </Modal>
  );
};

export default CategoryFormModal;
