import React, {useState, useEffect} from 'react';
import {Map} from '../components/Map';
import data from '../data/data.json';
import {TiDelete} from "react-icons/ti";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
//d
function filterData(data, filters) {
    return data.filter((feature) => {
        return (
            (filters.years.includes('All') || filters.years.includes(feature.origin.year)) &&
            (filters.quarters.includes('All') || filters.quarters.includes(feature.origin.quarter)) &&
            (filters.materialGroups.includes('All') || filters.materialGroups.includes(feature.MaterialGroup)) &&
            (filters.destinations.includes('All') || filters.destinations.includes(feature.destination.name))
        );
    });
}

function getUniqueValues(data, key) {
    return ['All', ...new Set(data.map((feature) => {
        if (key.includes('.')) {
            const [mainKey, subKey] = key.split('.');
            return feature[mainKey][subKey];
        }
        return feature[key];
    }))].sort();
}

export default function Dashboard() {
    const [filters, setFilters] = useState({
        years: ['All'],
        quarters: ['All'],
        materialGroups: ['All'],
        destinations: ['All'],
    });
    const [features, setFeatures] = useState(data);

    const uniqueYears = getUniqueValues(data, 'origin.year');
    const uniqueQuarters = getUniqueValues(data, 'origin.quarter');
    const uniqueMaterials = getUniqueValues(data, 'MaterialGroup');
    const uniqueDestinations = getUniqueValues(data, 'destination.name');

    useEffect(() => {
        const filteredData = filterData(data, filters);
        setFeatures(filteredData);
    }, [filters]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prevFilters => {
            const updatedFilter = prevFilters[filterType].includes(value)
                ? prevFilters[filterType].filter(item => item !== value)
                : [...prevFilters[filterType], value];

            if (value === 'All') {
                return {...prevFilters, [filterType]: ['All']};
            }

            const filteredSelection = updatedFilter.filter(item => item !== 'All');

            return {
                ...prevFilters,
                [filterType]: filteredSelection.length ? filteredSelection : ['All']
            };
        });
    };

    return (
        <div className="w-[150vw] h-[130vh] bg-emerald-950 p-5">
            <h1 className="text-white font-bold text-xl font-mono mt-1 mb-5">Australian Waste Exports</h1>
            <div className="flex space-x-4 mb-5 relative z-20">
                {[
                    {label: 'Destination', options: uniqueDestinations, filterType: 'destinations'},
                    {label: 'Year', options: uniqueYears, filterType: 'years'},
                    {label: 'Quarter', options: uniqueQuarters, filterType: 'quarters'},
                    {label: 'Class', options: uniqueMaterials, filterType: 'materialGroups'},
                ].map(({label, options, filterType}) => (
                    <div key={label} className="flex flex-col space-y-2">
                        <label className="text-white text-sm font-mono">{label}</label>
                        <Select onValueChange={(value) => handleFilterChange(filterType, value)}>
                            <SelectTrigger className="w-[180px] text-xs h-3 rounded bg-emerald-100">
                                <SelectValue placeholder={`Select ${label}`}/>
                            </SelectTrigger>
                            <SelectContent className="bg-green-200  rounded-xl">
                                {options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-row space-y-2">
                            <div className="text-white text-xs w-[170px]">
                                {/* <p className="font-semibold mb-1">Selected:</p> */}
                                <div
                                    className="overflow-x-auto text-xs overflow-y-hidden content-center border border-emerald-900 rounded scrollbar-thin scrollbar-thumb-emerald-500 scrollbar-track-emerald-700 h-8">
                                    <p className="border-emerald-300  bg-emerald-950 ml-1 text-white whitespace-nowrap">
                                        {filters[filterType].join(' | ')}
                                    </p>

                                </div>
                            </div>
                            <button
                                className="text-white font-bold ml-1 pb-2  rounded-full"
                                onClick={() => handleFilterChange(filterType, 'All')}

                            >
                                <TiDelete className="text-red-600 hover:text-red-400 transition text-xl"/>
                            </button>
                        </div>
                    </div>

                ))}
            </div>

            <div className='absolute inset-0 z-10 pt-[170px] ml-4 '>
                <Map features={features}/>
            </div>
        </div>
    );
}