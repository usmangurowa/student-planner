import { IconInnerShadowTop } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <IconInnerShadowTop className="!size-5" />
      <span className="text-base font-semibold">Stuplan</span>
    </div>
  );
};

export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return <IconInnerShadowTop className={cn("!size-5", className)} />;
};

export const LogoStroke = ({ className }: { className?: string }) => {
  return <IconInnerShadowTop className={cn("!size-5", className)} />;
};
