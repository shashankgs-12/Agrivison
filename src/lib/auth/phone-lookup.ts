import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/auth/phone-number";
import type { User } from "@prisma/client";

/** Match canonical phone input against existing rows, including legacy formatting. */
export async function findUserByPhone(phone: string, excludeUserId?: string) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;

  const users: Pick<User, "id" | "phone">[] = await prisma.user.findMany({
    where: {
      phone: { not: null },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    select: { id: true, phone: true },
  });

  return (
    users.find(
      (user: Pick<User, "id" | "phone">) =>
        normalizePhoneNumber(user.phone) === normalizedPhone
    ) ?? null
  );
}
