import { HandHeart } from "lucide-react";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5 font-bold tracking-[-0.03em] text-brand-dark">
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <HandHeart aria-hidden="true" size={20} strokeWidth={2.2} />
      </span>
      {!compact && <span className="text-xl">Agapay</span>}
    </span>
  );
}

