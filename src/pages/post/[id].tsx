import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";


const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });
  // Clerk user
  // const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useUser();

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <div className="flex w-full justify-end px-8 py-4">
          {!isSignedIn ? (
            <SignInButton />
          ) : (
            <div className="flex gap-4 rounded-md border-b-4 border-b-slate-400 p-3">
              <UserButton />
              <SignOutButton />
            </div>
          )}
        </div>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;
  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getById.prefetch({id});

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
