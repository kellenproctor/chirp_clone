import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";


// HELPERS
const addUserDataToPosts = async (posts: Post[]) => {
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
}

// Create a new ratelimiter, that allows 5 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});


// ROUTER
export const postsRouter = createTRPCRouter({

  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: {
          createdAt: 'desc',
        }
      });
      return addUserDataToPosts(posts);
    }
  ),

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ctx, input}) => {
      const postData = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        }
      });

      if (!postData) {
        throw new TRPCError({code: "NOT_FOUND", message: `Couldn't get post with id ${input.id}`})
      }
      
      const post = (await addUserDataToPosts([postData]))[0];
      
      return post;
    }
  ),

  getPostsByUserId: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ctx, input}) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: 100,
        orderBy: [{createdAt: "desc"}],
      }).then(addUserDataToPosts)

      return posts;
    }
  ),

  createPost: privateProcedure
    .input(z.object({
      content: z.string().emoji("Only emojis are allowed").min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const content = input.content;

      const {success} = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({code: "TOO_MANY_REQUESTS", message: "Please try again in a minute!"});
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content,
        }
      });
      return post;
    }
  ),
});
