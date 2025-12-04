'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, InputField, Modal, useMessage, type MessageApi } from '@linknest/ui';
import { useTranslations } from 'next-intl';
import IconRadioGroup, { COMMON_ICON_NAMES } from './IconRadioGroup';
import { createCategory, fetchCategoryDetail, updateCategory } from '@/services/categories';
import { createCategorySchema, type CategoryFormInput, type CategoryFormValues } from '@/schemas/category';

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (categoryId: number) => void;
  onUpdated?: (categoryId: number) => void;
  mode?: 'create' | 'edit';
  categoryId?: number;
  messageApi?: MessageApi;
};

const DEFAULT_VALUES: CategoryFormValues = {
  name: '',
  icon: COMMON_ICON_NAMES[0] ?? '',
  sortOrder: undefined,
};

const CategoryFormModal = ({
  open,
  onClose,
  onCreated,
  onUpdated,
  mode = 'create',
  categoryId,
  messageApi,
}: CategoryFormModalProps) => {
  const t = useTranslations('CategoryFormModal');
  const [internalMessage, messageHolder] = useMessage({ placement: 'top' });
  const message = messageApi ?? internalMessage;
  const isEditMode = mode === 'edit';
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const schema = useMemo(() => createCategorySchema((key) => t(key)), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open && !isEditMode) {
      reset(DEFAULT_VALUES);
    }
  }, [DEFAULT_VALUES, isEditMode, open, reset]);

  useEffect(() => {
    if (!open || !isEditMode || !categoryId) return;

    const fetchDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const detail = await fetchCategoryDetail(categoryId);
        reset({
          name: detail.name ?? '',
          icon: detail.icon ?? COMMON_ICON_NAMES[0] ?? '',
          sortOrder: detail.sortOrder ?? undefined,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('loadDetailFailed');
        message.error(errorMessage);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    void fetchDetail();
  }, [categoryId, isEditMode, message, open, reset, t]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEditMode) {
        if (!categoryId) {
          message.error(t('loadDetailFailed'));
          return;
        }
        await updateCategory(categoryId, values);
        message.success(t('updateSuccess'));
        onUpdated?.(categoryId);
      } else {
        const created = await createCategory(values);
        message.success(t('createSuccess'));
        onCreated?.(created.id);
      }
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : isEditMode
          ? t('updateFailed')
          : t('createFailed');
      message.error(errorMessage);
    }
  };

  const modalTitle = isEditMode ? t('editTitle') : t('title');
  const submitLabel = isEditMode ? t('save') : t('submit');

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={modalTitle}
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
            disabled={isLoadingDetail}
          >
            {submitLabel}
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
        {isEditMode && isLoadingDetail ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            <span>{t('loadingDetail')}</span>
          </div>
        ) : null}

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
                onChange={field.onChange}
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
