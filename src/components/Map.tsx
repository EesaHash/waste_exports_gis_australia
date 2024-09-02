import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { IoMdTrash } from "react-icons/io";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Tooltip,
    useMap,
    useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";




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
      midPoint[0] + midPointOffsetY * 1.2, // Increased offset
      midPoint[1] + midPointOffsetX * 1.2, // Increased offset
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
        feature.origin.coordinates,
        feature.destination.coordinates
      );
  
      const polyline = L.polyline(curvedPath, {
        color: `#022c22`,
        weight: 6,
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
  
  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: (e) => {
        onMapClick(e);
      },
    });
    return null;
  };
  


export const Map: React.FC = ({features}) => {
    const [map, setMap] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);

    const markerIcon = useMemo(
        () =>
            L.icon({
                iconUrl: "https://img.icons8.com/sf-black-filled/64/40C057/waste.png",
                iconSize: [30, 30],
                iconAnchor: [15.5, 42],
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
    }, [map, features]);

    const handleMarkerClick = useCallback((feature, e) => {
        console.log("Marker clicked:", feature);
        setSelectedFeature(feature);
        e.originalEvent.stopPropagation();
    }, []);

    const handleMapClick = useCallback((e) => {
        console.log("Map clicked");
        setSelectedFeature(null);
    }, []);

    return (
        <MapContainer
            className="rounded-xl w-full h-full border-2 border-emerald-900 "
            center={[0, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            // style={{ height: "600px", width: "1000px" }}
            whenCreated={setMap}
            maxBounds={[
                [-90, -180],
                [90, 180],
            ]}
            maxBoundsViscosity={1.0}
        >
            
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                noWrap={true}
                bounds={[
                    [-90, -180],
                    [90, 180],
                ]}
            />
            
            <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                maxClusterRadius={50}
                disableClusteringAtZoom={10}
            >
                {features.map((feature, index) => (
                    <React.Fragment key={index}>
                        <Marker
                            icon={markerIcon}
                            position={feature.origin.coordinates}
                            eventHandlers={{
                                click: (e) => handleMarkerClick(feature, e),
                            }}
                        >
                            <Popup>
                            <strong className="text-emerald-600 text-lg">
                                    {feature.origin.name}
                                </strong>
                                <br />
                                <strong className="text-emerald-900">
                                    To: {feature.destination.name}
                                </strong>
                                <br />
                                <strong>Waste:</strong> {feature.origin.tonnes} tonnes
                                <br />
                                <strong>Class:</strong>{" "}
                                {feature.AdditionalClassificationInformation}
                                <br />
                                <strong>Quarter: </strong>
                                {`${feature.origin.quarter}`}
                                <br />
                                <strong>AHECC: </strong>
                                {`${feature.AHECC}`}
                                <br/>
                            </Popup>
                            <Tooltip>{feature.destination.name}</Tooltip>
                        </Marker>
                        <Marker
                            icon={markerIcon}
                            position={feature.destination.coordinates}
                            eventHandlers={{
                                click: (e) => handleMarkerClick(feature, e),
                            }}
                        >
                            <Popup>
                                <strong className="text-emerald-600 text-lg">
                                    {feature.destination.name}
                                </strong>
                                <br/>
                                <strong className="text-emerald-900">
                                    From: {feature.origin.name}
                                </strong>
                                <br/>
                                <strong>Class:</strong>{" "}
                                {feature.AdditionalClassificationInformation}
                                <br/>
                                <strong>Waste:</strong> {feature.origin.tonnes} tonnes
                                <br/>
                                <strong>Quarter: </strong>
                                {`${feature.origin.quarter}`}
                                <br/>
                                <strong>AHECC: </strong>
                                {`${feature.AHECC}`}
                            </Popup>
                            <Tooltip>{feature.destination.name}</Tooltip>
                        </Marker>
                    </React.Fragment>
                ))}
            </MarkerClusterGroup>
            {features.map((feature, index) => (
        <CurvedLine
          key={`line-${index}`}
          feature={feature}
          index={index}
          visible={selectedFeature === feature}
        />
      ))}
        </MapContainer>

    );
};
