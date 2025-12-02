'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button, FileInput, InputField, Modal, Select, useMessage, type MessageApi } from '@linknest/ui';
import { fetchCategories, type Category } from '@/services/categories';
import { createLink, uploadLinkIcon } from '@/services/links';
import { useTranslations } from 'next-intl';
import { createAddLinkSchema, type AddLinkFormInput, type AddLinkFormValues } from '@/schemas/link';

type AddLinkModalProps = {
  open: boolean;
  onClose: () => void;
  activeCategoryId?: number;
  onCreated?: () => void;
  messageApi?: MessageApi;
};

export const AddLinkModal = ({
  open,
  onClose,
  activeCategoryId,
  onCreated,
  messageApi,
}: AddLinkModalProps) => {
  const t = useTranslations('AddLinkModal');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
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

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        setCategories(data);

        const defaultCategoryId = activeCategoryId ?? data[0]?.id;
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
  }, [open, activeCategoryId, message, setValue, t]);

  useEffect(() => {
    if (!open || !activeCategoryId) return;
    setValue('categoryId', activeCategoryId, { shouldValidate: true });
  }, [activeCategoryId, open, setValue]);

  useEffect(() => {
    if (!open) return;
    reset({
      title: '',
      url: '',
      description: '',
      icon: undefined,
      sortOrder: undefined,
      categoryId: activeCategoryId ?? 0,
    });
  }, [open, activeCategoryId, reset]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );

  const handleUploadIcon = async (files?: FileList | null) => {
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
    try {
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
      onClose();
      reset({
        title: '',
        url: '',
        description: '',
        icon: undefined,
        sortOrder: undefined,
        categoryId: values.categoryId,
      });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : t('createFailed');
      message.error(messageText);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('title')}
      footer={(
        <>
          <Button type="button" variant="outline" color="primary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="add-link-form" variant="custom" color="primary" isLoading={isSubmitting}>
            {t('submit')}
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
        <InputField
          label={t('titleLabel')}
          placeholder={t('titlePlaceholder')}
          {...register('title')}
          fullWidth
          error={errors.title?.message}
        />
        <InputField
          label={t('urlLabel')}
          placeholder={t('urlPlaceholder')}
          {...register('url')}
          fullWidth
          error={errors.url?.message}
        />
        <InputField
          label={t('descriptionLabel')}
          placeholder={t('descriptionPlaceholder')}
          {...register('description')}
          fullWidth
          error={errors.description?.message}
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
                disabled={loadingCategories}
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
          />
        </div>

        <div className="space-y-2">
          <FileInput
            label={t('iconLabel')}
            accept="image/*"
            onChange={(event) => handleUploadIcon(event.target.files)}
            disabled={isUploadingIcon}
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
