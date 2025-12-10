"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, Transition } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMessage, TextField, Button } from '@linknest/ui';
import { loginSchema, type LoginFormValues } from '@/schemas/auth';
import { login as loginRequest } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';

const motionConfig = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' } as Transition,
};

export default function LoginPage() {
  const router = useRouter();
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const t = useTranslations('Login');
  // useAuthStore with separate selectors, avoiding object creation that trips the getServerSnapshot warning in server components
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasJustLoggedInRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
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
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    // 如果是登录操作，不需要提示
    if (hasJustLoggedInRef.current) return;
    message.warning(t('doNotRepeatLogin'));
    router.replace('/');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-primary bg-base-200">
      {messageHolder}
      <div className="flex flex-col items-center justify-center bg-base-100 text-center space-y-6 px-12">
        <motion.div
          className="w-20 h-20 rounded-3xl bg-primary text-primary-content flex items-center justify-center text-4xl font-semibold"
          {...motionConfig}
        >
          LN
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
            <h2 className="text-3xl font-semibold">{t('title')}</h2>
            <p className="text-base-content/70">{t('description')}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <TextField
              label={t('password')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
              actionSlot={<Link href="#" className="text-sm text-primary hover:underline">{t('forgotPassword')}</Link>}
            />

            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : t('login')}
            </Button>
          </form>

          <p className="text-center text-sm text-base-content/70">
            {t('dontHaveAccount')} {' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              {t('signUp')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
