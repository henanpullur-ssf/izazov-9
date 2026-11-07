import Image from "next/image";

type FestLogoProps = {
  size?: number;
  className?: string;
};

export default function FestLogo({
  size = 48,
  className = "",
}: FestLogoProps) {
  return (
    <Image
      src="/images/branding/izazov-9-logo.png"
      alt="IZAZOV 9.0"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}