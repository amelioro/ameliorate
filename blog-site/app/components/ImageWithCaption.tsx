import Image from "next/image";
import type { ImgHTMLAttributes } from "react";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Optional caption. Mostly populated implicitly via the markdown title
   * syntax (`![alt](src "caption")`), which arrives here as `title`. New posts
   * using the JSX form can pass `caption` directly for clarity.
   */
  caption?: string;
}

/**
 * Override for the markdown `img` element (registered in mdx-components.jsx).
 * When given a caption (via the markdown title attribute or the `caption`
 * prop) the image is wrapped in a `<figure>` with a `<figcaption>` so captions
 * render as styled, accessible text rather than as italicized body copy.
 *
 * Renders a plain `<img>` by default since most images are external
 * (substack-post-media.s3.amazonaws.com, github user-attachments) and
 * `next/image` requires width/height for remote images. Nextra's `staticImage`
 * only optimizes local images for the same reason, so there's no precedent.
 *
 * If a caller passes `width` and `height`, we render through `next/image`
 * instead — opting in to lazy loading, srcset, and AVIF/WebP conversion. This
 * is only reachable from the JSX form (markdown image syntax can't carry
 * dimensions), so use it for new posts when the optimization payoff is
 * worth typing the dimensions:
 *   <ImageWithCaption src="..." alt="..." caption="..." width={800} height={600} />
 */
export const ImageWithCaption = ({ src, alt, title, caption, width, height }: Props) => {
  const captionText = caption ?? (typeof title === "string" ? title : undefined);

  const image =
    typeof src === "string" && width != null && height != null ? (
      <Image
        src={src}
        alt={alt ?? ""}
        width={Number(width)}
        height={Number(height)}
        // `not-first-mt` matches nextra's styling for paragraph spacing
        className="x:mx-auto x:h-auto x:max-w-full x:not-first:mt-[1.25em]"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- see component JSDoc; we'd need to require width/height to use next/image with our remote URLs
      <img src={src} alt={alt ?? ""} className="x:mx-auto x:max-w-full x:not-first:mt-[1.25em]" />
    );

  if (!captionText) return image;

  return (
    <figure>
      {image}
      <figcaption className="x:mt-2 x:text-center x:text-sm x:italic x:text-gray-600 x:dark:text-gray-400">
        {captionText}
      </figcaption>
    </figure>
  );
};
