import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";

import L from "leaflet";
import "leaflet.heat";
import { DataSourceContext } from "../contexts/DataSource";

export const Map = ({ features }) => {
  const { dataSource, setDataSource } = useContext(DataSourceContext);
  const [map, setMap] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [groupedFeatures, setGroupedFeatures] = useState({});

  const markerIcon = useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://img.icons8.com/ios-filled/50/022c22/filled-circle.png",
        iconSize: [20, 20],
        iconAnchor: [0, 0],
        popupAnchor: [0, -45],
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

  const handleMarkerClick = useCallback((feature, e) => {
    setDataSource(feature);
    setSelectedFeature(feature[0]);
    e.originalEvent.stopPropagation();
  }, []);

  function MapEvents({ onClick }) {
    useMapEvents({
      click: onClick,
    });
    return null;
  }

  const formatValue = (value) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + "B";
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "k";
    } else {
      return value.toFixed(0);
    }
  };

  const HeatmapLayer = ({ features }) => {
    const map = useMap();
    const legendRef = useRef(null);

    useEffect(() => {
      if (!map || !features.length) return;

      const points = features.map((feature) => [
        feature.destination.coordinates[0],
        feature.destination.coordinates[1],
        feature.destination.value,
      ]);

      const maxValue = Math.max(...points.map((p) => p[2]));

      // Custom gradient
      const gradient = {
        0.0: "rgba(106, 140, 255, 0.7)",
        0.2: "rgba(30, 144, 255, 0.7)",
        0.4: "rgba(0, 191, 255, 0.7)",
        0.6: "rgba(127, 255, 180, 0.7)",
        0.8: "rgba(255, 215, 0, 0.7)",
        1.0: "rgba(255, 140, 105, 0.7)",
      };

      const heatmap = L.heatLayer(points, {
        radius: 30,
        blur: 25,
        maxZoom: 4,
        max: maxValue,
        gradient: gradient,
      }).addTo(map);

      // Create legend
      const legend = L.control({ position: "bottomright" });

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        const grades = [0, 0.2, 0.4, 0.6, 0.8, 1];
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

  const handleMapClick = useCallback(
    (e) => {
      console.log("Map clicked");
      setDataSource(features);
      setSelectedFeature(null);
    },
    [features]
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
          <strong className="text-emerald-600 text-lg">{name}</strong>
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
                {(
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
              <strong>Waste:</strong>{" "}
              {features[0].origin.tonnes.toLocaleString()} tonnes
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
      className="rounded-lg h-[500px] sm:w-[600px] md:w-[820px] border-2 shadow-md transition hover:border-emerald-500 border-neutral-600"
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
      <MapEvents onClick={handleMapClick} />
      <HeatmapLayer features={features} />
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
    </MapContainer>
  );
};
