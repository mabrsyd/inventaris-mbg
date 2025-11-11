import { prisma } from './prisma';

export type TransactionClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export const executeInTransaction = async <T>(
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback as (tx: any) => Promise<T>);
};
