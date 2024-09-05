import React, { useState, useEffect, useContext } from "react";
import { Map } from "../components/Map.jsx";
import data from "../data/data.json";
import { RxCross1 } from "react-icons/rx";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { MyChart } from "../components/MyChart.jsx";
import { DataSourceContext } from "../contexts/DataSource";
import Header from "../components/Header.jsx";
import StackedBarWaste from "../components/StackedBarWaste.jsx";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import StackedBarCost from "../components/StackedBarCost.jsx";
import LineChartCost from "../components/LineChartCost.jsx";
import Information from "../components/Information.jsx";

function filterData(data, filters) {
  return data.filter((feature) => {
    return Object.entries(filters).every(([key, values]) => {
      if (values.length === 0 || values.includes("All")) return true;
      const featureValue = key.includes(".")
        ? feature[key.split(".")[0]][key.split(".")[1]]
        : feature[key];
      return values.includes(featureValue);
    });
  });
}

function getUniqueValues(data, key) {
  const uniqueSet = new Set(
    data.map((feature) => {
      if (key.includes(".")) {
        const [mainKey, subKey] = key.split(".");
        return feature[mainKey][subKey];
      }
      return feature[key];
    })
  );
  return ["All", ...Array.from(uniqueSet).sort()];
}

export default function Dashboard() {
  const [filters, setFilters] = useState({
    "origin.year": [],
    "origin.quarter": [],
    MaterialGroup: [],
    "destination.name": [],
  });
  const [features, setFeatures] = useState(data);
  const { dataSource, setDataSource } = useContext(DataSourceContext);

  const filterOptions = {
    "origin.year": getUniqueValues(data, "origin.year"),
    "origin.quarter": getUniqueValues(data, "origin.quarter"),
    MaterialGroup: getUniqueValues(data, "MaterialGroup"),
    "destination.name": getUniqueValues(data, "destination.name"),
  };

  useEffect(() => {
    const filteredData = filterData(data, filters);
    setFeatures(filteredData);
    setDataSource(filteredData);
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (value === "All") {
        updatedFilters[filterType] = updatedFilters[filterType].includes("All")
          ? []
          : ["All"];
      } else {
        const index = updatedFilters[filterType].indexOf(value);
        if (index > -1) {
          updatedFilters[filterType].splice(index, 1);
        } else {
          updatedFilters[filterType].push(value);
        }
        updatedFilters[filterType] = updatedFilters[filterType].filter(
          (item) => item !== "All"
        );
      }
      return updatedFilters;
    });
  };

  const clearFilter = (filterType) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: [],
    }));
    setDataSource(data);
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      <Header />
      <div className="flex space-x-6 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="max-w-[845px] flex-shrink-0">
          <div className="flex flex-wrap border border-neutral-600 ml-5 justify-center bg-neutral-800 rounded-xl mb-3">
            {[
              { label: "Destination", filterType: "destination.name" },
              { label: "Year", filterType: "origin.year" },
              { label: "Quarter", filterType: "origin.quarter" },
              { label: "Class", filterType: "MaterialGroup" },
            ].map(({ label, filterType }) => (
              <div
                key={label}
                className=" flex flex-col ml-1 mb-3 mt-3 space-y-2"
              >
                {/* <label className="text-white text-xs mt-1 font-mono">
                {label}
              </label> */}
                <Popover>
                  <div>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[150px] text-xs rounded border border-neutral-500 bg-black text-white h-6 justify-between"
                      >
                        {filters[filterType].length > 0
                          ? `${filters[filterType].length}${
                              " " + label + "(s)"
                            }`
                          : `${label}`}
                        <ChevronDown className="h-auto w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <button
                      className="text-white font-bold rounded-full"
                      onClick={() => clearFilter(filterType)}
                    >
                      <RxCross1 className="text-neutral-500  rounded-full hover:border-red-500 hover:text-red-400 font-bold transition text-xs ml-1 mt-1" />
                    </button>
                  </div>
                  <PopoverContent className="w-[200px]  bg-black border scrollbar-thin scrollbar-track-emerald-500 border-neutral-500 text-white rounded-xl ml-5 p-1">
                    <ScrollArea className="h-[200px] max-h-[300px] w-[200px] rounded-md p-2">
                      {filterOptions[filterType].map((option) => (
                        <div
                          key={option}
                          className="flex items-center  space-x-2 py-1"
                        >
                          <Checkbox
                            className="border-emerald-500 rounded"
                            id={`${filterType}-${option}`}
                            checked={filters[filterType].includes(option)}
                            onCheckedChange={() =>
                              handleFilterChange(filterType, option)
                            }
                          />
                          <label
                            htmlFor={`${filterType}-${option}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-row space-y-2">
                  <div className="text-white text-xs w-[170px]">
                    <div className="overflow-x-auto text-xs overflow-y-hidden content-center  rounded scrollbar-none scrollbar-thumb-emerald-500 scrollbar-track-emerald-700 h-6">
                      <p className="bont-bold bg-black border border-neutral-500 rounded ml-1 text-emerald-500 whitespace-nowrap">
                        {filters[filterType].join(" | ") || "All"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative ml-5 z-10 h-[calc(100vh-200px)]">
            <Map features={features} />
          </div>
        </div>
        <div className="flex-shrink-0">
          <Information></Information>
          <Carousel className="w-[520px] ml-10 h-[320px]">
            <CarouselContent>
              <CarouselItem className="flex flex-col items-center w-[520px] h-[320px]">
                <h1 className="text-emerald-500 w-full flex justify-center bg-neutral-800 border-neutral-600 border-t rounded-t-xl text-xl">
                  Exported Waste Categories (tonnes) By Years
                </h1>
                <div className="w-full  border-neutral-600 h-[290px]">
                  <StackedBarWaste data={features} />
                </div>
              </CarouselItem>
              <CarouselItem className="flex flex-col items-center w-[520px] h-[320px]">
                <h1 className="text-emerald-500 w-full flex justify-center bg-neutral-800 border-neutral-600 border-t rounded-t-xl text-xl">
                  Exported Waste Categories (Value %) By Years
                </h1>
                <div className="w-full h-[290px]">
                  <StackedBarCost data={features} />
                </div>
              </CarouselItem>
              <CarouselItem className="flex flex-col items-center w-[520px] h-[320px]">
                <h1 className="text-emerald-500 w-full flex justify-center bg-neutral-800 border-neutral-600 border-t rounded-t-xl text-xl">
                  Exported Waste (tonnes) By Years
                </h1>
                <div className="w-full h-[290px]">
                  <LineChartCost data={features} />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </div>
  );
}
