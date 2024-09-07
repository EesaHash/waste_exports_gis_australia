import React, { useContext } from "react";
import { DataSourceContext } from "../contexts/DataSource";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
        .reduce((sum, item) => sum + parseFloat(item.origin.tonnes), 0);
      yearData[group] = Math.round(value * 10) / 10;
      yearTotal += value;
    });

    return yearData;
  });
}

const customFormatter = (value, entry) => {
  return <span className="text-white text-xs">{value}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Filter out string values and sort by numeric values in descending order
    const sortedPayload = payload
      .filter((item) => typeof item.value === "number")
      .sort((a, b) => b.value - a.value);

    return (
      <div className="bg-black rounded-xl border border-neutral-500 p-3 text-xs">
        <p className="text-sm font-bold mb-1 text-emerald-500">Year {label}</p>
        <div className="border rounded-xl border-neutral-500 overflow-hidden">
          <table className="w-full">
            <tbody>
              {sortedPayload.map((element, index) => (
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
                    {element.value.toLocaleString()}
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

function formatYAxis(value) {
  if (value > 1000000) return `${parseFloat(value / 1000000) + "M"}`;
  else {
    return value;
  }
}

export default function LineChartCost(data) {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  let dataset;
  if (dataSource.length == 0) {
    dataset = processWasteData(data.data);
  } else {
    dataset = processWasteData(dataSource);
  }
  console.log(dataset);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        className="bg-standard text-white border border-borderColor rounded-lg border-t-0 rounded-t-none "
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
          //   tick={<CustomYAxisTick />}
          tickFormatter={formatYAxis}
          //   domain={[0, 3000000]}
          tick={{ fill: "white", fontSize: "12px" }}
          label={{
            angle: -90,
            position: "insideLeft",
            fill: "white",
          }}
        />
        <Tooltip cursor={{ fill: "none" }} content={<CustomTooltip />} />

        {/* <Line
          formatter={customFormatter}
          iconType="circle"
          wrapperStyle={{ width: 510, whiteSpace: "break-spaces" }}
        /> */}
        <Line dataKey="Glass" stackId="a" stroke="#ea7600" name="Glass" />
        <Line
          dataKey="Hazardous (excl. tyres)"
          stroke="#f60403"
          name="Hazardous (excl. tyres)"
        />
        <Line dataKey="Metals" stackId="a" stroke="#60cae5" name="Metals" />
        <Line dataKey="Non-core waste" stroke="#b8dd79" name="Non-core waste" />
        <Line
          dataKey="Paper & cardboard"
          stroke="#d25c73"
          name="Paper & cardboard"
        />
        <Line dataKey="Plastics" stroke="#007096" name="Plastics" />
        <Line dataKey="Textiles" stroke="#680e4a" name="Textiles" />
        <Line dataKey="Tyres" stroke="#82ca9d" name="Tyres" />
        <Line
          dataKey="Other core waste"
          stroke="#C2B280"
          name="Other core waste"
        />
        <Legend
          formatter={customFormatter}
          iconType="circle"
          wrapperStyle={{
            width: 530,
            whiteSpace: "break-spaces",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
