import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Layers,
  ChevronRight,
  MapPin,
  Clock,
  Activity,
  Filter
} from 'lucide-react';
import { EarthquakeFeature } from '../types/earthquake.ts';
import { filterEarthquakes } from '../services/earthquakeService.ts';

interface EarthquakesListViewProps {
  earthquakes: EarthquakeFeature[];
  totalLoadedCount: number;
  isLoading: boolean;
  onSelectEarthquake: (eq: EarthquakeFeature) => void;
  onOpenMapWithEarthquake?: (eq: EarthquakeFeature) => void;
}

export const EarthquakesListView: React.FC<EarthquakesListViewProps> = ({
  earthquakes,
  totalLoadedCount,
  isLoading,
  onSelectEarthquake,
  onOpenMapWithEarthquake,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minMag, setMinMag] = useState<number>(0);
  const [sortBy, setSortBy] = useState<
    'time_desc' | 'time_asc' | 'mag_desc' | 'mag_asc' | 'depth_asc' | 'depth_desc'
  >('time_desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const filteredItems = useMemo(() => {
    return filterEarthquakes(earthquakes, {
      minMag,
      searchQuery,
      sortBy,
    });
  }, [earthquakes, minMag, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page]);

  // Reset page when filters change
  const handleFilterChange = (newMin: number) => {
    setMinMag(newMin);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const getMagBadge = (mag: number) => {
    if (mag >= 7.0) return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
    if (mag >= 6.0) return 'text-orange-400 bg-orange-950/60 border-orange-800/80';
    if (mag >= 4.5) return 'text-yellow-300 bg-yellow-950/60 border-yellow-800/80';
    if (mag >= 3.0) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
    return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Title & Summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5" />
          <span>Real-Time Seismological Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Earthquakes Explorer
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          Comprehensive, verified records from the USGS Earthquake Hazards Program. Search by
          geographic region, filter by minimum magnitude, and click any record to open its dynamic
          scientific analysis sheet.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b0e17] border border-slate-800 p-4 rounded-xl space-y-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search location (e.g. California, Japan, Turkey, Chile)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Magnitude Filter Buttons */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { val: 0, label: 'All' },
              { val: 2.5, label: 'M 2.5+' },
              { val: 4.5, label: 'M 4.5+' },
              { val: 6.0, label: 'M 6.0+' },
              { val: 7.0, label: 'M 7.0+' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => handleFilterChange(item.val)}
                className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap ${
                  minMag === item.val
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono appearance-none"
              >
                <option value="time_desc">Sort: Most Recent First</option>
                <option value="time_asc">Sort: Oldest First</option>
                <option value="mag_desc">Sort: Highest Magnitude</option>
                <option value="mag_asc">Sort: Lowest Magnitude</option>
                <option value="depth_asc">Sort: Shallowest Depth</option>
                <option value="depth_desc">Sort: Deepest Focus</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Strip */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-slate-900">
          <div>
            Showing <strong className="text-cyan-400">{filteredItems.length}</strong> matching
            events of <strong className="text-slate-300">{totalLoadedCount}</strong> loaded in
            dataset.
          </div>
          {minMag > 0 && (
            <button
              onClick={() => handleFilterChange(0)}
              className="text-cyan-400 hover:underline text-[11px]"
            >
              Clear Magnitude Filter
            </button>
          )}
        </div>
      </div>

      {/* Earthquakes Table / List */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading && earthquakes.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-slate-400">
            <div className="text-cyan-400 animate-pulse font-mono text-xs">
              Fetching USGS Live Seismicity Feeds...
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-2 text-slate-400">
            <p className="text-slate-300 font-medium">No earthquakes match your current filters.</p>
            <p className="text-xs text-slate-400">Try lowering the minimum magnitude or clearing the search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1320] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Magnitude</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date & Time (UTC)</th>
                  <th className="py-3 px-4">Focal Depth</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedItems.map((eq) => {
                  const mag = eq.properties.mag ?? 0;
                  const [lng, lat, depth] = eq.geometry.coordinates;
                  const d = new Date(eq.properties.time);

                  return (
                    <tr
                      key={eq.id}
                      onClick={() => onSelectEarthquake(eq)}
                      className="hover:bg-slate-900/60 cursor-pointer transition-colors group"
                    >
                      {/* Magnitude */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center w-12 py-1 rounded font-mono font-bold text-xs border ${getMagBadge(
                            mag
                          )}`}
                        >
                          M {mag.toFixed(1)}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-500/70 shrink-0" />
                          <span className="line-clamp-1">{eq.properties.place || 'Unknown'}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 pl-5">
                          {lat.toFixed(2)}° N, {lng.toFixed(2)}° E
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                        <div>{d.toLocaleDateString()}</div>
                        <div className="text-slate-400 text-[10px]">
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Depth */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono">
                        <span>{depth.toFixed(1)} km</span>
                        <span className="text-[10px] text-slate-400 block">
                          {depth <= 35 ? 'Shallow' : depth <= 70 ? 'Intermediate' : 'Deep'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEarthquake(eq);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-800 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span>Analysis</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-[#0e1320] border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
