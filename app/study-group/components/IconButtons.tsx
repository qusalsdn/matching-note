import { Heart, Star } from "lucide-react";
import clsx from "clsx";

type IconButtonProps = {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
};

export function HeartButton({ active, onClick, ariaLabel }: IconButtonProps) {
  return (
    <Heart
      onClick={onClick}
      aria-label={ariaLabel}
      role="button"
      className={clsx("w-5 h-5 transition-transform hover:scale-125", active ? "text-rose-500 fill-current" : "text-zinc-500")}
    />
  );
}

export function StarButton({ active, onClick, ariaLabel }: IconButtonProps) {
  return (
    <Star
      onClick={onClick}
      aria-label={ariaLabel}
      role="button"
      className={clsx("w-5 h-5 transition-transform hover:scale-125", active ? "text-yellow-300 fill-current" : "text-zinc-500")}
    />
  );
}
