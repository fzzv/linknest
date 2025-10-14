import { ColumnType, Generated } from 'kysely';

export interface UserTable {
  id: Generated<number>;
  name: string;
  email: string;
  password: string;
  createdAt: ColumnType<Date, string | undefined, never>;
  updatedAt: ColumnType<Date, string | undefined, never>;
}
