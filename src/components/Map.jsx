import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.heat'

import villagesRaw from '../data/villages.geojson?raw'
import boundaryRaw from '../data/boundary.geojson?raw'
import landmarksRaw from '../data/landmarks.geojson?raw'

import starIconUrl from '../icons/star.svg'
import bankIconUrl from '../icons/bank.svg'
import waterIconUrl from '../icons/water.svg'
import toiletIconUrl from '../icons/toilet.svg'
import hospitalIconUrl from '../icons/hospital.svg'
import schoolIconUrl from '../icons/school.svg'
import templeIconUrl from '../icons/temple.svg'
import atmIconUrl from '../icons/atm.svg'

const CENTER = [25.4358, 81.8463]
const SERVICE_RADIUS_METERS = 2000

const villagesData = JSON.parse(villagesRaw)
const boundaryData = JSON.parse(boundaryRaw)
const landmarksData = JSON.parse(landmarksRaw)

const createIcon = (iconUrl, iconSize = [22, 22], iconAnchor = [11, 20]) =>
  L.icon({
    iconUrl,
    iconSize,
    iconAnchor,
    popupAnchor: [0, -16],
  })

const starIcon = createIcon(starIconUrl, [20, 20], [10, 18])
const bankIcon = createIcon(bankIconUrl)
const waterIcon = createIcon(waterIconUrl)
const toiletIcon = createIcon(toiletIconUrl)
const hospitalIcon = createIcon(hospitalIconUrl)
const schoolIcon = createIcon(schoolIconUrl)
const templeIcon = createIcon(templeIconUrl)
const atmIcon = createIcon(atmIconUrl)

const iconMap = {
  bank_mitra: bankIcon,
  water_point: waterIcon,
  public_toilet: toiletIcon,
  hospital: hospitalIcon,
  school: schoolIcon,
  temple: templeIcon,
  atm: atmIcon,
}

const serviceLabelMap = {
  bank_mitra: 'Bank Mitra',
  water_point: 'Water Points',
  public_toilet: 'Public Toilets',
  hospital: 'Hospitals',
  school: 'Schools',
  temple: 'Temples',
  atm: 'ATMs',
}

function getNearbyServiceCounts(villageLatLng) {
  const counts = {
    bank_mitra: 0,
    water_point: 0,
    public_toilet: 0,
    hospital: 0,
    school: 0,
    temple: 0,
    atm: 0,
  }

  landmarksData.features.forEach((feature) => {
    const [lng, lat] = feature.geometry.coordinates
    const distanceMeters = L.latLng(villageLatLng).distanceTo(L.latLng([lat, lng]))
    if (distanceMeters <= SERVICE_RADIUS_METERS && counts[feature.properties.type] !== undefined) {
      counts[feature.properties.type] += 1
    }
  })

  return counts
}

function buildNearbyServicesHtml(villageLatLng) {
  const counts = getNearbyServiceCounts(villageLatLng)
  const items = Object.keys(serviceLabelMap)
    .filter((key) => counts[key] > 0)
    .map((key) => `<li class="text-sm"><span class="font-semibold">${counts[key]}</span> ${serviceLabelMap[key]}</li>`)

  if (items.length === 0) {
    return '<p class="text-sm text-slate-500">No services found within 2 km.</p>'
  }

  return `<ul class="mt-1 space-y-1">${items.join('')}</ul>`
}

