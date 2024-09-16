import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import ReactDOM from "react-dom";

import { quantile } from "d3-array";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import * as turf from "@turf/turf";
import worldGeoJSON from "../data/countries.json";
import { FaPlusCircle } from "react-icons/fa";
import { FaMinusCircle } from "react-icons/fa";

import L from "leaflet";
import "leaflet.heat";
import { DataSourceContext } from "../contexts/DataSource";

const formatValue = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + "B";
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + "k";
  } else {
    return value;
  }
};

const CustomZoomControl = () => {
  const map = useMap();
  const containerRef = useRef(null);

  useEffect(() => {
    const CustomZoomControl = L.Control.extend({
      onAdd: function (map) {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );
        containerRef.current = container;
        return container;
      },
      onRemove: function (map) {
        ReactDOM.unmountComponentAtNode(containerRef.current);
      },
    });

    const zoomControl = new CustomZoomControl({ position: "topright" });
    map.addControl(zoomControl);

    const ZoomButtons = () => (
      <div className="flex border-2 bg-black text-white p-2 space-y-2 rounded border-emerald-500 flex-col">
        <button onClick={() => map.zoomIn()} title="Zoom in">
          <FaPlusCircle size={14} />
        </button>
        <button onClick={() => map.zoomOut()} title="Zoom out" className="">
          <FaMinusCircle size={14} />
        </button>
      </div>
    );

    ReactDOM.render(<ZoomButtons />, containerRef.current);

    return () => {
      map.removeControl(zoomControl);
    };
  }, [map]);

  return null;
};

