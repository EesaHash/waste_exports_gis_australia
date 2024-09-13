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

    return yearData;
  });
}

const customFormatter = (value, entry) => {
  return <span className="text-white text-xs">{value}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black rounded-xl border border-neutral-500 p-3 text-xs">
        <p className="text-sm font-bold mb-1 text-emerald-500">Year {label}</p>
        <div className="border rounded-xl border-neutral-500 overflow-hidden">
          <table className="w-full">
            <tbody>
              {payload.map((element, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-neutral-900" : "bg-neutral-800"
                  }
                >
                  <td
                    className="py-1 px-3 font-bold"
                    style={{ color: element.color }}
                  >
                    {element.dataKey}
                  </td>
                  <td className="py-1 px-3 text-right">
                    {element.value.toLocaleString() + "%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  return null;
};

const CustomYAxisTick = ({ x, y, payload }) => {
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
        className="bg-standard text-white border border-borderColor rounded-xl border-t-0 rounded-t-none "
        data={dataset}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="Year" tick={{ fill: "white", fontSize: "12px" }} />
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
