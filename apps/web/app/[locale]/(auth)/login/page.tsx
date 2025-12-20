"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, Transition } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMessage, TextField, Button } from '@linknest/ui';
import { Eye, EyeOff } from 'lucide-react';
import { createLoginSchema, createResetPasswordSchema, type LoginFormValues, type ResetPasswordFormValues } from '@/schemas/auth';
import { login as loginRequest, resetPassword, sendResetPasswordCode } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@linknest/utils';

const motionConfig = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' } as Transition,
};

export default function LoginPage() {
  const router = useRouter();
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const t = useTranslations('Login');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  // useAuthStore with separate selectors, avoiding object creation that trips the getServerSnapshot warning in server components
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasJustLoggedInRef = useRef(false);

  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const resetPasswordSchema = useMemo(() => createResetPasswordSchema(t), [t]);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
    setValue: setLoginValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    getValues: getResetValues,
    setError: setResetError,
    reset: resetResetForm,
    formState: { errors: resetErrors, isSubmitting: isResetting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailValidationSchema = useMemo(() => loginSchema.pick({ email: true }), [loginSchema]);
  const isResetMode = mode === 'reset';

  const onLoginSubmit = handleLoginSubmit(async (values: LoginFormValues) => {
    try {
      const data = await loginRequest(values);
      hasJustLoggedInRef.current = true;
      message.success(t('loginSuccess'));
      login(data);
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(t('loginFailed'));
      }
    }
  });

  const onResetSubmit = handleResetSubmit(
    async (values) => {
      try {
        await resetPassword(values);
        message.success(t('resetSuccess'));
        setMode('login');
        resetResetForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
        setLoginValue('email', values.email);
        setLoginValue('password', '');
        setCodeCooldown(0);
      } catch (error) {
        message.error(error instanceof Error ? error.message : t('resetFailed'));
      }
    },
    (formErrors) => {
      const firstError = Object.values(formErrors)[0];
      const msg = typeof firstError?.message === 'string' ? firstError.message : t('formError');
      message.error(msg);
    },
  );

  const handleSendResetCode = async () => {
    const email = getResetValues('email');
    const result = emailValidationSchema.safeParse({ email });
    if (!result.success) {
      setResetError('email', { message: result.error.issues[0]?.message || t('pleaseEnterValidEmail') });
      return;
    }
    try {
      setSendingCode(true);
      await sendResetPasswordCode(email);
      setCodeCooldown(60);
      message.success(t('codeSent'));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('codeSendingFailed'));
    } finally {
      setSendingCode(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    // 如果是登录操作，不需要提示
    if (hasJustLoggedInRef.current) return;
    message.warning(t('doNotRepeatLogin'));
    router.replace('/');
  }, [isAuthenticated, router, message, t]);

  useEffect(() => {
    if (codeCooldown <= 0) return;
    const timer = setInterval(() => {
      setCodeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCooldown]);

  const formTitle = isResetMode ? t('resetTitle') : t('title');
  const formDescription = isResetMode ? t('resetDescription') : t('description');

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-primary bg-base-200">
      {messageHolder}
      <div className="flex flex-col items-center justify-center bg-base-100 text-center space-y-6 px-12">
        <motion.div
          className="w-20 h-20 rounded-3xl bg-primary text-primary-content flex items-center justify-center text-4xl font-semibold"
          {...motionConfig}
        >
          <Image src="/logo.svg" alt="LinkNest" width={100} height={100} />
        </motion.div>
        <motion.div className="space-y-4" {...motionConfig} transition={{ ...motionConfig.transition, delay: 0.1 }}>
          <h1 className="text-4xl font-semibold tracking-wide">LinkNest</h1>
          <p className="text-lg">{t('subtitle')}</p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md space-y-8"
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.2 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">{formTitle}</h2>
            <p className="text-base-content/70">{formDescription}</p>
          </div>

          {isResetMode ? (
            // 重置密码表单
            <form className="space-y-6" onSubmit={onResetSubmit}>
              <TextField
                label={t('email')}
                type="email"
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                {...registerReset('email')}
                error={resetErrors.email?.message}
                actionSlot={(
                  <Button
                    type="button"
                    onClick={handleSendResetCode}
                    disabled={sendingCode || codeCooldown > 0 || isResetting}
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
                {...registerReset('code')}
                error={resetErrors.code?.message}
              />

              <TextField
                label={t('newPassword')}
                type={showResetPassword ? 'text' : 'password'}
                placeholder={t('newPasswordPlaceholder')}
                autoComplete="new-password"
                {...registerReset('newPassword')}
                error={resetErrors.newPassword?.message}
                inputSlot={(
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((prev) => !prev)}
                    aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-base-content/60 cursor-pointer transition",
                      "hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    )}
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              />

              <TextField
                label={t('confirmPassword')}
                type={showResetConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                autoComplete="new-password"
                {...registerReset('confirmPassword')}
                error={resetErrors.confirmPassword?.message}
                inputSlot={(
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                    aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-base-content/60 cursor-pointer transition",
                      "hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    )}
                  >
                    {showResetConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              />

              <Button
                type="submit"
                color="primary"
                disabled={isResetting}
                className="h-12 w-full rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResetting ? t('resetting') : t('confirmReset')}
              </Button>
            </form>
          ) : (
            // 登录表单
            <form className="space-y-6" onSubmit={onLoginSubmit}>
              <TextField
                label={t('email')}
                type="email"
                placeholder={t('emailPlaceholder')}
                autoComplete="email"
                {...registerLogin('email')}
                error={loginErrors.email?.message}
              />

              <TextField
                label={t('password')}
                type={showLoginPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                autoComplete="current-password"
                {...registerLogin('password')}
                error={loginErrors.password?.message}
                inputSlot={(
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-base-content/60 transition hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
                actionSlot={(
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline cursor-pointer"
                    onClick={() => setMode('reset')}
                  >
                    {t('forgotPassword')}
                  </button>
                )}
              />

              <Button
                type="submit"
                color="primary"
                disabled={isLoggingIn}
                className="h-12 w-full rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? 'Signing in…' : t('login')}
              </Button>
            </form>
          )}

          {isResetMode ? (
            <p className="text-center text-sm text-base-content/70">
              {t('rememberPassword')} {' '}
              <button type="button" className="text-primary font-medium hover:underline cursor-pointer" onClick={() => setMode('login')}>
                {t('backToLogin')}
              </button>
            </p>
          ) : (
            <p className="text-center text-sm text-base-content/70">
              {t('dontHaveAccount')} {' '}
              <Link href="/register" className="text-primary font-medium hover:underline cursor-pointer">
                {t('signUp')}
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
