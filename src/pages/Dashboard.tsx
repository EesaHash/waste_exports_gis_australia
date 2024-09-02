import {Map} from '../components/Map'
import data from '../data/data.json'
import {useState, useEffect} from 'react';
import Select from 'react-select';


function filterByQuarter(data, quarter) {
    if (quarter == "All") {
        return data;
    }
    return data.filter((feature) => feature.origin.quarter === quarter);
}

function filterByYear(data, year) {
    return data.filter((feature) => feature.origin.year === year);
}

function filterByAHECC(data, ahecc) {
    return data.filter((feature) => feature.AHECC === ahecc);
}

function filterByMaterialGroup(data, MaterialGroup) {
    return data.filter((feature) => feature.MaterialGroup === MaterialGroup);
}

function filterByCountry(data, country) {
    if (country == "All") {
        return data;
    }
    return data.filter((feature) => feature.destination.name === country);
}

function getUniqueAHECC(data) {
    return [...new Set(data.map((feature) => feature.AHECC))];
}

function getUniqueCountries(data) {
    return [...new Set(data.map((feature) => feature.destination.name))];
}

function getUniqueMaterialGroup(data) {
    return [...new Set(data.map((feature) => feature.MaterialGroup))];
}

function getUniqueAHECCDescription(data) {
    return [...new Set(data.map((feature) => feature.AHECCDescription))];
}

function getUniqueQuarters(data) {
    return [...new Set(data.map((feature) => feature.origin.quarter))];
}

function getUniqueYears(data) {
    return [...new Set(data.map((feature) => feature.origin.year))];
}

export default function Dashboard() {
    const [dataSource, setDataSource] = useState(data);
    const [selectedYear, setSelectedYear] = useState("2017-18");
    const [selectedQuarter, setSelectedQuarter] = useState("2017-18, 3");
    const [selectedMaterialGroup, setSelectedMaterialGroup] = useState("Non-core waste");
    const [selectedDestination, setSelectedDestination] = useState("All");
    const [features, setFeatures] = useState([]);

    const uniqueAHECC = getUniqueAHECC(dataSource);
    const uniqueYears = getUniqueYears(dataSource);
    const uniqueQuarters = getUniqueQuarters(dataSource);
    const filteredQuarters = uniqueQuarters.filter(quarter => quarter.includes(selectedYear));
    const uniqueMaterials = getUniqueMaterialGroup(dataSource);
    const uniqueDestinations = getUniqueCountries(dataSource);

    uniqueDestinations.push("All");
    uniqueDestinations.sort((a, b) => a.year - a.year);
    filteredQuarters.push("All");

    useEffect(() => {
        let filteredData = filterByMaterialGroup(dataSource, selectedMaterialGroup);
        filteredData = filterByCountry(filteredData, selectedDestination);
        filteredData = filterByYear(filteredData, selectedYear);
        filteredData = filterByQuarter(filteredData, selectedQuarter);
        setFeatures(filteredData);
    }, [selectedQuarter, selectedMaterialGroup, selectedYear, selectedDestination, dataSource]);

    return (
        <div className="w-screen h-screen bg-emerald-950">
            <div className='text-white font-bold text-2xl ml-3 p-5'>
            <h1>Australian Waste Exports</h1>
            </div>
    <div className="p-5">
            <div className='flex space-x-2 border w-[1000px] rounded-xl border-emerald-800 p-6'>
                <div className="flex flex-col items-center text-white font-mono space-y-1">
                    <p>Destination</p>
                <Select
                    className="w-64 rounded-full text-white"
                    value={{
                        value: selectedDestination,
                        label: selectedDestination,
                    }}
                    menuPortalTarget={document.body}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            backgroundColor: "#d1fae5",
                            borderColor: "#064e3b",
                            ":hover": {
                                borderColor: "#047857",
                            },
                            padding: "8px",
                            borderRadius: "12px",
                            fontSize: "14px",
                        }),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? "#065f46" : "#022c22",
                            ":hover": {
                                backgroundColor: "#065f46",
                            },
                            padding: "9px",
                            fontSize: "14px",
                            color: "white"
                        }),
                    }}
                    onChange={(option) => setSelectedDestination(option.value)}
                    options={uniqueDestinations.sort().map((destination) => ({
                        value: destination,
                        label: destination,
                    }))}
                />
                </div>
                <div className="flex flex-col w-46 items-center text-white font-mono space-y-1">
                    <p>Year</p>
                <Select
                    value={{
                        value: selectedYear,
                        label: selectedYear,
                    }}
                    onChange={(option) => {
                        setSelectedYear(option.value)
                        setSelectedQuarter("All")
                    }}
                    options={uniqueYears.map((year) => ({
                        value: year,
                        label: year,
                    }))}
                    menuPortalTarget={document.body}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            backgroundColor: "#d1fae5",
                            borderColor: "#064e3b",
                            ":hover": {
                                borderColor: "#047857",
                            },
                            padding: "8px",
                            borderRadius: "12px",
                            fontSize: "14px",
                        }),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? "#065f46" : "#022c22",
                            ":hover": {
                                backgroundColor: "#065f46",
                            },
                            padding: "9px",
                            fontSize: "14px",
                            color: "white"
                        }),
                    }}
                />
                </div>
                <div className="flex flex-col items-center text-white font-mono space-y-1">
                    <p>Quarter</p>
                <Select
                    value={{
                        value: selectedQuarter,
                        label: selectedQuarter,
                    }}
                    onChange={(option) => setSelectedQuarter(option.value)}
                    options={filteredQuarters.map((quarter) => ({
                        value: quarter,
                        label: quarter,
                    }))}
                    menuPortalTarget={document.body}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            backgroundColor: "#d1fae5",
                            borderColor: "#064e3b",
                            ":hover": {
                                borderColor: "#047857",
                            },
                            padding: "8px",
                            borderRadius: "12px",
                            fontSize: "14px",
                        }),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? "#065f46" : "#022c22",
                            ":hover": {
                                backgroundColor: "#065f46",
                            },
                            padding: "9px",
                            fontSize: "14px",
                            color: "white"
                        }),
                    }}
                />
                </div>
                <div className="flex flex-col items-center text-white font-mono space-y-1">
                    <p>Class</p>
                <Select
                    value={{
                        value: selectedMaterialGroup,
                        label: selectedMaterialGroup,
                    }}
                    onChange={(option) => setSelectedMaterialGroup(option.value)}
                    options={uniqueMaterials.map((material) => ({
                        value: material,
                        label: material,
                    }))}
                    menuPortalTarget={document.body}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            backgroundColor: "#d1fae5",
                            borderColor: "#064e3b",
                            ":hover": {
                                borderColor: "#047857",
                            },
                            padding: "8px",
                            borderRadius: "12px",
                            fontSize: "14px",
                        }),
                        menuPortal: (base) => ({...base, zIndex: 9999}),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? "#065f46" : "#022c22",
                            ":hover": {
                                backgroundColor: "#065f46",
                            },
                            padding: "9px",
                            fontSize: "14px",
                            color: "white"
                        }),
                    }}
                />
                </div>

            </div>


            <div className="mt-1 z-0 w-[1000px] h-[600px]">
                <Map features={features}></Map>
            </div>
    </div>
        </div>
    );
}
