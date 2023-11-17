"use client";

import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { DialogOverlay } from "./dialog";

const data02 = [
  {
    name: "ETH",
    value: 2400,
  },
  {
    name: "BTC",
    value: 4567,
  },
];

export function Composition({}) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart width={730} height={250}>
        <Pie
          label
          data={data02}
          dataKey="value"
          nameKey="name"
          //   cx="50%"
          //   cy="50%"
          //   outerRadius={50}
          fill="#adfa1d"
        />
      </PieChart>

      {/* <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `$${value}`}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart> */}
    </ResponsiveContainer>
  );
}
