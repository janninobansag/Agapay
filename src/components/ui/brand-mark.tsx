import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5 font-bold tracking-[-0.03em] text-brand-dark">
      <span aria-hidden="true" className="relative size-10 shrink-0 overflow-hidden">
        <Image alt="" className="origin-top scale-125 object-contain" fill priority sizes="40px" src="/images/agapay-logo.png" />
      </span>
      {!compact && <span className="text-xl">Agapay</span>}
    </span>
  );
}
