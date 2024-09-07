import React, { useState, useContext, useEffect } from "react";
import { DataSourceContext } from "../contexts/DataSource";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AnimatedNumber from "animated-number-react";
import PieDist from "./PieDist";

const formatValue = (value) => parseInt(value).toLocaleString();

function calculateCostPerTonne(data) {
  let totalTonnes = 0;
  let totalValue = 0;

  data.forEach((item) => {
    totalTonnes += parseFloat(item.origin.tonnes);
    totalValue += parseFloat(item.origin.value);
  });

  // Avoid division by zero
  if (totalValue === 0) {
    return 0;
  }

  return totalValue / totalTonnes;
}

function getLeadingState(data) {
  // Group data by state and sum tonnes
  const stateTotal = data.reduce((acc, item) => {
    const state = item.origin.name;
    const tonnes = item.origin.tonnes;
    acc[state] = (acc[state] || 0) + tonnes;
    return acc;
  }, {});

  // Find state with highest tonnes
  let maxTonnes = 0;
  let leadingState = "";
  for (const [state, tonnes] of Object.entries(stateTotal)) {
    if (tonnes > maxTonnes) {
      maxTonnes = tonnes;
      leadingState = state;
    }
  }

  return {
    stateTotals: stateTotal,
    leadingState: leadingState,
  };
}

export default function Information() {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  const [value, setValue] = useState(0);
  const [ratio, setRatio] = useState(0);
  const [leadingState, setLeadingState] = useState("");

  useEffect(() => {
    setValue(dataSource.length);
    setRatio(calculateCostPerTonne(dataSource));
    setLeadingState(getLeadingState(dataSource).leadingState);
  }, [dataSource]);

  return (
    <div className="w-[520px] flex ml-10 h-[260px] mb-4 bg-standard rounded-lg border-borderColor border">
      <Card className="w-1/2">
        <CardHeader className="bg-standard">
          <CardTitle className="bg-standard text-xl font-semibold">
            Number of Exports
          </CardTitle>
          {/* <CardDescription>Card Description</CardDescription> */}
        </CardHeader>
        <CardContent className="bg-standard">
          <div className="text-5xl w-1/2 text-emerald-500 font-extrabold">
            <AnimatedNumber value={value} formatValue={formatValue} />
          </div>
          <CardTitle className="bg-standard mt-4 text-md font-semibold">
            Average Cost (per tonne)
          </CardTitle>
          <div className="text-xl  text-emerald-600 font-extrabold">
            ${formatValue(ratio) + " "} AUD
          </div>
          <p className="text-xs font-semibold mt-1">
            Leading State in Waste Exports
          </p>
          <div className="text-sm text-emerald-600 font-extrabold">
            {leadingState}
          </div>
        </CardContent>
      </Card>
      <div className="w-1/2">
        <PieDist data={dataSource}></PieDist>
      </div>
    </div>
  );
}
