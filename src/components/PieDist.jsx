import React, { PureComponent } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { DataSourceContext } from "../contexts/DataSource";
import { useContext, useEffect } from "react";

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function processWasteData(data) {
  let total = 0;
  const result = data.reduce((acc, item) => {
    const group = item.MaterialGroup;
    const tonnes = item.origin.tonnes;

    if (!acc[group]) {
      acc[group] = 0;
    }
    acc[group] += tonnes;
    total += tonnes;

    return acc;
  }, {});

  // Calculate percentages and round to 2 decimal places
  for (let group in result) {
    result[group] = Number(((result[group] / total) * 100).toFixed(2));
  }

  return result;
}
const COLORS = {
  Glass: "#ea7600",
  "Hazardous (excl. tyres)": "#f60403",
  Metals: "#60cae5",
  "Non-core waste": "#b8dd79",
  "Paper & cardboard": "#d25c73",
  Plastics: "#007096",
  Textiles: "#680e4a",
  Tyres: "#82ca9d",
  "Other core waste": "#C2B280",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    console.log(payload);
    return (
      <div className="bg-black rounded-xl border border-neutral-500 p-3 text-xs">
        <p className="text-sm font-bold mb-1 text-white">{payload[0].name}</p>
        <p className="text-sm font-bold mb-1 text-emerald-500">
          {payload[0].value.toLocaleString() + "%"}
        </p>
      </div>
    );
  }
  return null;
};

export default function PieDist(data) {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  let dataset;

  if (dataSource.length == 0) {
    dataset = processWasteData(data.data);
  } else {
    dataset = processWasteData(dataSource);
  }
  const chartData = Object.entries(dataset).map(([name, value]) => ({
    name,
    value,
  }));
  return (
    <ResponsiveContainer width="100%" height={"100%"}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
          //   label={({ name, percent }) =>
          //     `${name} ${(percent * 100).toFixed(0)}%`
          //   }
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                COLORS[entry.name] ||
                `#${Math.floor(Math.random() * 16777215).toString(16)}`
              }
            />
          ))}
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value) => `${value.toFixed(3)} tonnes`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
