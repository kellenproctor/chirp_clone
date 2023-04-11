import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
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
      <Link
        href={`/@${props.author.username}`}
        className="pl-2 text-xs"
      >{`@${props.author.username}`}</Link>
      <div className="pb-2">{props.post.content}</div>
      <Link
        href={`/post/${props.post.id}`}
        className="absolute bottom-1 right-1 text-xs text-gray-500"
      >
        {dayjs(props.post.createdAt).fromNow()}
      </Link>
    </div>
  );
};
