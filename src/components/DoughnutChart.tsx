import React, { useState } from "react";

interface DoughnutSlice {
  name: string;
  value: number;
  color: string;
  glowColor: string;
}

interface DoughnutChartProps {
  housing: number;
  bills: number;
  food: number;
  debt: number;
  subs: number;
  other: number;
}

export function DoughnutChart({ housing, bills, food, debt, subs, other }: DoughnutChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const rawSlices: DoughnutSlice[] = [
    { name: "Rent & Shelter", value: housing, color: "#ef4444", glowColor: "shadow-red-500/20" }, // Red
    { name: "Bills & Utilities", value: bills, color: "#3b82f6", glowColor: "shadow-blue-500/20" }, // Blue
    { name: "Food & Lifestyle", value: food, color: "#10b981", glowColor: "shadow-emerald-500/20" }, // Emerald
    { name: "Debt Service", value: debt, color: "#f59e0b", glowColor: "shadow-amber-500/20" }, // Amber
    { name: "Subscriptions", value: subs, color: "#8b5cf6", glowColor: "shadow-violet-500/20" }, // Violet
    { name: "Other Expenses", value: other, color: "#6b7280", glowColor: "shadow-gray-500/20" }, // Gray
  ];

  // Filter out zero-value categories so we don't draw blanks
  const slices = rawSlices.filter((s) => s.value > 0);
  const totalSpent = slices.reduce((acc, s) => acc + s.value, 0);

  // SVG parameters
  const size = 180;
  const radius = 60;
  const strokeWidth = 16;
  const strokeWidthHover = 22;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800/60 backdrop-blur-md">
      {/* Chart SVG Canvas */}
      <div className="relative w-[180px] h-[180px]" id="chart_container">
        {totalSpent === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-center text-xs text-neutral-500 font-mono">
            No spending data entered
          </div>
        ) : (
          <>
            <svg width={size} height={size} className="transform -rotate-90">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {slices.map((slice, idx) => {
                const percentage = slice.value / totalSpent;
                const strokeLength = percentage * circumference;
                const strokeOffset = currentOffset;
                currentOffset -= strokeLength;

                const isHovered = activeIdx === idx;

                return (
                  <circle
                    key={slice.name}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidthHover : strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap={percentage > 0.05 ? "round" : "butt"}
                    className="transition-all duration-300 cursor-pointer origin-center"
                    style={{
                      filter: isHovered ? "url(#glow)" : "none",
                    }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseLeave={() => setActiveIdx(null)}
                  />
                );
              })}
            </svg>

            {/* Inner text block */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                {activeIdx !== null ? slices[activeIdx].name : "Total Outgo"}
              </span>
              <span className="text-xl font-bold font-sans text-white tracking-tight mt-0.5">
                $
                {activeIdx !== null
                  ? slices[activeIdx].value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 mt-0.5">
                {activeIdx !== null
                  ? `${((slices[activeIdx].value / totalSpent) * 100).toFixed(1)}%`
                  : "Spending Ring"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Interactive Legend Grid */}
      <div className="flex-1 flex flex-col gap-2.5 w-full">
        {slices.length === 0 ? (
          <p className="text-xs text-neutral-500 italic font-mono">Entering budget figures generates chart data...</p>
        ) : (
          slices.map((slice, idx) => {
            const hasHover = activeIdx === idx;
            const percentage = ((slice.value / totalSpent) * 100).toFixed(1);

            return (
              <div
                key={slice.name}
                className={`flex items-center justify-between p-2 rounded-lg transition-all border ${
                  hasHover
                    ? "bg-neutral-800/60 border-neutral-700/60 translate-x-1"
                    : "bg-neutral-900/20 border-transparent"
                } cursor-pointer`}
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 transition-transform"
                    style={{
                      backgroundColor: slice.color,
                      boxShadow: hasHover ? `0 0 8px ${slice.color}` : "none",
                    }}
                  />
                  <span className={`text-[13px] transition-colors leading-none font-sans ${hasHover ? "text-white font-medium" : "text-neutral-400"}`}>
                    {slice.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className={hasHover ? "text-neutral-200" : "text-neutral-400"}>
                    ${slice.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className={`${hasHover ? "text-emerald-400 font-medium" : "text-neutral-500"}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
