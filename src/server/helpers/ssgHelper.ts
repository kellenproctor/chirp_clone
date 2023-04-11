import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "../api/root";
import { prisma } from "../db";
import SuperJSON from "superjson";

export const generateSSGHelper = () =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: SuperJSON,
  });