function buildVillagePopup(properties, villageLatLng) {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm min-w-55">
      <h3 class="text-base font-semibold text-slate-900 mb-2">Census Villages Info</h3>
      <p class="text-sm"><span class="font-semibold">State:</span> ${properties.state}</p>
      <p class="text-sm"><span class="font-semibold">District:</span> ${properties.district}</p>
      <p class="text-sm"><span class="font-semibold">Sub District:</span> ${properties.sub_district}</p>
      <p class="text-sm"><span class="font-semibold">Village:</span> ${properties.village}</p>
      <div class="mt-3 border-t border-slate-200 pt-2">
        <p class="text-sm font-semibold text-slate-800">Nearby Services (within 2 km)</p>
        ${buildNearbyServicesHtml(villageLatLng)}
      </div>
      <p class="text-sm mt-2"><span class="font-semibold">Census Report:</span> <a href="#" class="text-blue-700 underline">View Report</a></p>
    </div>
  `
}

function buildLandmarkPopup(feature) {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm min-w-55">
      <h3 class="text-base font-semibold text-slate-900 mb-2">Landmark Info</h3>
      <p class="text-sm"><span class="font-semibold">Name:</span> ${feature.properties.name}</p>
      <p class="text-sm"><span class="font-semibold">Type:</span> ${feature.properties.type_label}</p>
      <p class="text-sm"><span class="font-semibold">Village:</span> ${feature.properties.village}</p>
      <p class="text-sm"><span class="font-semibold">Address:</span> ${feature.properties.address}</p>
    </div>
  `
}

