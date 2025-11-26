"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, Transition } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@linknest/ui/text-field';
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
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const t = useTranslations('Login');

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
      setServerError(null);
      const data = await loginRequest(values);
      login(data);
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('登录失败，请稍后重试');
      }
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-white bg-[#050b1a]">
      <div className="hidden lg:flex flex-col items-center justify-center bg-linear-to-b from-slate-950 to-slate-900 text-center space-y-6 px-12">
        <motion.div
          className="w-20 h-20 rounded-3xl bg-indigo-500/90 flex items-center justify-center text-4xl font-semibold"
          {...motionConfig}
        >
          N
        </motion.div>
        <motion.div className="space-y-4" {...motionConfig} transition={{ ...motionConfig.transition, delay: 0.1 }}>
          <h1 className="text-4xl font-semibold tracking-wide">LinkNest</h1>
          <p className="text-slate-400 text-lg">{t('subtitle')}</p>
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
            <p className="text-slate-400">{t('description')}</p>
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
              actionSlot={<Link href="#" className="text-sm text-indigo-400 hover:underline">{t('forgotPassword')}</Link>}
            />

            {serverError ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-indigo-500 text-base font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : t('login')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400">
            {t('dontHaveAccount')} {' '}
            <Link href="/register" className="text-indigo-400 font-medium hover:underline">
              {t('signUp')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
