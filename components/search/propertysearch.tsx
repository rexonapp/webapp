'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Search, Building2, Check, ChevronDown, TrendingUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface City {
  id?: string
  city: string
  stateCode?: string
  latitude?: number
  longitude?: number
  alternate_name?: string
  all_names?: string[]
}

interface PropertyType {
  id: string
  label: string
}

const TOP_CITIES: City[] = [
  { id: 'bengaluru-KA',     city: 'Bengaluru',     stateCode: 'KA', latitude: 12.9716, longitude: 77.5946, all_names: ['Bengaluru', 'Bangalore'] },
  { id: 'chennai-TN',       city: 'Chennai',       stateCode: 'TN', latitude: 13.0827, longitude: 80.2707 },
  { id: 'delhi-DL',         city: 'Delhi',         stateCode: 'DL', latitude: 28.6139, longitude: 77.2090 },
  { id: 'hyderabad-TS',     city: 'Hyderabad',     stateCode: 'TS', latitude: 17.3850, longitude: 78.4867 },
  { id: 'vijayawada-AP',    city: 'Vijayawada',    stateCode: 'AP', latitude: 16.5062, longitude: 80.6480 },
  { id: 'visakhapatnam-AP', city: 'Visakhapatnam', stateCode: 'AP', latitude: 17.6868, longitude: 83.2185, all_names: ['Visakhapatnam', 'Vishakhapatnam', 'Vizag'] },
  { id: 'tirupati-AP',      city: 'Tirupati',      stateCode: 'AP', latitude: 13.6288, longitude: 79.4192 },
  { id: 'indore-MP',        city: 'Indore',        stateCode: 'MP', latitude: 22.7196, longitude: 75.8577 },
  { id: 'kolkata-WB',       city: 'Kolkata',       stateCode: 'WB', latitude: 22.5726, longitude: 88.3639, all_names: ['Kolkata', 'Calcutta'] },
  { id: 'bhopal-MP',        city: 'Bhopal',        stateCode: 'MP', latitude: 23.2599, longitude: 77.4126 },
  { id: 'mumbai-MH',        city: 'Mumbai',        stateCode: 'MH', latitude: 19.0760, longitude: 72.8777, all_names: ['Mumbai', 'Bombay'] },
  { id: 'ahmedabad-GJ',     city: 'Ahmedabad',     stateCode: 'GJ', latitude: 23.0225, longitude: 72.5714 },
]

const PROPERTY_TYPES: PropertyType[] = [
  { id: 'warehouse',          label: 'Warehouse' },
  { id: 'farm land',          label: 'Farm Land' },
  { id: 'factory',            label: 'Factory' },
  { id: 'industrial',         label: 'Industrial' },
  { id: 'cold-storage',       label: 'Cold Storage' },
  { id: 'commercial-land',    label: 'Commercial Land' },
  { id: 'office-space',       label: 'Office Space' },
  { id: 'showroom',           label: 'Showroom' },
  { id: 'retail-space',       label: 'Retail Space' },
  { id: 'manufacturing-unit', label: 'Manufacturing Unit' },
  { id: 'godown',             label: 'Godown' },
]

type Breakpoint = 'desktop' | 'tablet' | 'mobile'

