import { DataSourceContext } from "../contexts/DataSource";
import { useContext, useEffect } from "react";
import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

const customColorPalette = [
  "#FF6B6B", // Bright Red
  "#4ECDC4", // Turquoise
  "#FFD700", // Gold
  "#8A2BE2", // Blue Violet
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
  "#1E90FF", // Dodger Blue
  "#FFA500", // Orange
  "#20B2AA", // Light Sea Green
  "#9370DB", // Medium Purple
  "#00CED1", // Dark Turquoise
  "#FF4500", // Orange Red
  "#3CB371", // Medium Sea Green
  "#BA55D3", // Medium Orchid
  "#00BFFF", // Deep Sky Blue
];

const chartSetting = {
  yAxis: [
    {
      label: "Waste (tonnes)",
      tickLabelStyle: {
        fill: "white",
      },
      labelStyle: {
        fill: "white",
      },
    },
  ],
  width: 520,
  height: 280,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-30px, 0)",
    },
  },
};

function processWasteData(data) {
  const uniqueQuarters = [...new Set(data.map((item) => item.origin.quarter))];
  const uniqueMaterialGroups = [
    ...new Set(data.map((item) => item.MaterialGroup)),
  ];

  const result = uniqueQuarters.map((quarter) => {
    const quarterData = {
      Quarter: quarter,
    };

    uniqueMaterialGroups.forEach((group) => {
      const tonnes = data
        .filter(
          (item) =>
            item.origin.quarter === quarter && item.MaterialGroup === group
        )
        .reduce((sum, item) => sum + item.origin.tonnes, 0);

      quarterData[group] = Math.round(tonnes);
    });

    return quarterData;
  });

  return result;
}

// Example usage:
// const dataset = processWasteData(originalData);
// console.log(dataset);
const valueFormatter = (value) => `${value} tonnes`;

export function MyChart(data) {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  let dataset;

  if (dataSource.length == 0) {
    dataset = processWasteData(data.data);
  } else {
    dataset = processWasteData(dataSource);
  }

  useEffect(() => {
    if (dataSource.length == 0) {
      dataset = data;
    } else {
      dataset = data;
    }
  }, [dataSource]);
  return (
    <div className="">
      <BarChart
        className="bg-neutral-800 p-5 border-2 border-neutral-500 rounded-xl"
        dataset={dataset}
        xAxis={[
          {
            scaleType: "band",
            dataKey: "Quarter",
            tickLabelStyle: {
              fill: "white",
            },
            labelStyle: {
              fill: "white",
            },
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fill: "white",
            },
            labelStyle: {
              fill: "white",
            },
          },
        ]}
        series={[
          { dataKey: "Glass", label: "Glass", valueFormatter },
          {
            dataKey: "Hazardous (excl. tyres)",
            label: "Hazardous (excl. tyres)",
            valueFormatter,
          },
          { dataKey: "Metals", label: "Metals", valueFormatter },
          {
            dataKey: "Non-core waste",
            label: "Non-core waste",
            valueFormatter,
          },
          {
            dataKey: "Other core waste",
            label: "Other core waste",
            valueFormatter,
          },
          {
            dataKey: "Paper & cardboard",
            label: "Paper & cardboard",
            valueFormatter,
          },
          { dataKey: "Plastics", label: "Plastics", valueFormatter },
          { dataKey: "Textiles", label: "Textiles", valueFormatter },
          { dataKey: "Tyres", label: "Tyres", valueFormatter },
        ]}
        colors={customColorPalette}
        slotProps={{
          legend: {
            labelStyle: {
              fontSize: 7,
              fill: "white",
            },
            itemMarkStyle: {
              width: 2, // Decrease the icon size
              height: 2,
            },
            itemSpacing: 4, // Decrease the spacing between consecutive legends
          },
        }}
        sx={{
          "& .MuiChartsAxis-line": {
            stroke: "#9CA3AF",
          },
          "& .MuiChartsAxis-tick": {
            stroke: "#9CA3AF",
          },
        }}
        {...chartSetting}
      />
    </div>
  );
}
