import Image from "next/image";
import logo from "@/mandiri-logo.webp";

/** Logo resmi di atas chip putih — teks logo navy tidak terbaca langsung di hero navy. */
export function BrandLogo({ className = "h-10" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm ${className}`}>
      <Image src={logo} alt="Bank Mandiri" priority className="h-full w-auto" />
    </span>
  );
}
