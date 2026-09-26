import { scoreBand } from "@/lib/constants";

const ARC_LEN = 157.08; // panjang busur setengah lingkaran r=50

export function ScoreGauge({ score }: { score: number }) {
  const band = scoreBand(score);
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 70" className="h-[74px] w-32 shrink-0" aria-hidden>
        <path d="M10,62 A50,50 0 0,1 110,62" stroke="var(--gauge-track)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path
          d="M10,62 A50,50 0 0,1 110,62"
          stroke={band.color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * ARC_LEN} 999`}
          style={{ transition: "stroke-dasharray .5s ease" }}
        />
      </svg>
      <div>
        <div className="text-[26px] font-extrabold leading-none text-heading">{score}</div>
        <div className="mt-1 text-xs font-bold" style={{ color: band.color }}>
          {band.label}
        </div>
        <div className="mt-0.5 text-[10.5px] text-muted">Skor kelayakan internal (simulasi)</div>
      </div>
    </div>
  );
}
