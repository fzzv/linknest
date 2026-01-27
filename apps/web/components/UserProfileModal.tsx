'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, InputField, ResponsiveDialog, Upload, useMessage } from '@linknest/ui';
import { useTranslations } from 'next-intl';
import { createUpdateUserSchema, type UpdateUserFormInput, type UpdateUserFormValues } from '@/schemas/user';
import { updateUserProfile, uploadAvatar } from '@/services/users';
import { useAuthStore } from '@/store/auth-store';
import { buildFileSrc } from '@/lib/utils'

type UserProfileModalProps = {
  open: boolean;
  onClose: () => void;
};

export function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const t = useTranslations('UserProfileModal');
  const { user, updateUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [message, messageHolder] = useMessage();
  const [insideMessage, insideMessageHolder] = useMessage();

  const schema = useMemo(() => createUpdateUserSchema((key) => t(key)), [t]);
  const defaultValues = useMemo(
    () => ({
      avatar: user?.avatar ?? null,
      nickname: user?.nickname ?? '',
      email: user?.email ?? '',
    }),
    [user],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormInput, unknown, UpdateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const avatarValue = watch('avatar');

  useEffect(() => {
    if (!open) return;
    if (!user) {
      onClose?.();
      return;
    }
    reset(defaultValues);
  }, [open, defaultValues, reset, user, onClose]);

  if (!user) return null;

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const handleUploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const { files } = await uploadAvatar(file, { userId: user.id });
      const url = files?.[0]?.url;
      if (url) {
        setValue('avatar', buildFileSrc(url), { shouldValidate: true, shouldDirty: true });
        insideMessage.success(t('uploadSuccess'));
      } else {
        throw new Error(t('uploadFailed'));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('uploadFailed');
      insideMessage.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setValue('avatar', null, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (values: UpdateUserFormValues) => {
    try {
      const updated = await updateUserProfile({
        nickname: values.nickname ?? '',
        avatar: values.avatar ?? ''
      });
      updateUser(updated);
      message.success(t('updateSuccess'));
      handleClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('updateFailed');
      insideMessage.error(msg);
    }
  };

  return (
    <>
      {messageHolder}
      <ResponsiveDialog
        open={open}
        onClose={handleClose}
        title={t('title')}
        draggable
        dragHandleClassName="ln-modal-drag-handle"
        footer={(
          <>
            <Button variant="outline" color="primary" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              form="user-profile-form"
              variant="custom"
              color="primary"
              isLoading={isSubmitting}
              disabled={uploading}
            >
              {t('save')}
            </Button>
          </>
        )}
      >
        {insideMessageHolder}
        <form
          id="user-profile-form"
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col justify-center items-center gap-4">
            <Upload
              variant="avatar"
              accept="image/*"
              value={avatarValue ?? undefined}
              onFileSelect={handleUploadAvatar}
              overlayText={t('changeAvatar')}
              disabled={uploading || isSubmitting}
            />
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm text-base-content/70">{t('avatarHint')}</p>
              <Button
                variant="outline"
                color="primary"
                size="sm"
                onClick={handleRemoveAvatar}
                disabled={uploading || avatarValue === null || avatarValue === undefined}
              >
                {t('removeAvatar')}
              </Button>
              {errors.avatar?.message && (
                <p className="text-xs text-error">{errors.avatar.message}</p>
              )}
            </div>
          </div>

          <InputField
            label={t('nickname')}
            placeholder={t('nicknamePlaceholder')}
            {...register('nickname')}
            fullWidth
            disabled={isSubmitting}
            error={errors.nickname?.message}
          />

          <InputField
            label={t('email')}
            readOnly
            className="bg-white/5"
            {...register('email')}
            fullWidth
            error={errors.email?.message}
          />
        </form>
      </ResponsiveDialog>
    </>
  );
}

export default UserProfileModal;
