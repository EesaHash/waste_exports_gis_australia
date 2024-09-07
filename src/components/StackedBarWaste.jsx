import React, { PureComponent } from "react";
import { DataSourceContext } from "../contexts/DataSource";
import { useContext, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function processWasteData(data) {
  const uniqueQuarters = [...new Set(data.map((item) => item.origin.year))];
  const uniqueMaterialGroups = [
    ...new Set(data.map((item) => item.MaterialGroup)),
  ];

  const result = uniqueQuarters.map((year) => {
    const yearData = {
      Year: year,
    };

    uniqueMaterialGroups.forEach((group) => {
      const tonnes = data
        .filter(
          (item) => item.origin.year === year && item.MaterialGroup === group
        )
        .reduce((sum, item) => sum + item.origin.tonnes, 0);

      yearData[group] = Math.round(tonnes * 1000) / 1000;
    });

    return yearData;
  });

  return result;
}

const customFormatter = (value, entry) => {
  return <span className="text-white text-xs">{value}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  // Sort payload by value in descending order
  const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

  const total = sortedPayload.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="bg-black rounded-xl border border-neutral-500 p-4 text-xs">
      <p className="text-sm font-bold mb-2 text-emerald-500">Year {label}</p>
      <div className="border rounded-xl border-neutral-500 overflow-hidden mb-2">
        <table className="w-full">
          <tbody>
            {sortedPayload.map((element, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0 ? "bg-neutral-900" : "bg-neutral-800"
                }
              >
                <td className="px-3 font-bold" style={{ color: element.color }}>
                  {element.dataKey}
                </td>
                <td className="px-3 text-right">
                  {element.value.toLocaleString()} tonnes
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-emerald-500 font-bold text-right">
        Total Waste: {(Math.round(total * 10) / 10).toLocaleString()} tonnes
      </p>
    </div>
  );
};

export default function StackedBarWaste(data) {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  let dataset;

  if (dataSource.length == 0) {
    dataset = processWasteData(data.data);
  } else {
    dataset = processWasteData(dataSource);
  }
  console.log(dataset);
  return (
    // {/* <h1 className="text-emerald-500">
    //   Exported Waste (tonnes) Categories by Financial Years
    // </h1> */}
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        className="bg-standard text-white border border-borderColor rounded-lg border-t-0 rounded-t-none "
        width={500}
        height={300}
        data={dataset}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey="Year" tick={{ fill: "white", fontSize: "12px" }} />
        <YAxis tick={{ fill: "white", fontSize: "12px" }} />
        <Tooltip
          cursor={{ fill: "none" }}
          content={<CustomTooltip />}
          position="bottom"
        />
        <Legend
          formatter={customFormatter}
          iconType="circle"
          wrapperStyle={{
            width: 510,
            whiteSpace: "break-spaces",
          }}
        />
        <Bar dataKey="Glass" stackId="a" fill="#ea7600" />
        <Bar dataKey="Hazardous (excl. tyres)" stackId="a" fill="#f60403" />
        <Bar dataKey="Metals" stackId="a" fill="#60cae5" />
        <Bar dataKey="Non-core waste" stackId="a" fill="#b8dd79" />
        <Bar dataKey="Paper & cardboard" stackId="a" fill="#d25c73" />
        <Bar dataKey="Plastics" stackId="a" fill="#007096" />
        <Bar dataKey="Textiles" stackId="a" fill="#680e4a" />
        <Bar dataKey="Tyres" stackId="a" fill="#82ca9d" />
        <Bar dataKey="Other core waste" stackId="a" fill="#C2B280" />
      </BarChart>
    </ResponsiveContainer>
  );
}
