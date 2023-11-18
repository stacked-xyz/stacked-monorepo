"use client";
import { Slider } from "@/components/ui/slider";
import React from "react";

import { Label } from "./ui/label";

export default function AllocationSlider({
  onChange,
  defaultValue,
}: {
  onChange: (percentage: number) => void;
  defaultValue: number;
}) {
  const [percentage, setPercentage] = React.useState(defaultValue ?? 0);
  console.log({ percentage, defaultValue });
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-between">
        <Label>{0}%</Label>
        <Label>{100}%</Label>
      </div>
      <div className="flex items-center flex-col justify-center gap-4">
        <Slider
          defaultValue={[percentage]}
          onValueChange={([value]) => {
            setPercentage(value);
            onChange(value);
          }}
          max={100}
        />
        <Label>{!defaultValue ? 0 : percentage}%</Label>
      </div>
      {/* <Button onClick={() => onChange(percentage)}>Save</Button> */}
    </div>
  );
}