function useBreakpoint(): Breakpoint {
  const get = (): Breakpoint => {
    if (typeof window === 'undefined') return 'desktop'
    if (window.innerWidth >= 1024) return 'desktop'
    if (window.innerWidth >= 768)  return 'tablet'
    return 'mobile'
  }
  const [bp, setBp] = useState<Breakpoint>(get)
  useEffect(() => {
    const handler = () => setBp(get())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return bp
}

// Single instance rendered into document.body — escapes every stacking context.
// Animation: opacity + translateY only (no scale) so it always slides DOWN
// from the input, never from above.
interface PortalDropdownProps {
  anchorEl:       HTMLElement | null
  isOpen:         boolean
  isSearching:    boolean
  displayCities:  City[]
  isLoading:      boolean
  error:          string | null
  searchQuery:    string
  activeIndex:    number
  selectedCity:   City | null
  listRef:        React.RefObject<HTMLUListElement | null>
  onSelect:       (city: City) => void
  dropdownWidth?: number
}

function PortalDropdown({
  anchorEl, isOpen, isSearching, displayCities,
  isLoading, error, searchQuery, activeIndex,
  selectedCity, listRef, onSelect, dropdownWidth,
}: PortalDropdownProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen || !anchorEl) return
    const update = () => {
      const r = anchorEl.getBoundingClientRect()
      setCoords({
        top:   r.bottom + window.scrollY + 4,  
        left:  r.left   + window.scrollX,
        width: dropdownWidth ?? r.width,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [isOpen, anchorEl, dropdownWidth])

  if (!mounted || !anchorEl) return null

  return createPortal(
    <div
      aria-hidden={!isOpen}
      style={{
        position:      'absolute',
        top:           coords.top,
        left:          coords.left,
        width:         coords.width,
        maxWidth:      560,  
        zIndex:        99999,
        pointerEvents: isOpen ? 'auto' : 'none',
        transform:     isOpen ? 'translateY(0)'   : 'translateY(-8px)',
        opacity:       isOpen ? 1                 : 0,
        transition:    'opacity 140ms ease, transform 140ms ease',
      }}
      className="bg-white rounded-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.13)] overflow-hidden"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {!isSearching && (
        <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            Popular Cities
          </span>
        </div>
      )}

      {error && isSearching ? (
        <div className="px-4 py-4 text-sm text-red-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block flex-shrink-0" />
          {error}
        </div>
      ) : isLoading ? (
        <div className="px-4 py-4 flex items-center gap-3 text-sm text-gray-500">
          <div className="h-4 w-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin flex-shrink-0" />
          Searching cities…
        </div>
      ) : isSearching && displayCities.length === 0 ? (
        <div className="px-4 py-4 text-sm text-gray-500">
          No cities found for{' '}
          <span className="font-medium text-gray-700">&ldquo;{searchQuery}&rdquo;</span>
        </div>
      ) : (
        <ul ref={listRef} className="py-1.5 max-h-[220px] overflow-y-auto" role="listbox">
          {displayCities.map((city, i) => {
            const isSelected =
              selectedCity?.city === city.city &&
              (selectedCity?.stateCode === city.stateCode ||
                (!selectedCity?.stateCode && !city.stateCode))
            const isActive = activeIndex === i
            return (
              <li
                key={city.id || city.city}
                role="option"
                aria-selected={isSelected}
                onPointerDown={(e) => { e.preventDefault(); onSelect(city) }}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition-colors',
                  isActive    ? 'bg-orange-50' : 'hover:bg-gray-50',
                  isSelected  && 'bg-orange-50',
                )}
              >
                <span className="w-5 flex-shrink-0 flex items-center justify-center">
                  {isSelected
                    ? <Check  className="h-4 w-4 text-orange-500" />
                    : <MapPin className="h-4 w-4 text-blue-400" />}
                </span>
                <span className={cn(
                  'text-sm flex-1',
                  isSelected ? 'font-semibold text-gray-900' : 'font-normal text-gray-700',
                )}>
                  {city.city}
                  {city.stateCode && (
                    <span className="ml-1 text-gray-400 font-normal">{city.stateCode}</span>
                  )}
                </span>
               
              </li>
            )
          })}
        </ul>
      )}
    </div>,
    document.body,
  )
}

export default function PropertySearch() {
  const [isOpen,              setIsOpen]              = useState(false)
  const [searchQuery,         setSearchQuery]         = useState('')
  const [selectedCity,        setSelectedCity]        = useState<City | null>(null)
  const [selectedPropertyType,setSelectedPropertyType]= useState('')
  const [activeIndex,         setActiveIndex]         = useState(-1)
  const [cities,              setCities]              = useState<City[]>([])
  const [isLoadingCities,     setIsLoadingCities]     = useState(false)
  const [error,               setError]               = useState<string | null>(null)

  const router     = useRouter()
  const breakpoint = useBreakpoint()

  const containerRef    = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLInputElement>(null)
  const listRef         = useRef<HTMLUListElement>(null)
  const debounceTimer   = useRef<NodeJS.Timeout | null>(null)

  const anchorDesktopRef = useRef<HTMLDivElement>(null)
  const anchorTabletRef  = useRef<HTMLDivElement>(null)
  const anchorMobileRef  = useRef<HTMLDivElement>(null)

  const activeAnchorEl: HTMLElement | null =
    breakpoint === 'desktop' ? anchorDesktopRef.current :
    breakpoint === 'tablet'  ? anchorTabletRef.current  :
                               anchorMobileRef.current

  const fetchCities = useCallback(async (query: string) => {
    if (query.trim().length < 1) { setCities([]); return }
    try {
      setIsLoadingCities(true)
      setError(null)
      const res = await fetch(`/api/cities?search=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Failed to fetch cities')
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('Invalid data format')
      setCities(data)
    } catch (err) {
      console.error('❌ Error fetching cities:', err)
      setError('Unable to load cities. Please try again.')
      setCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }, [])

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      searchQuery.trim().length >= 1 ? fetchCities(searchQuery) : setCities([])
    }, 300)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [searchQuery, fetchCities])

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  const isSearching   = searchQuery.trim().length >= 1
  const displayCities = isSearching ? cities : TOP_CITIES

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) { setIsOpen(true); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, displayCities.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleCitySelect(displayCities[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const handleCitySelect = (city: City) => {
    if (!city?.city) return
    setSelectedCity(city)
    setSearchQuery(city.stateCode ? `${city.city}, ${city.stateCode}` : city.city)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchQuery('')
    setSelectedCity(null)
    setCities([])
    setIsOpen(true)
    inputRef.current?.focus()
  }

  const handleSearch = () => {
    if (!selectedCity) { setIsOpen(true); inputRef.current?.focus(); return }
    const params = new URLSearchParams()
    params.append('city', selectedCity.city)
    if (selectedCity.stateCode)  params.append('state', selectedCity.stateCode)
    if (selectedCity.latitude  !== undefined) params.append('lat', selectedCity.latitude.toString())
    if (selectedCity.longitude !== undefined) params.append('lng', selectedCity.longitude.toString())
    const allNames   = selectedCity.all_names || []
    const alternates = allNames.filter(n => n.toLowerCase() !== selectedCity.city.toLowerCase())
    selectedCity.alternate_name?.split(',').forEach(n => {
      const t = n.trim()
      if (t && !alternates.map(a => a.toLowerCase()).includes(t.toLowerCase())) alternates.push(t)
    })
    if (alternates.length)     params.append('alternate_names', alternates.join(','))
    if (selectedPropertyType)  params.append('type', selectedPropertyType)
    router.push(`/search?${params.toString()}`)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!selectedCity) return
    const display = selectedCity.stateCode
      ? `${selectedCity.city}, ${selectedCity.stateCode}`
      : selectedCity.city
    if (searchQuery !== display) setSelectedCity(null)
  }, [searchQuery]) 

  const portalProps = {
    isOpen, isSearching, displayCities,
    isLoading: isLoadingCities,
    error, searchQuery, activeIndex, selectedCity,
    listRef, onSelect: handleCitySelect,
  }



  const inputJSX = (
    <>
      <MapPin className={cn(
        'h-4 w-4 flex-shrink-0 transition-colors',
        isOpen ? 'text-orange-500' : 'text-blue-800',
      )} />
      <input
        ref={inputRef}
        type="text"
        id="hero-search"
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1) }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search city…"
        className="flex-1 text-sm font-normal bg-transparent focus:outline-none placeholder:text-gray-400 text-gray-800 min-w-0"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
      />
      {searchQuery ? (
        <button
          onPointerDown={(e) => e.preventDefault()} 
          onClick={handleClear}
          className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Clear"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <ChevronDown className={cn(
          'h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180',
        )} />
      )}
    </>
  )

  const propertyTypeSelectSM = (
    <>
      <Building2 className="h-4 w-4 text-blue-800 flex-shrink-0" />
      <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
        <SelectTrigger className="flex-1 min-w-0 !border-0 p-0 h-auto text-sm font-normal bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 [&>span]:truncate">
          <SelectValue placeholder="Property Type" />
        </SelectTrigger>
        <SelectContent position="popper" align="start" sideOffset={8} className="max-h-[250px]">
          {PROPERTY_TYPES.map(t => (
            <SelectItem key={t.id} value={t.id} className="text-sm">{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

  const propertyTypeSelectXS = (
    <>
      <Building2 className="h-3.5 w-3.5 text-blue-800 flex-shrink-0" />
      <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
        <SelectTrigger className="flex-1 min-w-0 !border-0 p-0 h-auto text-xs font-normal bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 [&>span]:truncate">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent position="popper" align="start" sideOffset={8} className="max-h-[250px]">
          {PROPERTY_TYPES.map(t => (
            <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div
        ref={containerRef}
        className="relative shadow-lg border border-gray-200/60 bg-white/95 backdrop-blur-sm rounded-xl"
      >
        <PortalDropdown
          anchorEl={activeAnchorEl}
          // dropdownWidth={breakpoint === 'desktop' ? 360 : undefined}
          {...portalProps}
        />

        <div className="hidden lg:flex items-stretch h-12">
          <div
            ref={anchorDesktopRef}
            className={cn(
              'flex-[2] min-w-0 flex items-center gap-2.5 px-3 border-r border-gray-200 rounded-l-xl h-full transition-colors cursor-text',
              isOpen && 'bg-blue-50/40',
            )}
          >
            {inputJSX}
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-2 px-3.5 border-r border-gray-200 h-full">
            {propertyTypeSelectSM}
          </div>

          <Button
            onClick={handleSearch}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 !h-full rounded-none rounded-r-xl font-medium text-sm shadow-none flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        <div className="hidden md:flex lg:hidden flex-col">
          <div
            ref={anchorTabletRef}
            className={cn(
              'flex items-center gap-2.5 px-4 py-3 border-b border-gray-200 rounded-t-xl transition-colors cursor-text',
              isOpen && 'bg-blue-50/40',
            )}
          >
            {inputJSX}
          </div>

          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-3 border-r border-gray-200">
              {propertyTypeSelectSM}
            </div>
            <Button
              onClick={handleSearch}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-none rounded-br-xl font-medium text-sm shadow-none flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </div>

        <div className="md:hidden">
          <div
            ref={anchorMobileRef}
            className={cn(
              'flex items-center gap-2 px-3.5 py-3 border-b border-gray-200 rounded-t-xl transition-colors cursor-text',
              isOpen && 'bg-blue-50/40',
            )}
          >
            {inputJSX}
          </div>

          <div className="grid grid-cols-2 border-b border-gray-200">
            <div className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-200">
              {propertyTypeSelectXS}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-none rounded-b-xl font-medium text-sm shadow-none flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search Properties</span>
          </Button>
        </div>

      </div>
    </div>
  )
}