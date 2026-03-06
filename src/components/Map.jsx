import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

function buildVillagePopup(properties) {
  return `
    <div class="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm min-w-55">
      <h3 class="text-base font-semibold text-slate-900 mb-2">Census Villages Info</h3>
      <p class="text-sm"><span class="font-semibold">State:</span> ${properties.state}</p>
      <p class="text-sm"><span class="font-semibold">District:</span> ${properties.district}</p>
      <p class="text-sm"><span class="font-semibold">Sub District:</span> ${properties.sub_district}</p>
      <p class="text-sm"><span class="font-semibold">Village:</span> ${properties.village}</p>
      <p class="text-sm mt-2"><span class="font-semibold">Census Report:</span> <a href="#" class="text-blue-700 underline">View Report</a></p>
    </div>
  `
}

function Map({
  baseMap,
  showBoundary,
  showVillages,
  showLandmarks,
  showLabels,
  onlyWithServices,
  searchText,
  landmarkTypeFilter,
}) {
  const mapRef = useRef(null)
  const baseLayerRef = useRef({ osm: null, carto: null })
  const boundaryLayerRef = useRef(null)
  const villageLayerRef = useRef(null)
  const landmarkLayerRef = useRef(null)
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

    baseLayerRef.current = { osm: osmBase, carto: lightBase }

    const baseMaps = {
      OpenStreetMap: osmBase,
      'Light Map': lightBase,
    }
    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map)

    const legend = L.control({ position: 'bottomleft' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'rounded-xl border border-slate-200 bg-white/95 p-3 text-xs text-slate-700 shadow-md')
      div.innerHTML =
        '<div class="mb-1 font-semibold text-slate-900">Legend</div>' +
        '⭐ Village<br>' +
        '🏦 Bank Mitra<br>' +
        '💧 Water Point<br>' +
        '🚻 Public Toilet<br>' +
        '🏥 Hospital<br>' +
        '🏫 School<br>' +
        '🛕 Temple / Monument<br>' +
        '🏧 ATM'
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

    const { osm, carto } = baseLayerRef.current
    if (osm && carto) {
      if (map.hasLayer(osm)) map.removeLayer(osm)
      if (map.hasLayer(carto)) map.removeLayer(carto)
      if (baseMap === 'carto') {
        carto.addTo(map)
      } else {
        osm.addTo(map)
      }
    }

    if (boundaryLayerRef.current) map.removeLayer(boundaryLayerRef.current)
    if (villageLayerRef.current) map.removeLayer(villageLayerRef.current)
    if (landmarkLayerRef.current) map.removeLayer(landmarkLayerRef.current)

    const normalizedSearch = searchText.trim().toLowerCase()
    const enabledLandmarkTypes = Object.entries(landmarkTypeFilter)
      .filter(([, isEnabled]) => isEnabled)
      .map(([type]) => type)

    const serviceVillageSet = new Set(
      landmarksData.features
        .filter((feature) => enabledLandmarkTypes.includes(feature.properties.type))
        .map((feature) => feature.properties.village.toLowerCase())
    )

    const boundaryLayer = L.geoJSON(boundaryData, {
      style: {
        color: 'red',
        weight: 2,
        fillOpacity: 0,
      },
    })

    const villageLayer = L.geoJSON(villagesData, {
      filter: (feature) => {
        const villageName = feature.properties.village.toLowerCase()
        const matchesSearch = normalizedSearch === '' || villageName.includes(normalizedSearch)
        const matchesServiceFilter = !onlyWithServices || serviceVillageSet.has(villageName)
        return matchesSearch && matchesServiceFilter
      },
      pointToLayer: (_feature, latlng) => L.marker(latlng, { icon: starIcon }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(buildVillagePopup(feature.properties))
        if (showLabels) {
          layer.bindTooltip(feature.properties.village, {
            permanent: true,
            direction: 'top',
            offset: [0, -12],
            className: 'village-label',
          })
        }
      },
    })

    const landmarkLayer = L.geoJSON(landmarksData, {
      filter: (feature) => {
        const isTypeEnabled = enabledLandmarkTypes.includes(feature.properties.type)
        const villageName = feature.properties.village.toLowerCase()
        const name = feature.properties.name.toLowerCase()
        const matchesSearch =
          normalizedSearch === '' || villageName.includes(normalizedSearch) || name.includes(normalizedSearch)
        return isTypeEnabled && matchesSearch
      },
      pointToLayer: (feature, latlng) => {
        const icon = iconMap[feature.properties.type] ?? waterIcon
        return L.marker(latlng, { icon })
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div class="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm min-w-55">
            <h3 class="text-base font-semibold text-slate-900 mb-2">Landmark Info</h3>
            <p class="text-sm"><span class="font-semibold">Name:</span> ${feature.properties.name}</p>
            <p class="text-sm"><span class="font-semibold">Type:</span> ${feature.properties.type_label}</p>
            <p class="text-sm"><span class="font-semibold">Village:</span> ${feature.properties.village}</p>
            <p class="text-sm"><span class="font-semibold">Address:</span> ${feature.properties.address}</p>
          </div>
        `)
      },
    })

    boundaryLayerRef.current = boundaryLayer
    villageLayerRef.current = villageLayer
    landmarkLayerRef.current = landmarkLayer

    if (showBoundary) boundaryLayer.addTo(map)
    if (showVillages) villageLayer.addTo(map)
    if (showLandmarks) landmarkLayer.addTo(map)

    if (!didFitViewRef.current) {
      if (showBoundary && boundaryLayer.getLayers().length > 0) {
        map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] })
      } else if (showVillages && villageLayer.getLayers().length > 0) {
        map.fitBounds(villageLayer.getBounds(), { padding: [20, 20] })
      } else if (showLandmarks && landmarkLayer.getLayers().length > 0) {
        map.fitBounds(landmarkLayer.getBounds(), { padding: [20, 20] })
      }
      didFitViewRef.current = true
    }
  }, [
    baseMap,
    showBoundary,
    showVillages,
    showLandmarks,
    showLabels,
    onlyWithServices,
    searchText,
    landmarkTypeFilter,
  ])

  return <div id="map" className="h-full w-full" aria-label="Prayagraj GIS map" />
}

export default Map
