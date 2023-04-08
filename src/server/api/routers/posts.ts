import { type User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { contextProps } from "@trpc/react-query/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  }
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (!author || !author.username) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author for post not found"
        })
      }
      return {
        post,
        author: {
          ...author,
          username: author.username,
        }
      }
    });
  }),

  createPost: privateProcedure.input(z.object({
    content: z.string().emoji().min(1).max(255),
  })).mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser.id;
    const content = input.content;

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content,
      }
    });
    return post;
  })
});
