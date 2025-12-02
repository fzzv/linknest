"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useMessage, TextField } from '@linknest/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, registerSchema, type RegisterFormValues } from '@/schemas/auth';
import { registerAccount, sendVerificationCode } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const router = useRouter();
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [message, messageHolder] = useMessage({ placement: 'top' });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const t = useTranslations('Register');

  const {
    register,
    handleSubmit,
    getValues,
    setError,
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

  useEffect(() => {
    if (!isAuthenticated) return;
    message.warning('请先退出登录！');
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
  const emailValidationSchema = useMemo(() => loginSchema.pick({ email: true }), []);

  // 发送验证码
  const handleSendCode = async () => {
    const email = getValues('email');
    const result = emailValidationSchema.safeParse({ email });
    if (!result.success) {
      setError('email', { message: result.error.issues[0]?.message || '请输入正确的邮箱地址' });
      return;
    }
    try {
      setSendingCode(true);
      await sendVerificationCode(email);
      setCodeCooldown(60);
      message.success('验证码已发送，请检查邮箱');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '验证码发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        await registerAccount(values);
        message.success('注册成功，即将跳转至登录页');
        setTimeout(() => router.push('/login'), 1200);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '注册失败，请稍后再试');
      }
    },
    (formErrors) => {
      const firstError = Object.values(formErrors)[0];
      const msg = typeof firstError?.message === 'string' ? firstError.message : '请检查表单输入';
      message.error(msg);
    },
  );

  return (
    <div className="min-h-screen bg-[#040916] text-white">
      {messageHolder}
      <div className="flex items-center gap-2 text-xl font-semibold pt-10 pl-10">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">LN</span>
        LinkNest
      </div>
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 items-center justify-center hidden lg:block">
          <Image
            src="/cover.svg"
            alt="LinkNest cover"
            width={540}
            height={540}
            className="h-auto w-full rounded-2xl object-contain"
            priority
          />
        </div>

        <div className="flex-1">
          <div className="rounded-[32px] bg-[#0c1427] p-8 shadow-2xl shadow-black/60">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-semibold">{t('title')}</h1>
              <p className="text-slate-400">{t('description')}</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <TextField
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
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || codeCooldown > 0}
                    className="h-9 rounded-lg bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {codeCooldown > 0 ? t('sentCode', { codeCooldown }) : t('sendCode')}
                  </button>
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
              <p className="text-xs text-slate-500">{t('passwordRequirements')}</p>

              <TextField
                label={t('confirmPassword')}
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl cursor-pointer bg-indigo-500 text-base font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? t('creatingAccount') : t('createAccount')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              {t('alreadyHaveAccount')} {' '}
              <Link href="/login" className="text-indigo-400 font-medium hover:underline">
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
