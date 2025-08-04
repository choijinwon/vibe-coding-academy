import { z } from 'zod';

// 로그인 폼 스키마
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식을 입력해주세요'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

// 회원가입 폼 스키마
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, '이메일을 입력해주세요')
      .email('올바른 이메일 형식을 입력해주세요'),
    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요')
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '비밀번호는 대문자, 소문자, 숫자를 각각 최소 1개씩 포함해야 합니다'
      ),
    confirmPassword: z
      .string()
      .min(1, '비밀번호 확인을 입력해주세요'),
    name: z
      .string()
      .min(1, '이름을 입력해주세요')
      .min(2, '이름은 최소 2자 이상이어야 합니다')
      .max(50, '이름은 최대 50자까지 입력 가능합니다'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^01[016789]-?\d{3,4}-?\d{4}$/.test(val.replace(/\s/g, '')),
        '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'
      ),
    role: z.enum(['student', 'instructor']).optional().refine(
      (val) => val !== undefined,
      '역할을 선택해주세요'
    ),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, '이용약관에 동의해주세요'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// 비밀번호 재설정 스키마
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식을 입력해주세요'),
});

// 타입 추출
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>; 