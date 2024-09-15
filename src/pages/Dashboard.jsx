import React, { useState, useEffect, useContext } from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { motion } from "framer-motion";
import { X, ChevronsDownIcon } from "lucide-react";
import { Map } from "../components/Map.jsx";
import data from "../data/data.json";
import { RxCross1 } from "react-icons/rx";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VscClearAll } from "react-icons/vsc";
import { MdLayers } from "react-icons/md";
import { MdOutlineLayers } from "react-icons/md";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
    "origin.name": [],
    AHECC: [],
  });
  const [toggleHeatLayerValue, setToggleHeatLayerValue] = useState(false);
  const [features, setFeatures] = useState(data);
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  const [destinationSearch, setDestinationSearch] = useState("");

  const filterOptions = {
    "origin.year": getUniqueValues(data, "origin.year"),
    "origin.quarter": getUniqueValues(data, "origin.quarter"),
    MaterialGroup: getUniqueValues(data, "MaterialGroup"),
    "destination.name": getUniqueValues(data, "destination.name"),
    "origin.name": getUniqueValues(data, "origin.name"),
    AHECC: getUniqueValues(data, "AHECC"),
  };

  const filteredDestinations = filterOptions["destination.name"].filter(
    (option) => option.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  const clearDestinationSearch = () => {
    setDestinationSearch("");
  };

  const renderFilterOptions = (filterType, options) => {
    const sortedOptions = options.sort((a, b) => {
      const aChecked = filters[filterType].includes(a);
      const bChecked = filters[filterType].includes(b);
      if (aChecked === bChecked) return 0;
      return aChecked ? -1 : 1;
    });

    return sortedOptions.map((option) => (
      <div key={option} className="flex items-center space-x-2 py-2">
        <Checkbox
          className="rounded-xl"
          id={`${filterType}-${option}`}
          checked={filters[filterType].includes(option)}
          onCheckedChange={() => handleFilterChange(filterType, option)}
        />
        <label
          htmlFor={`${filterType}-${option}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {option}
        </label>
      </div>
    ));
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
          : [];
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
    <div className="w-screen h-screen bg-standard overflow-hidden ">
      <ShootingStars></ShootingStars>
      <StarsBackground></StarsBackground>
      <Header />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 5,
        }}
        className="flex desktop:p-10 desktop:justify-center space-x-5 h-[calc(100vh-64px)] overflow-y-auto"
      >
        <div className="desktop:flex-shrink-0 max-w-[1050px] big:w-[1200px]  min-w-[500px]">
          <div className="flex space-x-2">
            <div className="flex flex-wrap border  laptop:w-[680px] big:w-[1000px] bg-neutral-950 border-borderColor ml-5 justify-center rounded-xl mb-3">
              {[
                { label: "Dest", filterType: "destination.name" },
                { label: "Year", filterType: "origin.year" },
                { label: "Qtr", filterType: "origin.quarter" },
                { label: "Type", filterType: "MaterialGroup" },
                { label: "State", filterType: "origin.name" },
                { label: "#", filterType: "AHECC" },
              ].map(({ label, filterType }) => (
                <div
                  key={label}
                  className="flex flex-col ml-1 mt-1.5 mb-1.5 space-y-1"
                >
                  <Popover>
                    <div className="flex">
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={" text-white text-[8.5px] rounded-2xl"}
                        >
                          {filters[filterType].length > 0
                            ? `${filters[filterType].length}${
                                " " + label + "s"
                              }`
                            : `${label}`}
                          <ChevronsDownIcon className="text-emerald-500 m-1.5 mt-2 w-3"></ChevronsDownIcon>
                        </Button>
                      </PopoverTrigger>

                      <button onClick={() => clearFilter(filterType)}>
                        <RxCross1 className="text-neutral-500 hover:text-red-400 font-bold transition ml-1 mr-1 text-xs" />
                      </button>
                    </div>
                    <PopoverContent className="w-[220px] bg-black border scrollbar-thin scrollbar-track-emerald-500 border-borderColor text-white rounded-xl ml-5 p-5">
                      {filterType === "destination.name" && (
                        <div className="relative mb-2">
                          <input
                            type="text"
                            placeholder="Search"
                            value={destinationSearch}
                            onChange={(e) =>
                              setDestinationSearch(e.target.value)
                            }
                            className="p-1 text-xs placeholder:text-white  w-full bg-neutral-800 text-white border border-neutral-600 rounded pr-8
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                     active:bg-emerald-500 active:text-white
                                     hover:border-emerald-500 transition-colors duration-200"
                          />
                          {destinationSearch && (
                            <button
                              onClick={clearDestinationSearch}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      )}
                      <ScrollArea className="h-[200px] max-h-[300px] w-[200px] rounded-md">
                        {renderFilterOptions(
                          filterType,
                          filterType === "destination.name"
                            ? filteredDestinations
                            : filterOptions[filterType]
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
            <div className="flex space-x-1 rounded-xl border mb-3 pl-2 pr-2 border-borderColor bg-neutral-950">
              <button
                onClick={() => {
                  clearFilter("destination.name");
                  clearFilter("origin.name");
                  clearFilter("origin.year");
                  clearFilter("origin.quarter");
                  clearFilter("MaterialGroup");
                  clearFilter("AHECC");
                }}
                className=""
              >
                <VscClearAll className="rounded-full transition bg-emerald-500 p-2 hover:bg-emerald-600 text-3xl text-white" />
              </button>
              <button
                onClick={() => {
                  setToggleHeatLayerValue(!toggleHeatLayerValue);
                }}
                className=""
              >
                {toggleHeatLayerValue && (
                  <MdLayers className="rounded-full transition bg-emerald-500 p-2 hover:bg-emerald-600 text-3xl text-white" />
                )}
                {!toggleHeatLayerValue && (
                  <MdOutlineLayers className="rounded-full transition bg-emerald-500 p-2 hover:bg-emerald-600 text-3xl text-white" />
                )}
              </button>
            </div>
          </div>
          <div className="relative ml-5 z-10 ">
            <Map features={features} toggleHV={toggleHeatLayerValue} />
          </div>
        </div>

        <div className="desktop:flex-shrink-0 tablet:space-y-20 laptopm:space-y-8 desktop:space-y-8">
          <Information></Information>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-[520px] text-emerald-500 ml-10 h-[320px]"
          >
            <CarouselContent>
              <CarouselItem className="flex flex-col items-center w-[520px] h-[320px]">
                <h1 className="text-white text-lg font-semibold w-full flex justify-center bg-standard border-borderColor border border-b-0 rounded-t-xl">
                  Exported Waste Categories (tonnes) By Years
                </h1>
                <div className="w-full  border-neutral-600 h-[290px]">
                  <LineChartCost data={features} />
                </div>
              </CarouselItem>
              <CarouselItem className="flex flex-col items-center w-[520px] h-[320px]">
                <h1 className="text-white font-semibold text-lg  w-full flex justify-center bg-standard border-borderColor border border-b-0 rounded-t-xl">
                  Exported Waste Categories (Value %) By Years
                </h1>
                <div className="w-full h-[290px]">
                  <StackedBarCost data={features} />
                </div>
              </CarouselItem>
              <CarouselItem className="flex flex-col items-center w-[520px] h-[320px]">
                <h1 className="text-white font-semibold text-lg  w-full flex justify-center bg-standard border-borderColor border border-b-0 rounded-t-xl">
                  Exported Waste (tonnes) By Years
                </h1>
                <div className="w-full h-[290px]">
                  <StackedBarWaste data={features} />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </motion.div>
    </div>
  );
}
