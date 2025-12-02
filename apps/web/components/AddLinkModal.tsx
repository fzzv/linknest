'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, FileInput, InputField, Modal, Select, useMessage, type MessageApi } from '@linknest/ui';
import { fetchCategories, type Category } from '@/services/categories';
import { createLink, fetchLinkDetail, updateLink, uploadLinkIcon } from '@/services/links';
import { useTranslations } from 'next-intl';
import { createAddLinkSchema, type AddLinkFormInput, type AddLinkFormValues } from '@/schemas/link';

type AddLinkModalProps = {
  open: boolean;
  onClose: () => void;
  activeCategoryId?: number;
  onCreated?: () => void;
  onUpdated?: () => void;
  mode?: 'create' | 'edit';
  linkId?: number;
  messageApi?: MessageApi;
};

export const AddLinkModal = ({
  open,
  onClose,
  activeCategoryId,
  onCreated,
  onUpdated,
  mode = 'create',
  linkId,
  messageApi,
}: AddLinkModalProps) => {
  const t = useTranslations('AddLinkModal');
  const isEditMode = mode === 'edit';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [internalMessage, messageHolder] = useMessage({ placement: 'top' });
  const message = messageApi ?? internalMessage;

  const schema = useMemo(() => createAddLinkSchema((key) => t(key)), [t]);

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
    defaultValues: {
      title: '',
      url: '',
      description: '',
      icon: undefined,
      sortOrder: undefined,
      categoryId: activeCategoryId ?? 0,
    },
  });

  const iconValue = watch('icon');
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
        message.error(messageText);
      } finally {
        setLoadingCategories(false);
      }
    };

    void fetchData();
  }, [open, activeCategoryId, isEditMode, message, setValue, t]);

  useEffect(() => {
    if (!open || !activeCategoryId || isEditMode) return;
    setValue('categoryId', activeCategoryId, { shouldValidate: true });
  }, [activeCategoryId, isEditMode, open, setValue]);

  useEffect(() => {
    if (!open || isEditMode) return;
    reset({
      title: '',
      url: '',
      description: '',
      icon: undefined,
      sortOrder: undefined,
      categoryId: activeCategoryId ?? 0,
    });
  }, [open, activeCategoryId, isEditMode, reset]);

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
        });
      } catch (error) {
        const messageText = error instanceof Error ? error.message : t('loadDetailFailed');
        message.error(messageText);
        reset({
          title: '',
          url: '',
          description: '',
          icon: undefined,
          sortOrder: undefined,
          categoryId: activeCategoryId ?? 0,
        });
      } finally {
        setIsLoadingLink(false);
      }
    };

    void fetchLink();
  }, [open, isEditMode, linkId, activeCategoryId, message, reset, t]);

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
      message.success(t('uploadSuccess'));
    } catch (error) {
      const messageText = error instanceof Error ? error.message : t('uploadFailed');
      message.error(messageText);
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const onSubmit = async (values: AddLinkFormValues) => {
    if (isLoadingLink) return;

    try {
      if (isEditMode) {
        if (!linkId) {
          message.error(t('loadDetailFailed'));
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
        });
        message.success(t('createSuccess'));
        onCreated?.();
        reset({
          title: '',
          url: '',
          description: '',
          icon: undefined,
          sortOrder: undefined,
          categoryId: values.categoryId,
        });
      }
      onClose();
    } catch (error) {
      const messageText = error instanceof Error
        ? error.message
        : isEditMode
          ? t('updateFailed')
          : t('createFailed');
      message.error(messageText);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      draggable={true}
      dragHandleClassName="ln-modal-drag-handle"
      footer={(
        <>
          <Button type="button" variant="outline" color="primary" onClick={onClose}>
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
      {messageApi ? null : messageHolder}
      <form
        id="add-link-form"
        className="grid grid-cols-1 gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {isEditMode && isLoadingLink ? (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
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
      </form>
    </Modal>
  );
};

export default AddLinkModal;
