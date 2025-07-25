import { Heart, Star } from "lucide-react";
import clsx from "clsx";

type IconButtonProps = {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export function HeartButton({ active, onClick }: IconButtonProps) {
  return (
    <Heart
      onClick={onClick}
      role="button"
      className={clsx(
        "w-5 h-5 transition-transform hover:scale-125 cursor-pointer",
        active ? "text-rose-500 fill-current" : "text-zinc-500"
      )}
    />
  );
}

export function StarButton({ active, onClick }: IconButtonProps) {
  return (
    <Star
      onClick={onClick}
      role="button"
      className={clsx(
        "w-5 h-5 transition-transform hover:scale-125 cursor-pointer",
        active ? "text-yellow-300 fill-current" : "text-zinc-500"
      )}
    />
  );
}
