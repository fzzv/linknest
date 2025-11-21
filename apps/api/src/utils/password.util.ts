import { compare, hash } from 'bcryptjs';

// 盐值
const SALT_ROUNDS = 10;

/**
 * 哈希密码
 * @param value - 密码
 * @returns - 哈希后的密码
 */
export const hashPassword = (value: string): Promise<string> => {
  return hash(value, SALT_ROUNDS);
};

/**
 * 验证密码
 * @param value - 密码
 * @param hashed - 哈希后的密码
 * @returns - 是否匹配
 */
export const verifyPassword = (value: string, hashed: string): Promise<boolean> => {
  return compare(value, hashed);
};
