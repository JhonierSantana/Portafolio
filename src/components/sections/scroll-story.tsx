import type { CSSProperties, LiHTMLAttributes, ReactNode, Ref } from "react";

/**
 * Least scroll (rem) each item takes. The same for every story, so short items are not rushed past;
 * the focus lingers on each item on top of this (see `withDwell`), so it needs little empty space.
 */
const ITEM_MIN_REM = 11;

type ScrollStoryProps = {
  /** `id` of the heading inside `pinned`, for the section's accessible name. */
  labelledBy: string;
  /** Height of the pinned area in rem. It is centred on screen, so it must fit the viewport. */
  pinHeightRem: number;
  /** Left column, pinned and centred while the items scroll past. */
  pinned: ReactNode;
  /** Optional narrow column between the two, pinned the same way (the sea line). */
  rail?: ReactNode;
  /** Classes for the list of items. */
  listClassName?: string;
  /** The items, as `StoryItem`s. */
  children: ReactNode;
};

const PINNED = "lg:sticky lg:top-(--pin-top) lg:h-(--pin-height) lg:self-start";

/**
 * Layout shared by every scroll story: one area stays pinned in the centre of the screen (lg and up)
 * while a list of items scrolls beside it. Whatever is in the pinned area reacts to the item nearest
 * the middle (see `useFocusPosition`). Below lg it is a plain stacked page.
 */
export function ScrollStory({ labelledBy, pinHeightRem, pinned, rail, listClassName = "", children }: ScrollStoryProps) {
  const vars = {
    "--pin-height": `${pinHeightRem}rem`,
    "--pin-top": `max(4.5rem, calc(50svh - ${pinHeightRem / 2}rem))`,
    "--item-min": `${ITEM_MIN_REM}rem`,
    // Room before the first item and after the last, so each can reach the middle of the pinned area.
    "--runway": `${Math.max(0, pinHeightRem / 2 - ITEM_MIN_REM / 2)}rem`,
  } as CSSProperties;

  return (
    <section aria-labelledby={labelledBy} className="mx-auto max-w-5xl px-6 pt-8">
      <div
        style={vars}
        className={`grid gap-10 lg:gap-10 ${
          rail ? "lg:grid-cols-[minmax(0,5fr)_auto_minmax(0,7fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
        }`}
      >
        <div className={`${PINNED} lg:flex lg:flex-col lg:justify-center`}>{pinned}</div>
        {rail && <div className={`hidden lg:flex lg:items-center ${PINNED}`}>{rail}</div>}
        <ol className={`lg:py-(--runway) ${listClassName}`}>{children}</ol>
      </div>
    </section>
  );
}

/** One item of a scroll story: full colour while it is the focused one, dimmed on large screens otherwise. */
export function StoryItem({
  active,
  className = "",
  ref,
  ...props
}: { active: boolean; ref?: Ref<HTMLLIElement> } & LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li
      ref={ref}
      aria-current={active ? "step" : undefined}
      className={`transition-opacity duration-300 ease-out lg:flex lg:min-h-(--item-min) lg:flex-col lg:justify-center ${
        active ? "opacity-100" : "lg:opacity-45"
      } ${className}`}
      {...props}
    />
  );
}
