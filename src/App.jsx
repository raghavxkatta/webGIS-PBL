import { useMemo, useState } from 'react'
import Map from './components/Map'

import villagesRaw from './data/villages.geojson?raw'
import landmarksRaw from './data/landmarks.geojson?raw'

function App() {
  const villagesData = useMemo(() => JSON.parse(villagesRaw), [])
  const landmarksData = useMemo(() => JSON.parse(landmarksRaw), [])

  const [showBoundary, setShowBoundary] = useState(true)
  const [showVillages, setShowVillages] = useState(true)
  const [showLandmarks, setShowLandmarks] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [onlyWithServices, setOnlyWithServices] = useState(false)
  const [baseMap, setBaseMap] = useState('osm')
  const [searchText, setSearchText] = useState('')
  const [showMobileControls, setShowMobileControls] = useState(false)
  const [landmarkTypeFilter, setLandmarkTypeFilter] = useState({
    bank_mitra: true,
    water_point: true,
    public_toilet: true,
    hospital: true,
    school: true,
    temple: true,
    atm: true,
  })

  const stats = useMemo(() => {
    const villages = villagesData.features.length
    const landmarks = landmarksData.features.length
    const serviceVillages = new Set(landmarksData.features.map((f) => f.properties.village)).size
    return { villages, landmarks, serviceVillages }
  }, [villagesData, landmarksData])

  const toggleLandmarkType = (type) => {
    setLandmarkTypeFilter((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <main className="min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,#e0f2fe_0%,#e2e8f0_45%,#f8fafc_100%)] px-3 py-3 text-slate-800 sm:px-6 sm:py-4 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto max-w-350">
        <header className="mb-3 rounded-2xl border border-cyan-100 bg-white/90 px-5 py-3 shadow-sm backdrop-blur sm:mb-4 sm:px-8">
          <h1 className="text-center text-2xl font-bold tracking-tight text-cyan-900 sm:text-4xl">
            Prayagraj Village GIS Information System
          </h1>
          <p className="mt-2 text-center text-xs text-slate-600 sm:text-base">
            Government-style geospatial portal for Allahabad subdistrict, Prayagraj
          </p>
          <div className="mt-3 flex justify-center lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileControls((v) => !v)}
              className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-cyan-800"
            >
              {showMobileControls ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:h-[calc(100vh-10.5rem)] lg:min-h-0 lg:grid-cols-[340px_1fr]">
          <aside
            className={`min-h-0 ${showMobileControls ? 'block' : 'hidden'} lg:block`}
          >
            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-[#0b3b6f] p-4 text-white shadow-xl">
            <div className="mb-3 flex items-center justify-between border-b border-cyan-200/30 pb-3">
              <h2 className="text-xl font-semibold tracking-wide">Map Controls</h2>
              <span className="rounded-full bg-cyan-400/20 px-2 py-1 text-xs font-medium text-cyan-100">
                Live
              </span>
            </div>
            <div className="max-h-[48vh] flex-1 space-y-3 overflow-y-auto pr-1 lg:max-h-none">
              <div className="rounded-xl bg-white/95 p-3 text-slate-800">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Village Search
                </label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Type village name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                />
              </div>

              <div className="rounded-xl bg-white/95 p-3 text-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Basemap</p>
                <select
                  value={baseMap}
                  onChange={(e) => setBaseMap(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                >
                  <option value="osm">OpenStreetMap</option>
                  <option value="carto">CARTO Light</option>
                </select>
              </div>

              <div className="rounded-xl bg-white/95 p-3 text-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Layers</p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={showBoundary} onChange={() => setShowBoundary((v) => !v)} />
                    Boundary Layer
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={showVillages} onChange={() => setShowVillages((v) => !v)} />
                    Village Layer
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showLandmarks}
                      onChange={() => setShowLandmarks((v) => !v)}
                    />
                    Landmark Layer
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-white/95 p-3 text-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={showLabels} onChange={() => setShowLabels((v) => !v)} />
                    Permanent village labels
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onlyWithServices}
                      onChange={() => setOnlyWithServices((v) => !v)}
                    />
                    Only villages with services
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-white/95 p-3 text-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Landmark Categories
                </p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.bank_mitra}
                      onChange={() => toggleLandmarkType('bank_mitra')}
                    />
                    Bank Mitra
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.water_point}
                      onChange={() => toggleLandmarkType('water_point')}
                    />
                    Water Points
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.public_toilet}
                      onChange={() => toggleLandmarkType('public_toilet')}
                    />
                    Public Toilets
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.hospital}
                      onChange={() => toggleLandmarkType('hospital')}
                    />
                    Hospitals / Health Centres
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.school}
                      onChange={() => toggleLandmarkType('school')}
                    />
                    Schools
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.temple}
                      onChange={() => toggleLandmarkType('temple')}
                    />
                    Temples / Monuments
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={landmarkTypeFilter.atm}
                      onChange={() => toggleLandmarkType('atm')}
                    />
                    ATMs
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/95 p-3 text-center text-slate-800">
                <div>
                  <p className="text-lg font-semibold text-cyan-700">{stats.villages}</p>
                  <p className="text-xs text-slate-500">Villages</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-700">{stats.landmarks}</p>
                  <p className="text-xs text-slate-500">Landmarks</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-700">{stats.serviceVillages}</p>
                  <p className="text-xs text-slate-500">Service Villages</p>
                </div>
              </div>
            </div>
            </div>
          </aside>

          <section className="h-[58vh] min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:h-[62vh] lg:h-auto lg:min-h-0">
            <Map
              baseMap={baseMap}
              showBoundary={showBoundary}
              showVillages={showVillages}
              showLandmarks={showLandmarks}
              showLabels={showLabels}
              onlyWithServices={onlyWithServices}
              searchText={searchText}
              landmarkTypeFilter={landmarkTypeFilter}
            />
          </section>
        </section>
      </div>
    </main>
  )
}

export default App