const ResetViewControl = ({ initialView }) => {
  const map = useMap();

  useEffect(() => {
    // Create a custom control
    const ResetViewControl = L.Control.extend({
      onAdd: function (map) {
        const button = L.DomUtil.create(
          "button",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );

        // SVG icon for reset
        const svgIcon = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        `;

        button.innerHTML = svgIcon;
        button.title = "Reset View";
        button.style.backgroundColor = "black";
        button.style.color = "white";
        button.style.width = "36px";
        button.style.height = "36px";
        button.style.cursor = "pointer";
        button.style.padding = "4px";
        button.style.display = "flex";
        button.style.justifyContent = "center";
        button.style.alignItems = "center";
        button.style.borderColor = "#10b981";

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, "click", function () {
          map.setView(initialView.center, initialView.zoom);
        });

        return button;
      },
    });

    const resetControl = new ResetViewControl({ position: "topright" });
    map.addControl(resetControl);

    // Cleanup function to remove the control when the component unmounts
    return () => {
      map.removeControl(resetControl);
    };
  }, [map, initialView]);

  return null;
};

export const Map = ({ features, toggleHV }) => {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  const [map, setMap] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [groupedFeatures, setGroupedFeatures] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [initialView, setInitialView] = useState({ center: [0, 0], zoom: 2 });
  const geoJSONLayerRef = useRef(null);

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://img.icons8.com/ios-filled/50/022c22/filled-circle.png",
        iconSize: [20, 20],
        iconAnchor: [0, 0],
        popupAnchor: [10, 0],
      }),
    []
  );

  useEffect(() => {
    if (map && features.length > 0) {
      console.log("Features available:", features);
      const bounds = L.latLngBounds(
        features.flatMap((feature) => [
          feature.origin.coordinates,
          feature.destination.coordinates,
        ])
      );
      map.fitBounds(bounds);
      setInitialView({ center: bounds.getCenter(), zoom: map.getZoom() });
    }

    const grouped = features.reduce((acc, feature) => {
      const originKey = feature.origin.coordinates.join(",");
      const destKey = feature.destination.coordinates.join(",");
      if (!acc[destKey])
        acc[destKey] = { features: [], name: feature.destination.name };
      acc[destKey].features.push(feature);

      return acc;
    }, {});

    setGroupedFeatures(grouped);
  }, [map, features]);

  const findCountryForCoordinates = useCallback(
    (lng, lat) => {
      const point = turf.point([lng, lat]);
      for (const feature of worldGeoJSON.features) {
        if (feature.geometry.type === "Polygon") {
          if (turf.booleanPointInPolygon(point, feature)) {
            return feature;
          }
        } else if (feature.geometry.type === "MultiPolygon") {
          for (const polygon of feature.geometry.coordinates) {
            if (turf.booleanPointInPolygon(point, turf.polygon(polygon))) {
              return feature;
            }
          }
        }
      }
      return null;
    },
    [worldGeoJSON]
  );

  const CountryHighlight = () => {
    const map = useMap();

    useEffect(() => {
      if (selectedCountry && map) {
        if (geoJSONLayerRef.current) {
          map.removeLayer(geoJSONLayerRef.current);
        }

        geoJSONLayerRef.current = L.geoJSON(selectedCountry, {
          style: {
            fillColor: "#6ee7b7",
            weight: 1,
            opacity: 1,
            color: "#059669",
            fillOpacity: 0.3,
          },
        }).addTo(map);

        //map.fitBounds(geoJSONLayerRef.current.getBounds());

        return () => {
          if (geoJSONLayerRef.current) {
            map.removeLayer(geoJSONLayerRef.current);
          }
        };
      }
    }, [map, selectedCountry]);

    return null;
  };

  const handleMarkerClick = useCallback(
    (feature, e) => {
      setDataSource(feature);
      setSelectedFeature(feature[0]);

      // Determine the country based on the clicked coordinates
      const [lat, lng] = feature[0].destination.coordinates;
      const foundCountry = findCountryForCoordinates(lng, lat);

      if (foundCountry) {
        setSelectedCountry(foundCountry);
      } else {
        setSelectedCountry(null);
      }

      e.originalEvent.stopPropagation();
    },
    [findCountryForCoordinates]
  );

  const HeatmapLayer = ({ features }) => {
    const map = useMap();
    const legendRef = useRef(null);

    useEffect(() => {
      if (!map || !features.length || !toggleHV) return;

      const points = features.map((feature) => [
        feature.destination.coordinates[0],
        feature.destination.coordinates[1],
        feature.destination.value,
      ]);

      const maxValue = Math.max(...points.map((p) => p[2]));

      // Custom gradient
      const gradient = {
        0.0: "rgba(0, 0, 255, 1)",
        0.2: "rgba(0, 102, 255, 1)",
        0.3: "rgba(0, 191, 255, 1)",
        0.6: "rgba(0, 255, 127, 1)",
        0.8: "rgba(255, 215, 0, 1)",
        1.0: "rgba(255, 69, 0, 1)",
      };

      const heatmap = L.heatLayer(points, {
        radius: 25,
        blur: 20,
        maxZoom: 3,
        max: maxValue,
        gradient: gradient,
      }).addTo(map);

      // Create legend
      const legend = L.control({ position: "bottomright" });

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        const grades = [0, 0.2, 0.3, 0.6, 0.8, 1];
        const labels = [];
        let from, to;

        for (let i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];

          labels.push(
            '<i style="background:' +
              gradient[from] +
              '"></i> ' +
              formatValue(from * maxValue) +
              (to ? "&ndash;" + formatValue(to * maxValue) : "+")
          );
        }

        div.innerHTML = "<h4>Value ($AUD)</h4>" + labels.join("<br>");
        return div;
      };

      legend.addTo(map);
      legendRef.current = legend;

      return () => {
        map.removeLayer(heatmap);
        if (legendRef.current) {
          map.removeControl(legendRef.current);
        }
      };
    }, [map, features]);

    return null;
  };

  const MapEvents = ({ onClick }) => {
    useMapEvents({
      click: onClick,
    });
    return null;
  };

  const handleMapClick = useCallback(
    (e) => {
      console.log("Map clicked");
      setDataSource(features);
      setSelectedFeature(null);
      setSelectedCountry(null);
      if (geoJSONLayerRef.current && map) {
        map.removeLayer(geoJSONLayerRef.current);
      }
    },
    [features, map]
  );

  const renderMarker = (coordKey, { features, name }) => {
    const [lat, lng] = coordKey.split(",").map(Number);
    const isGrouped = features.length > 1;

    return (
      <Marker
        key={coordKey}
        icon={markerIcon}
        position={[lat, lng]}
        eventHandlers={{
          click: (e) => handleMarkerClick(features, e),
        }}
      >
        <Popup>
          <strong className="text-emerald-600 text-lg">
            {name === "Israel" ? "Occupied Palestine" : name}
          </strong>
          <br />
          {isGrouped ? (
            <>
              <strong>Total Waste:</strong>{" "}
              <span className="text-emerald-800 text-xs font-mono">
                {(
                  Math.round(
                    features.reduce(
                      (sum, f) => sum + parseFloat(f.origin.tonnes),
                      0
                    ) * 10
                  ) / 10
                ).toLocaleString() + " "}
                tonnes
              </span>
              <br />
              <strong>Cost:</strong>{" "}
              <span className="text-emerald-800 text-xs font-mono">
                {formatValue(
                  Math.round(
                    features.reduce(
                      (sum, f) => sum + parseFloat(f.destination.value),
                      0
                    ) * 10
                  ) / 10
                ).toLocaleString()}{" "}
                AUD
              </span>
              <br />
              <strong>Number of Shipments:</strong>{" "}
              <span className="text-emerald-800 text-xs font-mono">
                {features.length}
              </span>
              <br />
            </>
          ) : (
            <>
              <strong className="text-emerald-900">
                From: {features[0].origin.name}
              </strong>
              <br />
              <strong>Waste:</strong>
              <span className="text-emerald-800 text-xs font-mono">
                {" "}
                {formatValue(features[0].origin.tonnes)} tonnes{" "}
              </span>
              <br />
              <strong>Cost:</strong>
              <span className="text-emerald-800 text-xs font-mono">
                {" "}
                ${formatValue(features[0].origin.value)}{" "}
              </span>
              <br />
              <strong>Class:</strong>{" "}
              {features[0].AdditionalClassificationInformation}
              <br />
              <strong>Quarter:</strong> {features[0].origin.quarter}
              <br />
              <strong>AHECC:</strong> {features[0].AHECC}
            </>
          )}
        </Popup>
        <Tooltip>{name}</Tooltip>
      </Marker>
    );
  };

  return (
    <MapContainer
      className="rounded-xl h-[550px]  border-2 shadow-md transition hover:border-emerald-500 border-borderColor"
      center={[0, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={18}
      whenCreated={setMap}
      maxBounds={[
        [-120, -180],
        [120, 180],
      ]}
      maxBoundsViscosity={1.0}
      onClick={handleMapClick}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        noWrap={true}
        bounds={[
          [-100, -190],
          [100, 190],
        ]}
      />
      <CustomZoomControl></CustomZoomControl>
      <MapEvents onClick={handleMapClick} />
      <HeatmapLayer features={features} />
      <CountryHighlight />
      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        maxClusterRadius={50}
        disableClusteringAtZoom={10}
      >
        {Object.entries(groupedFeatures).map(([coordKey, groupData]) =>
          renderMarker(coordKey, groupData)
        )}
      </MarkerClusterGroup>
      <ResetViewControl initialView={initialView} />
    </MapContainer>
  );
};
