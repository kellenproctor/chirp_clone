import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { SpinningLoader } from "~/components/loading";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const ProfileFeed = (props: {userId: string}) => {
  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({userId: props.userId});

  if (isLoading) return <SpinningLoader />;

  if (!data || data.length === 0) return <div>User has no posts, yet.</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });
  // Clerk user
  // const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useUser();

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
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
        <div className="relative w-full border-b text-center">
          <Image
            src={data.profileImageUrl}
            alt="The user's picture"
            width={96}
            height={96}
            className="absolute bottom-0 left-0 -mb-[48px] ml-4 rounded-full border-2"
          />
          <div>{data.username}</div>
        </div>
        <div className="h-32 w-full border bg-stone-900 mb-4"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
