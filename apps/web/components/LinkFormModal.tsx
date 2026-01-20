'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, FileInput, InputField, ResponsiveDialog, Select, useMessage, type MessageApi } from '@linknest/ui';
import { fetchCategories, type Category } from '@/services/categories';
import { createLink, fetchLinkDetail, updateLink, uploadLinkIcon } from '@/services/links';
import { useTranslations } from 'next-intl';
import { createAddLinkSchema, type AddLinkFormInput, type AddLinkFormValues } from '@/schemas/link';

type LinkFormModalProps = {
  open: boolean;
  onClose: () => void;
  activeCategoryId?: number;
  onCreated?: () => void;
  onUpdated?: () => void;
  mode?: 'create' | 'edit';
  linkId?: number;
  messageApi?: MessageApi;
};

export const LinkFormModal = ({
  open,
  onClose,
  activeCategoryId,
  onCreated,
  onUpdated,
  mode = 'create',
  linkId,
  messageApi,
}: LinkFormModalProps) => {
  const t = useTranslations('LinkFormModal');
  const isEditMode = mode === 'edit';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [internalMessage, messageHolder] = useMessage({ placement: 'top' });
  // 关闭弹窗后的提示用message
  const message = messageApi ?? internalMessage

  const schema = useMemo(() => createAddLinkSchema((key) => t(key)), [t]);
  const defaultValues = useMemo(
    () => ({
      title: '',
      url: '',
      description: '',
      icon: undefined as string | undefined,
      sortOrder: undefined as number | undefined,
      categoryId: activeCategoryId ?? 0,
      isPublic: false,
    }),
    [activeCategoryId],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AddLinkFormInput, unknown, AddLinkFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const iconValue = watch('icon');
  const isPublicValue = watch('isPublic');
  const modalTitle = isEditMode ? t('editTitle') : t('title');
  const submitLabel = isEditMode ? t('save') : t('submit');

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        setCategories(data);

        const defaultCategoryId = isEditMode ? undefined : activeCategoryId ?? data[0]?.id;
        if (defaultCategoryId) {
          setValue('categoryId', defaultCategoryId, { shouldValidate: true });
        }
      } catch (error) {
        const messageText = error instanceof Error ? error.message : t('loadCategoryFailed');
        internalMessage.error(messageText);
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchData();
  }, [open, activeCategoryId, isEditMode, internalMessage, setValue, t]);

  useEffect(() => {
    if (!open || !activeCategoryId || isEditMode) return;
    setValue('categoryId', activeCategoryId, { shouldValidate: true });
  }, [activeCategoryId, isEditMode, open, setValue]);

  useEffect(() => {
    if (!open || !isEditMode || !linkId) return;

    const fetchLink = async () => {
      setIsLoadingLink(true);
      try {
        const data = await fetchLinkDetail(linkId);
        reset({
          title: data.title ?? '',
          url: data.url ?? '',
          description: data.description ?? '',
          icon: data.icon ?? undefined,
          sortOrder: data.sortOrder ?? undefined,
          categoryId: data.categoryId ?? activeCategoryId ?? 0,
          isPublic: data.isPublic ?? false,
        });
      } catch (error) {
        const messageText = error instanceof Error ? error.message : t('loadDetailFailed');
        internalMessage.error(messageText);
        reset(defaultValues);
      } finally {
        setIsLoadingLink(false);
      }
    };

    void fetchLink();
  }, [open, isEditMode, linkId, activeCategoryId, internalMessage, reset, t, defaultValues]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );

  const handleUploadIcon = async (files?: FileList | null) => {
    if (isLoadingLink) return;

    const file = files?.[0];
    if (!file) return;

    setIsUploadingIcon(true);
    try {
      const { url } = await uploadLinkIcon(file);
      setValue('icon', url, { shouldValidate: true });
      internalMessage.success(t('uploadSuccess'));
    } catch (error) {
      const messageText = error instanceof Error ? error.message : t('uploadFailed');
      internalMessage.error(messageText);
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = async (values: AddLinkFormValues) => {
    if (isLoadingLink) return;

    try {
      if (isEditMode) {
        if (!linkId) {
          internalMessage.error(t('loadDetailFailed'));
          return;
        }
        await updateLink(linkId, values);
        message.success(t('updateSuccess'));
        onUpdated?.();
      } else {
        await createLink({
          title: values.title,
          url: values.url,
          description: values.description,
          icon: values.icon,
          sortOrder: values.sortOrder,
          categoryId: values.categoryId,
          isPublic: values.isPublic,
        });
        message.success(t('createSuccess'));
        onCreated?.();
      }
      handleClose();
    } catch (error) {
      const messageText = error instanceof Error
        ? error.message
        : isEditMode
          ? t('updateFailed')
          : t('createFailed');
      internalMessage.error(messageText);
    }
  };

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
            form="add-link-form"
            variant="custom"
            color="primary"
            isLoading={isSubmitting}
            disabled={isLoadingLink}
          >
            {submitLabel}
          </Button>
        </>
      )}
    >
      {messageHolder}
      <form
        id="add-link-form"
        className="grid grid-cols-1 gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {isEditMode && isLoadingLink ? (
          <div className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-content">
            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            <span>{t('loadingDetail')}</span>
          </div>
        ) : null}

        <InputField
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
          {...register('title')}
          fullWidth
          error={errors.title?.message}
          disabled={isLoadingLink}
        />
        <InputField
          label={t('urlLabel')}
          placeholder={t('urlPlaceholder')}
          {...register('url')}
          fullWidth
          error={errors.url?.message}
          disabled={isLoadingLink}
        />
        <InputField
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
          {...register('description')}
          fullWidth
          error={errors.description?.message}
          disabled={isLoadingLink}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                label={t('categoryLabel')}
                value={field.value as number}
                onChange={(event) => field.onChange(Number(event.target.value))}
                options={categoryOptions}
                disabled={loadingCategories || isLoadingLink}
                name={field.name}
                fullWidth
                error={errors.categoryId?.message}
                className='pl-3'
              />
            )}
          />

          <InputField
            label={t('sortOrderLabel')}
            type="number"
            inputMode="numeric"
            placeholder={t('sortOrderPlaceholder')}
            {...register('sortOrder')}
            error={errors.sortOrder?.message}
            disabled={isLoadingLink}
          />
        </div>

        <div className="space-y-2">
          <FileInput
            label={t('iconLabel')}
            accept="image/*"
            onChange={(event) => handleUploadIcon(event.target.files)}
            disabled={isUploadingIcon || isLoadingLink}
            helperText={iconValue ? `${t('iconSelected')}: ${iconValue}` : t('iconHelper')}
            error={errors.icon?.message}
            fullWidth
          />
          <input type="hidden" {...register('icon')} />
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
            disabled={isLoadingLink}
          />
        </div>
      </form>
    </ResponsiveDialog>
  );
};

export default LinkFormModal;
