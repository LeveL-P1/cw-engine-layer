/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts"

interface HeatPoint {
  x: number
  y: number
  intensity: number
}

interface Props {
  data: HeatPoint[]
}

function getColor(intensity: number) {
  if (intensity > 15) return "#ef4444" // red
  if (intensity > 8) return "#f59e0b"  // amber
  return "#10b981" // green
}

export function SpatialHeatmap({ data }: Props) {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <h3 className="text-lg font-semibold mb-4">
        Spatial Collaboration Heatmap
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart>
          <XAxis type="number" dataKey="x" name="X" stroke="#888" />
          <YAxis type="number" dataKey="y" name="Y" stroke="#888" />
          <ZAxis type="number" dataKey="intensity" range={[50, 300]} />

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value: number | undefined) => [
              `${value ?? 0} edits`,
              "Intensity",
            ]}
          />

          <Scatter
            data={data}
            shape={(props: any) => {
              const { cx, cy, payload } = props
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={Math.min(payload.intensity * 2, 20)}
                  fill={getColor(payload.intensity)}
                  opacity={0.6}
                />
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
