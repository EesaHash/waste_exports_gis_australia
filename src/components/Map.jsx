import React from "react";
import { useState, useEffect, useContext, useCallback, useMemo } from "react";

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
import { DataSourceContext } from "../contexts/DataSource";

const createCurvedLine = (startLatLng, endLatLng) => {
  const latlngs = [];
  const offsetX = endLatLng[1] - startLatLng[1];
  const offsetY = endLatLng[0] - startLatLng[0];
  const r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
  const theta = Math.atan2(offsetY, offsetX);

  // Calculate curvature based on distance
  const curvature = Math.min(Math.max(r * 0.3, 0.5), 2.5); // Increased curvature

  const midPoint = [startLatLng[0] + offsetY / 2, startLatLng[1] + offsetX / 2];
  const midPointOffsetX = curvature * Math.cos(theta + Math.PI / 2);
  const midPointOffsetY = curvature * Math.sin(theta + Math.PI / 2);
  const controlPoint = [
    midPoint[0] + midPointOffsetY * 20.5, // Increased offset
    midPoint[1] + midPointOffsetX * 20.5, // Increased offset
  ];

  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const lat =
      Math.pow(1 - t, 2) * startLatLng[0] +
      2 * (1 - t) * t * controlPoint[0] +
      Math.pow(t, 2) * endLatLng[0];
    const lng =
      Math.pow(1 - t, 2) * startLatLng[1] +
      2 * (1 - t) * t * controlPoint[1] +
      Math.pow(t, 2) * endLatLng[1];
    latlngs.push([lat, lng]);
  }
  return latlngs;
};

const CurvedLine = ({ feature, index, visible }) => {
  const map = useMap();

  useEffect(() => {
    if (!visible) return;

    const curvedPath = createCurvedLine(
      [-25.274398, 133.775136],
      feature.destination.coordinates
    );

    const polyline = L.polyline(curvedPath, {
      color: `#022c22`,
      weight: 1,
    }).addTo(map);

    polyline.bindTooltip(
      `${"AHECC " + feature.AHECC}<br>Waste: ${feature.origin.tonnes} tonnes`,
      { sticky: true }
    );

    return () => {
      map.removeLayer(polyline);
    };
  }, [map, feature, index, visible]);

  return null;
};

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

    // Group features by coordinates
    const grouped = features.reduce((acc, feature) => {
      const originKey = feature.origin.coordinates.join(",");
      const destKey = feature.destination.coordinates.join(",");

      // if (!acc[originKey])
      //   acc[originKey] = { features: [], name: feature.origin.name };
      if (!acc[destKey])
        acc[destKey] = { features: [], name: feature.destination.name };

      // acc[originKey].features.push(feature);
      acc[destKey].features.push(feature);

      return acc;
    }, {});

    setGroupedFeatures(grouped);
  }, [map, features]);

  const handleMarkerClick = useCallback((feature, e) => {
    // console.log("Marker clicked:", feature);
    setDataSource(feature);
    console.log(feature);
    setSelectedFeature(feature[0]);
    console.log(dataSource[0]);
    // console.log(feature);

    e.originalEvent.stopPropagation();
  }, []);

  function MapEvents({ onClick }) {
    useMapEvents({
      click: onClick,
    });
    return null;
  }

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
              {/* <strong>Classes:</strong>{" "}
              {[
                ...new Set(
                  features.map((f) => f.AdditionalClassificationInformation)
                ),
              ].join(", ")}
              <br /> */}
              {/*<strong>Quarters:</strong> {[...new Set(features.map(f => f.origin.quarter))].join(', ')}*/}
              {/*<br/>*/}
              {/*<strong>AHECCs:</strong> {[...new Set(features.map(f => f.AHECC))].join(', ')}*/}
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
      className="rounded-lg h-[500px] sm:w-[600px] md:w-[820px] border shadow-md transition hover:shadow-emerald-500 border-neutral-600"
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

      {/* {features.map((feature, index) => (
        <CurvedLine
          key={`line-${index}`}
          feature={feature}
          index={index}
          visible={selectedFeature === feature}
        />
      ))} */}
    </MapContainer>
  );
};
