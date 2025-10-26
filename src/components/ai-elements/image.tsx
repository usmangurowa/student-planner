import type { Experimental_GeneratedImage } from "ai";

import { cn } from "@/lib/utils";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({ base64, mediaType, ...props }: ImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    {...props}
    alt={props.alt || "Generated image"}
    className={cn(
      "h-auto max-w-full overflow-hidden rounded-md",
      props.className
    )}
    loading="lazy"
    src={`data:${mediaType};base64,${base64}`}
  />
);
