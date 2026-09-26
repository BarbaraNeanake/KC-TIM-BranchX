export function BrandLogo({ className = "h-[34px] w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 210 74" className={className} role="img" aria-label="mandiri">
      <path d="M14,34 Q105,4 196,34" stroke="#FBE0A0" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M12,44 Q105,14 198,44" stroke="#F7C15C" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M10,54 Q105,24 200,54" stroke="#F2A93B" strokeWidth="10" fill="none" strokeLinecap="round" />
      <text x="105" y="72" textAnchor="middle" fontFamily="inherit" fontWeight="800" fontSize="30" fill="#FFFFFF">
        mandiri
      </text>
    </svg>
  );
}
