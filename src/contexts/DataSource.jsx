import React, { createContext, useState } from "react";

export let DataSourceContext = createContext();

const DataSourceContextProvider = (props) => {
  const [dataSource, setDataSource] = useState([]);
  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
        setDataSource,
      }}
    >
      {props.children}
    </DataSourceContext.Provider>
  );
};
export default DataSourceContextProvider;
