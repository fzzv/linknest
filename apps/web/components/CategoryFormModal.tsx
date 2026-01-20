'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, InputField, ResponsiveDialog, useMessage, type MessageApi } from '@linknest/ui';
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
  isPublic: false,
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
  // 关闭弹窗后的提示用message
  const message = messageApi ?? internalMessage;
  const isEditMode = mode === 'edit';
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const schema = useMemo(() => createCategorySchema((key) => t(key)), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const isPublicValue = watch('isPublic');

  useEffect(() => {
    if (open && !isEditMode) {
      reset(DEFAULT_VALUES);
    }
  }, [isEditMode, open, reset]);

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
          isPublic: detail.isPublic ?? false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('loadDetailFailed');
        internalMessage.error(errorMessage);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    void fetchDetail();
  }, [categoryId, isEditMode, internalMessage, open, reset, t]);

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEditMode) {
        if (!categoryId) {
          internalMessage.error(t('loadDetailFailed'));
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
      internalMessage.error(errorMessage);
    }
  };

  const modalTitle = isEditMode ? t('editTitle') : t('title');
  const submitLabel = isEditMode ? t('save') : t('submit');

  return (
    <ResponsiveDialog
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
      {messageHolder}
      <form
        id="create-category-form"
        className="grid grid-cols-1 gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {isEditMode && isLoadingDetail ? (
          <div className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-content">
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            <span>{t('loadingDetail')}</span>
          </div>
        ) : null}
        <div className='grid grid-cols-2 gap-4'>
          <InputField
            label={t('nameLabel')}
            placeholder={t('namePlaceholder')}
            {...register('name')}
            error={errors.name?.message}
          />

          <InputField
            label={t('sortOrderLabel')}
            type="number"
            inputMode="numeric"
            placeholder={t('sortOrderPlaceholder')}
            {...register('sortOrder')}
            error={errors.sortOrder?.message}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-base-content">{t('iconLabel')}</p>
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
            <p className="text-xs text-base-content/50">{t('iconHelper')}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-base-content">{t('isPublicLabel')}</p>
            <p className="text-xs text-base-content/50">{t('isPublicHelper')}</p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={isPublicValue}
            onChange={(e) => setValue('isPublic', e.target.checked)}
          />
        </div>
      </form>
    </ResponsiveDialog>
  );
};

export default CategoryFormModal;
