import React, { useContext } from "react";
import { DataSourceContext } from "../contexts/DataSource";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function processWasteData(data) {
  const uniqueYears = [...new Set(data.map((item) => item.origin.year))];
  const uniqueMaterialGroups = [
    ...new Set(data.map((item) => item.MaterialGroup)),
  ];

  return uniqueYears.map((year) => {
    const yearData = { Year: year };
    let yearTotal = 0;

    uniqueMaterialGroups.forEach((group) => {
      const value = data
        .filter(
          (item) => item.origin.year === year && item.MaterialGroup === group
        )
        .reduce((sum, item) => sum + parseFloat(item.origin.value), 0);
      yearData[group] = value;
      yearTotal += value;
    });

    // Calculate percentages
    uniqueMaterialGroups.forEach((group) => {
      yearData[`${group}`] = ((yearData[group] / yearTotal) * 100).toFixed(2);
    });

    console.log(yearData);

    return yearData;
  });
}

const customFormatter = (value, entry) => {
  return <span className="text-white font-mono text-xs">{value}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <div className="bg-black rounded-xl border border-neutral-600 p-3 text-xs">
        <p className="text-sm font-bold mb-0.5 text-emerald-500">
          Year {label}
        </p>
        <div className="border-1 p-1 rounded-xl border-neutral-500">
          {payload.map((element, index) => (
            <p key={index} className="">
              <span className="font-bold" style={{ color: element.color }}>
                {element.dataKey}{" "}
              </span>
              : {` ${element.value}%`}
              <p></p>
            </p>
          ))}
        </div>
      </div>
    );
  }
};

const CustomYAxisTick = ({ x, y, payload }) => {
  console.log(payload);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#fff" fontSize={12}>
        {`${parseInt(payload.value)}%`}
      </text>
    </g>
  );
};

export default function StackedBarCost({ data }) {
  const { dataSource } = useContext(DataSourceContext);
  const dataset = processWasteData(dataSource.length === 0 ? data : dataSource);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        className="bg-neutral-800 text-white rounded-xl rounded-t-none "
        data={dataset}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          //   label={{
          //     value: "random text",
          //     position: "top",
          //     offset: 160,
          //     fill: "white",
          //   }}
          dataKey="Year"
          tick={{ fill: "white", fontSize: "12px" }}
        />
        <YAxis
          tick={<CustomYAxisTick />}
          domain={[0, 100]}
          label={{
            angle: -90,
            position: "insideLeft",
            fill: "white",
          }}
        />
        <Tooltip cursor={{ fill: "none" }} content={<CustomTooltip />} />
        <Legend
          formatter={customFormatter}
          iconType="circle"
          wrapperStyle={{ width: 510, whiteSpace: "break-spaces" }}
        />
        <Bar dataKey="Glass" stackId="a" fill="#ea7600" name="Glass" />
        <Bar
          dataKey="Hazardous (excl. tyres)"
          stackId="a"
          fill="#f60403"
          name="Hazardous (excl. tyres)"
        />
        <Bar dataKey="Metals" stackId="a" fill="#60cae5" name="Metals" />
        <Bar
          dataKey="Non-core waste"
          stackId="a"
          fill="#b8dd79"
          name="Non-core waste"
        />
        <Bar
          dataKey="Paper & cardboard"
          stackId="a"
          fill="#d25c73"
          name="Paper & cardboard"
        />
        <Bar dataKey="Plastics" stackId="a" fill="#007096" name="Plastics" />
        <Bar dataKey="Textiles" stackId="a" fill="#680e4a" name="Textiles" />
        <Bar dataKey="Tyres" stackId="a" fill="#82ca9d" name="Tyres" />
        <Bar
          dataKey="Other core waste"
          stackId="a"
          fill="#C2B280"
          name="Other core waste"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
