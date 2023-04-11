import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  return (
    <div className="relative mb-2 mt-3 rounded-md border-4 bg-gray-400 p-4 pt-1 text-center text-3xl">
      <div className="absolute -left-5 -top-2">
        <Image
          src={props.author?.profileImageUrl}
          alt="Post author profile image"
          className="rounded-full border-2"
          width={40}
          height={40}
        />
      </div>
      <div className="pl-2 text-xs">{`@${props.author.username}`}</div>
      <div className="pb-2">{props.post.content}</div>
      <div className="absolute bottom-1 right-1 text-xs text-gray-500">
        {dayjs(props.post.createdAt).fromNow()}
      </div>
    </div>
  );
};

const ProfilePage: NextPage = () => {
  // Clerk user
  // const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isSignedIn } = useUser();

  // Start fetching data ASAP
  // React query will use cached data (eg for the Feed component)
  // as long as the data is the same
  api.posts.getAll.useQuery();

  // Return emtpy div if the user isn't loaded
  // This = blank screen until everything is loaded
  // RETURN TO THIS PART
  // if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="mx-auto flex w-screen flex-col items-center bg-stone-800 md:max-w-2xl lg:max-w-4xl">
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
        Profile Page
      </main>
    </>
  );
};

export default ProfilePage;