function Map({
  baseMap,
  showBoundary,
  showVillages,
  showLandmarks,
  showLabels,
  showHeatmap,
  onlyWithServices,
  searchText,
  landmarkTypeFilter,
}) {
  const mapRef = useRef(null)
  const baseLayerRef = useRef({ osm: null, carto: null, satellite: null })
  const boundaryLayerRef = useRef(null)
  const villageLayerRef = useRef(null)
  const landmarkLayerRef = useRef(null)
  const heatLayerRef = useRef(null)
  const didFitViewRef = useRef(false)

  useEffect(() => {
    const map = L.map('map', { zoomControl: false }).setView(CENTER, 11)
    mapRef.current = map

    L.control.zoom({ position: 'topright' }).addTo(map)

    const osmBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    })

    const lightBase = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    })

    const satelliteBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 20,
        attribution: 'Tiles &copy; Esri',
      }
    )

    baseLayerRef.current = { osm: osmBase, carto: lightBase, satellite: satelliteBase }

    const baseMaps = {
      OpenStreetMap: osmBase,
      'Light Map': lightBase,
      Satellite: satelliteBase,
    }

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map)

    const legend = L.control({ position: 'bottomleft' })
    legend.onAdd = () => {
      const div = L.DomUtil.create(
        'div',
        'rounded-xl border border-slate-200 bg-white/95 p-3 text-xs text-slate-700 shadow-md'
      )
      div.innerHTML =
        '<div class="mb-1 font-semibold text-slate-900">Legend</div>' +
        '⭐ Village<br>' +
        '🏦 Bank Mitra<br>' +
        '💧 Water Point<br>' +
        '🚻 Public Toilet<br>' +
        '🏥 Hospital<br>' +
        '🏫 School<br>' +
        '🛕 Temple / Monument<br>' +
        '🏧 ATM<br>' +
        '🔥 Heatmap: Service Density'
      return div
    }
    legend.addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
      didFitViewRef.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const { osm, carto, satellite } = baseLayerRef.current
    if (osm && carto && satellite) {
      if (map.hasLayer(osm)) map.removeLayer(osm)
      if (map.hasLayer(carto)) map.removeLayer(carto)
      if (map.hasLayer(satellite)) map.removeLayer(satellite)

      if (baseMap === 'carto') {
        carto.addTo(map)
      } else if (baseMap === 'satellite') {
        satellite.addTo(map)
      } else {
        osm.addTo(map)
      }
    }

    if (boundaryLayerRef.current) map.removeLayer(boundaryLayerRef.current)
    if (villageLayerRef.current) map.removeLayer(villageLayerRef.current)
    if (landmarkLayerRef.current) map.removeLayer(landmarkLayerRef.current)
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current)

    const normalizedSearch = searchText.trim().toLowerCase()
    const enabledLandmarkTypes = Object.entries(landmarkTypeFilter)
      .filter(([, isEnabled]) => isEnabled)
      .map(([type]) => type)

    const serviceVillageSet = new Set(
      landmarksData.features
        .filter((feature) => enabledLandmarkTypes.includes(feature.properties.type))
        .map((feature) => feature.properties.village.toLowerCase())
    )

    const filteredLandmarks = landmarksData.features.filter((feature) => {
      const isTypeEnabled = enabledLandmarkTypes.includes(feature.properties.type)
      const villageName = feature.properties.village.toLowerCase()
      const name = feature.properties.name.toLowerCase()
      const matchesSearch =
        normalizedSearch === '' || villageName.includes(normalizedSearch) || name.includes(normalizedSearch)
      return isTypeEnabled && matchesSearch
    })

    const boundaryLayer = L.geoJSON(boundaryData, {
      style: {
        color: 'red',
        weight: 2,
        fillOpacity: 0,
      },
    })

    const villageLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 14,
      maxClusterRadius: 48,
    })

    villagesData.features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates
      const villageName = feature.properties.village.toLowerCase()
      const matchesSearch = normalizedSearch === '' || villageName.includes(normalizedSearch)
      const matchesServiceFilter = !onlyWithServices || serviceVillageSet.has(villageName)

      if (!matchesSearch || !matchesServiceFilter) {
        return
      }

      const latLng = [lat, lng]
      const marker = L.marker(latLng, { icon: starIcon })

      marker.bindPopup(buildVillagePopup(feature.properties, latLng))

      marker.on('click', () => {
        const targetZoom = Math.max(map.getZoom(), 14)
        map.flyTo(latLng, targetZoom, { duration: 0.7 })
      })

      if (showLabels) {
        marker.bindTooltip(feature.properties.village, {
          permanent: true,
          direction: 'top',
          offset: [0, -12],
          className: 'village-label',
        })
      }

      villageLayer.addLayer(marker)
    })

    const landmarkLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 15,
      maxClusterRadius: 42,
    })

    filteredLandmarks.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates
      const icon = iconMap[feature.properties.type] ?? waterIcon
      const marker = L.marker([lat, lng], { icon })
      marker.bindPopup(buildLandmarkPopup(feature))
      landmarkLayer.addLayer(marker)
    })

    const heatPoints = filteredLandmarks.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates
      return [lat, lng, 0.8]
    })

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 24,
      blur: 18,
      minOpacity: 0.35,
      maxZoom: 14,
      gradient: {
        0.15: '#3b82f6',
        0.35: '#22c55e',
        0.6: '#eab308',
        0.85: '#f97316',
        1.0: '#ef4444',
      },
    })

    boundaryLayerRef.current = boundaryLayer
    villageLayerRef.current = villageLayer
    landmarkLayerRef.current = landmarkLayer
    heatLayerRef.current = heatLayer

    if (showBoundary) boundaryLayer.addTo(map)
    if (showVillages) villageLayer.addTo(map)
    if (showLandmarks) landmarkLayer.addTo(map)
    if (showHeatmap && heatPoints.length > 0) heatLayer.addTo(map)

    const villageBounds = villageLayer.getBounds()
    const landmarkBounds = landmarkLayer.getBounds()

    if (!didFitViewRef.current) {
      if (showBoundary && boundaryLayer.getLayers().length > 0) {
        map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] })
      } else if (showVillages && villageBounds.isValid()) {
        map.fitBounds(villageBounds, { padding: [20, 20] })
      } else if (showLandmarks && landmarkBounds.isValid()) {
        map.fitBounds(landmarkBounds, { padding: [20, 20] })
      }
      didFitViewRef.current = true
    }
  }, [
    baseMap,
    showBoundary,
    showVillages,
    showLandmarks,
    showLabels,
    showHeatmap,
    onlyWithServices,
    searchText,
    landmarkTypeFilter,
  ])

  return <div id="map" className="h-full w-full" aria-label="Prayagraj GIS map" />
}

export default Map
