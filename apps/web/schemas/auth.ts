import { z } from 'zod';

const passwordRule = /^(?=.*[A-Z])(?=.*\d).{8,}$/u;

export const loginSchema = z.object({
  email: z.string().min(1, '邮箱不能为空').email('请输入正确的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
});

export const registerSchema = loginSchema.extend({
  nickname: z.string().max(30, '昵称最多 30 个字符').optional(),
  code: z.string().regex(/^[0-9]{4,6}$/u, '请输入 4-6 位数字验证码'),
  confirmPassword: z.string().min(6, '确认密码至少 6 位'),
}).superRefine((data, ctx) => {
  const password = data.password;
  const confirmPassword = data.confirmPassword;
  if (!passwordRule.test(password)) {
    ctx.addIssue({
      path: ['password'],
      code: z.ZodIssueCode.custom,
      message: '密码至少 8 位，且包含大写字母和数字',
    });
  }
  if (password !== confirmPassword) {
    ctx.addIssue({
      path: ['confirmPassword'],
      code: z.ZodIssueCode.custom,
      message: '两次输入的密码不一致',
    });
  }
});

export const resetPasswordSchema = z.object({
  email: loginSchema.shape.email,
  code: z.string().regex(/^[0-9]{4,6}$/u, '请输入 4-6 位数字验证码'),
  newPassword: z.string().min(8, '密码至少 8 位，且包含大写字母和数字'),
  confirmPassword: z.string().min(6, '确认密码至少 6 位'),
}).superRefine((data, ctx) => {
  if (!passwordRule.test(data.newPassword)) {
    ctx.addIssue({
      path: ['newPassword'],
      code: z.ZodIssueCode.custom,
      message: '密码至少 8 位，且包含大写字母和数字',
    });
  }
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      path: ['confirmPassword'],
      code: z.ZodIssueCode.custom,
      message: '两次输入的密码不一致',
    });
  }
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
