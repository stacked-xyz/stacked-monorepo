"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Allocations } from "../update-allocation";
import { useAccountAbstraction } from "@/store/accountAbstractionContext";
import { useTokens } from "@/hooks/useTokens";

export function Composition({ allocations }: { allocations: Allocations }) {
   const { numChainId } = useAccountAbstraction();
   const { tokensByAddress } = useTokens(numChainId);

   const data = Object.keys(allocations).map((key) => {
      return { name: key, value: allocations[key] };
   });

   const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      name,
   }: {
      cx: number;
      cy: number;
      midAngle: number;
      innerRadius: number;
      outerRadius: number;
      percent: number;
      name: string;
   }) => {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
      const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

      // const token = name

      return (
         <text
            x={x}
            y={y}
            fill="black"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
         >
            {`${(percent * 100).toFixed(0)}% ${name ?? "N/A/"}`}
         </text>
      );
   };

   const neonColors = [
      "#ccff00",
      "#ff00ff",
      "#33ccff",
      "#ff0066",
      "#66ff66" /* more colors as needed */,
   ];

   return (
      <ResponsiveContainer width="100%" height={350}>
         <PieChart width={730} height={250}>
            <Pie
               label={renderCustomizedLabel}
               data={data}
               dataKey="value"
               nameKey="name"
               labelLine={false}
               fill="#adfa1d"
               animationDuration={500}
            >
               {data.map((entry, index) => (
                  <Cell
                     key={`cell-${index}`}
                     fill={neonColors[index % neonColors.length]}
                  />
               ))}
            </Pie>
         </PieChart>
      </ResponsiveContainer>
   );
}
