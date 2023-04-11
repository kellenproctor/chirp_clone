import type { PropsWithChildren } from "react";

export const PageLayout =(props: PropsWithChildren) => {
  return (
    <main className="mx-auto flex w-screen flex-col items-center bg-stone-800 md:max-w-2xl lg:max-w-4xl">
      {props.children}
    </main>
  )
}