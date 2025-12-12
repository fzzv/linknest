"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, Transition } from 'framer-motion';
import { useMessage, TextField, Button, Status, type StatusColor } from '@linknest/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createLoginSchema, createRegisterSchema, type RegisterFormValues } from '@/schemas/auth';
import { registerAccount, sendVerificationCode } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';

const motionConfig = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' } as Transition,
};

export default function RegisterPage() {
  const router = useRouter();
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasJustRegisteredRef = useRef(false);

  const t = useTranslations('Register');
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: '',
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password') ?? '';
  const passwordChecks = {
    hasMinLength: password.length >= 8,
    hasUppercaseAndNumber: /(?=.*[A-Z])(?=.*\d)/u.test(password),
  };

  const getPasswordStatusColor = (rulePassed: boolean): StatusColor => {
    if (!password) return 'custom';
    return rulePassed ? 'success' : 'error';
  };

  const passwordRequirements = [
    {
      id: 'minLength',
      met: passwordChecks.hasMinLength,
      label: t('passwordRequirementLength'),
    },
    {
      id: 'uppercaseNumber',
      met: passwordChecks.hasUppercaseAndNumber,
      label: t('passwordRequirementUppercaseNumber'),
    },
  ];

  useEffect(() => {
    if (!isAuthenticated) return;
    // 如果是注册操作，不需要提示
    if (hasJustRegisteredRef.current) return;
    message.warning(t('pleaseLogOutFirst'));
    router.replace('/');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (codeCooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCodeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCooldown]);

  // 邮箱验证
  const emailValidationSchema = useMemo(() => loginSchema.pick({ email: true }), [loginSchema]);

  // 发送验证码
  const handleSendCode = async () => {
    const email = getValues('email');
    const result = emailValidationSchema.safeParse({ email });
    if (!result.success) {
      setError('email', { message: result.error.issues[0]?.message || t('pleaseEnterValidEmail') });
      return;
    }
    try {
      setSendingCode(true);
      await sendVerificationCode(email);
      setCodeCooldown(60);
      message.success(t('codeSent'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('codeSendingFailed'));
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await registerAccount(values);
        hasJustRegisteredRef.current = true;
        message.success(t('registerSuccess'));
        setTimeout(() => router.push('/login'), 1200);
      } catch (error) {
        message.error(error instanceof Error ? error.message : t('registerFailed'));
      }
    },
    (formErrors) => {
      const firstError = Object.values(formErrors)[0];
      const msg = typeof firstError?.message === 'string' ? firstError.message : t('formError');
      message.error(msg);
    },
  );

  return (
    <div className="min-h-screen bg-base-100 text-primary">
      {messageHolder}
      <motion.div className="flex items-center gap-2 text-xl font-semibold pt-10 pl-10" {...motionConfig}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-neutral text-sm font-bold">LN</span>
        LinkNest
      </motion.div>
      <div className="mx-auto flex max-w-2xl gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          className="flex-1 items-center justify-center hidden lg:block"
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.1 }}
        >
          <Image
            src="/cover.svg"
            alt="LinkNest cover"
            width={540}
            height={540}
            className="h-auto w-full rounded-2xl object-contain"
            priority
          />
        </motion.div>

        <motion.div
          className="flex-1"
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.2 }}
        >
          <div className="rounded-[32px] bg-base-200 p-8 shadow-2xl shadow-black/60">
            <motion.div
              className="space-y-2 text-center lg:text-left"
              {...motionConfig}
              transition={{ ...motionConfig.transition, delay: 0.25 }}
            >
              <h1 className="text-3xl font-semibold">{t('title')}</h1>
              <p className="text-base-content/70">{t('description')}</p>
            </motion.div>

            <motion.form
              className="mt-8 space-y-5"
              onSubmit={onSubmit}
              {...motionConfig}
              transition={{ ...motionConfig.transition, delay: 0.3 }}
            >
              <TextField
                size="md"
                label={t('nickname')}
                placeholder={t('nicknamePlaceholder')}
                {...register('nickname')}
                error={errors.nickname?.message}
              />

              <TextField
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
                actionSlot={(
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || codeCooldown > 0}
                    className="h-9 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {codeCooldown > 0 ? t('sentCode', { codeCooldown }) : t('sendCode')}
                  </Button>
                )}
              />

              <TextField
                label={t('code')}
                placeholder={t('codePlaceholder')}
                inputMode="numeric"
                {...register('code')}
                error={errors.code?.message}
              />

              <TextField
                label={t('password')}
                type="password"
                placeholder={t('passwordPlaceholder')}
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
              />
              <div className="space-y-1 text-xs text-base-content/70">
                {passwordRequirements.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    <Status color={getPasswordStatusColor(rule.met)} />
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>

              <TextField
                label={t('confirmPassword')}
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                color="primary"
                className="h-12 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t('creatingAccount') : t('createAccount')}
              </Button>
            </motion.form>

            <motion.p
              className="mt-6 text-center text-sm text-base-content/70"
              {...motionConfig}
              transition={{ ...motionConfig.transition, delay: 0.35 }}
            >
              {t('alreadyHaveAccount')} {' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t('login')}
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
