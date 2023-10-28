import { PrismaClient } from '@prisma/client'
import { User } from "@clerk/backend";

export const prisma = new PrismaClient();

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    //profileImageUrl: user.profileImageUrl,
  };
};