"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@linknest/ui/text-field';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, registerSchema, type RegisterFormValues } from '@/schemas/auth';
import { registerAccount, sendVerificationCode } from '@/services/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

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
      setFeedback(null);
      setSendingCode(true);
      await sendVerificationCode(email);
      setCodeCooldown(60);
      setFeedback({ type: 'success', message: '验证码已发送，请检查邮箱' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : '验证码发送失败' });
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        setFeedback(null);
        await registerAccount(values);
        setFeedback({ type: 'success', message: '注册成功，即将跳转至登录页' });
        setTimeout(() => router.push('/login'), 1200);
      } catch (error) {
        setFeedback({ type: 'error', message: error instanceof Error ? error.message : '注册失败，请稍后再试' });
      }
    },
    (formErrors) => {
      const firstError = Object.values(formErrors)[0];
      const message = typeof firstError?.message === 'string' ? firstError.message : '请检查表单输入';
      setFeedback({ type: 'error', message });
    },
  );

  return (
    <div className="min-h-screen bg-[#040916] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">LN</span>
            LinkNest
          </div>
          <div className="rounded-3xl bg-[#040916] p-4 shadow-2xl">
            <Image
              src="/cover.svg"
              alt="LinkNest cover"
              width={540}
              height={540}
              className="h-auto w-full rounded-2xl object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="rounded-[32px] bg-[#0c1427] p-8 shadow-2xl shadow-black/60">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-semibold">Create Your LinkNest Account</h1>
              <p className="text-slate-400">Organize your digital world, one link at a time.</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <TextField
                label="Nickname"
                placeholder="Enter your nickname"
                {...register('nickname')}
                error={errors.nickname?.message}
              />

              <TextField
                label="Email Address"
                placeholder="Enter your email"
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
                actionSlot={(
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || codeCooldown > 0}
                    className="h-9 rounded-lg bg-indigo-500 px-4 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {codeCooldown > 0 ? `Sent (${codeCooldown}s)` : 'Send Code'}
                  </button>
                )}
              />

              <TextField
                label="Email Verification Code"
                placeholder="Enter the 6-digit code"
                inputMode="numeric"
                {...register('code')}
                error={errors.code?.message}
              />

              <TextField
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password?.message}
              />
              <p className="text-xs text-slate-500">Min. 8 characters, one uppercase, and one number.</p>

              <TextField
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              {feedback ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    feedback.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-red-500/40 bg-red-500/10 text-red-300'
                  }`}
                >
                  {feedback.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-indigo-500 text-base font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 font-medium hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
