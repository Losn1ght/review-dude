import type { DailyActivity } from "@/lib/types";

interface StreakChartProps {
  data: DailyActivity[];
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakChart({ data }: StreakChartProps) {
  const max = Math.max(1, ...data.map((d) => d.cardsStudied));
  const width = 280;
  const height = 120;
  const barGap = 12;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Cards studied over the last 7 days">
        {data.map((day, i) => {
          const barHeight = Math.max(4, (day.cardsStudied / max) * (height - 24));
          const x = i * (barWidth + barGap);
          const y = height - 24 - barHeight;
          const weekday = new Date(day.date + "T00:00:00").getDay();
          return (
            <g key={day.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                className="fill-primary"
              />
              <text
                x={x + barWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {WEEKDAY_LABELS[weekday]}
              </text>
              {day.cardsStudied > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
                >
                  {day.cardsStudied}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
