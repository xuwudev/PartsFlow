import { useCallback, useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window { H: any; }
}

const API_KEY = "RmKDFdYTtv4stuUfS2cfmeX_kHkZ7VKKHQu66tF3buE";

const SCRIPTS = [
  "https://js.api.here.com/v3/3.1/mapsjs-core.js",
  "https://js.api.here.com/v3/3.1/mapsjs-service.js",
  "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js",
  "https://js.api.here.com/v3/3.1/mapsjs-ui.js",
];
const CSS_URL = "https://js.api.here.com/v3/3.1/mapsjs-ui.css";

interface Client {
  FIR_KOD: string;
  NAZ_SKR: string;
  MIASTO: string;
  ADRES: string;
  KRAJ_KOD: string;
  GPS_DLUG: number;
  GPS_SZER: number;
  oper_kod?: string | null;
  lat?: number;
  lng?: number;
  is_overridden?: boolean;
  obrot?: number;
}

interface User {
  userId: string;
  name: string;
  oper_kod: string;
}

function addCSS(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = href;
  document.head.appendChild(el);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any).__loaded) resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(), { once: true });
      }
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.type = "text/javascript";
    el.onload = () => { (el as any).__loaded = true; resolve(); };
    el.onerror = () => reject(new Error("Failed: " + src));
    document.head.appendChild(el);
  });
}

async function loadHere(): Promise<void> {
  for (const src of SCRIPTS) await loadScript(src);
  await new Promise<void>((resolve, reject) => {
    let n = 0;
    const t = setInterval(() => {
      n++;
      const ok = window.H?.service?.Platform && window.H?.Map && window.H?.mapevents?.Behavior && window.H?.ui?.UI;
      if (ok) { clearInterval(t); resolve(); }
      else if (n > 150) { clearInterval(t); reject(new Error("HERE Maps timeout")); }
    }, 50);
  });
}

export function MapInfo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const groupRef = useRef<any>(null);

  // ── state ───────────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOpers, setSelectedOpers] = useState<string[]>([]);
  const [showOperDropdown, setShowOperDropdown] = useState(true);
  const [currentUserOperKod, setCurrentUserOperKod] = useState<string | null>(null);
  const [initDataLoaded, setInitDataLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  // Local overrides: FIR_KOD → partial Client (lat/lng/ADRES/MIASTO)
  const [overrides, setOverrides] = useState<Record<string, Partial<Client>>>({});

  // 2-minute geocoding limit tracker
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const [geocodingTimeout, setGeocodingTimeout] = useState<boolean>(false);
  
  // Toggle for optional turnover showing
  const [showObrot, setShowObrot] = useState(false);

  // Minimum turnover filter
  const [minObrot, setMinObrot] = useState("");

  const [maxObrot, setMaxObrot] = useState("");

  // isPickingLocation is kept in a ref so map tap handler never has stale value
  const isPickingLocationRef = useRef(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);

  // selectedClient ref for same reason
  const selectedClientRef = useRef<Client | null>(null);

  const initialZoomDoneRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { isPickingLocationRef.current = isPickingLocation; }, [isPickingLocation]);
  useEffect(() => { selectedClientRef.current = selectedClient; }, [selectedClient]);

  // ── computed: merge overrides into clients ───────────────
  const clientsWithOverrides = useMemo<Client[]>(() =>
    clients.map(c => {
      const ov = overrides[c.FIR_KOD];
      return ov ? { ...c, ...ov, is_overridden: true } : c;
    }),
    [clients, overrides]
  );

  // ── computed: filter by turnover if specified ────
  const mapClients = useMemo<Client[]>(() => {
    let list = clientsWithOverrides;
    if (showObrot) {
      if (minObrot.trim() !== "") {
        const minVal = parseFloat(minObrot);
        if (!isNaN(minVal)) {
          list = list.filter(c => (c.obrot || 0) >= minVal);
        }
      }
      if (maxObrot.trim() !== "") {
        const maxVal = parseFloat(maxObrot);
        if (!isNaN(maxVal)) {
          list = list.filter(c => (c.obrot || 0) <= maxVal);
        }
      }
    }
    return list;
  }, [clientsWithOverrides, showObrot, minObrot, maxObrot]);

  // ── computed: filtered list for sidebar ─────────────────
  const filteredClients = useMemo(() => {
    const s = search.toLowerCase();
    const list = s
      ? mapClients.filter(c =>
        c.FIR_KOD.toLowerCase().includes(s) ||
        c.NAZ_SKR.toLowerCase().includes(s) ||
        (c.MIASTO || "").toLowerCase().includes(s)
      )
      : mapClients;

    // Sort: clients without coordinates first, then by turnover (descending)
    return [...list].sort((a, b) => {
      const aHas = (a.lat ?? a.GPS_SZER) !== 0 && (a.lng ?? a.GPS_DLUG) !== 0 && (a.lat ?? a.GPS_SZER) != null && (a.lng ?? a.GPS_DLUG) != null;
      const bHas = (b.lat ?? b.GPS_SZER) !== 0 && (b.lng ?? b.GPS_DLUG) !== 0 && (b.lat ?? b.GPS_SZER) != null && (b.lng ?? b.GPS_DLUG) != null;
      if (!aHas && bHas) return -1;
      if (aHas && !bHas) return 1;

      // If both have or both don't have coordinates, sort by turnover descending
      const obrotA = a.obrot || 0;
      const obrotB = b.obrot || 0;
      if (obrotA !== obrotB) {
        return obrotB - obrotA;
      }

      return a.FIR_KOD.localeCompare(b.FIR_KOD);
    });
  }, [search, mapClients]);

  // ── helpers ──────────────────────────────────────────────
  const getOperName = (code: string) => users.find(u => u.oper_kod === code)?.name || code;

  // Stable mapping of individual operator codes to distinct colors
  const operColorsMap = useMemo(() => {
    const codesSet = new Set<string>();

    users.forEach(u => {
      if (u.oper_kod) {
        u.oper_kod.split(",").forEach(code => {
          const normalized = code.trim().toUpperCase();
          if (normalized) codesSet.add(normalized);
        });
      }
    });

    clients.forEach(c => {
      if (c.oper_kod) {
        const normalized = c.oper_kod.trim().toUpperCase();
        if (normalized) codesSet.add(normalized);
      }
    });

    const uniqueOpers = Array.from(codesSet);
    uniqueOpers.sort();

    const palette = [
      "#2563eb", // blue
      "#dc2626", // red
      "#16a34a", // green
      "#9333ea", // purple
      "#0891b2", // cyan
      "#ea580c", // orange
      "#be123c", // rose
      "#4f46e5", // indigo
      "#15803d", // forest green
      "#a21caf", // fuchsia
      "#0369a1", // sky blue
      "#854d0e", // amber/gold
      "#ec4899", // pink
      "#10b981", // emerald
      "#f43f5e", // rose light
      "#8b5cf6", // violet
      "#06b6d4", // cyan bright
      "#f97316", // orange bright
      "#14b8a6", // teal
      "#6366f1", // indigo bright
    ];

    const map: Record<string, string> = {};
    uniqueOpers.forEach((oper, index) => {
      if (index < palette.length) {
        map[oper] = palette[index];
      } else {
        // Fallback: generate distinct HSL colors for any beyond the palette size
        const hue = (index * 137.5) % 360;
        map[oper] = `hsl(${hue}, 70%, 50%)`;
      }
    });
    return map;
  }, [users, clients]);

  const getMarkerColor = useCallback((operKod: string | null | undefined, isOverridden = false) => {
    if (isOverridden) return "#f97316";
    if (!operKod) return "#6b7280";
    const normalized = operKod.trim().toUpperCase();
    return operColorsMap[normalized] || "#6b7280";
  }, [operColorsMap]);

  // ── fetch ────────────────────────────────────────────────
  const fetchClients = useCallback(() => {
    setLoading(true);
    setGeocodingTimeout(false);
    setLoadStartTime(Date.now());
    const opersParam = selectedOpers.join(",");
    fetch(`/api/map-clients?selectedOper=${opersParam || "none"}&withObrot=${showObrot}`)
      .then(r => r.json())
      .then((data: Client[]) => { setClients(data); setLoading(false); })
      .catch(err => { console.error("fetch clients:", err); setLoading(false); });
  }, [selectedOpers, showObrot]);

  // ── Auto-refresh missing coordinates in the background ───
  useEffect(() => {
    if (clients.length === 0 || geocodingTimeout) return;
    const hasMissing = clients.some(c => {
      const lat = overrides[c.FIR_KOD]?.lat ?? c.GPS_SZER;
      const lng = overrides[c.FIR_KOD]?.lng ?? c.GPS_DLUG;
      return (!lat && !lng) || (lat === 0 && lng === 0);
    });

    if (!hasMissing) return;

    if (!loadStartTime) {
      setLoadStartTime(Date.now());
    }

    const timer = setInterval(() => {
      if (loadStartTime && Date.now() - loadStartTime > 120000) {
        setGeocodingTimeout(true);
        clearInterval(timer);
        return;
      }

      const opersParam = selectedOpers.join(",");
      fetch(`/api/map-clients?selectedOper=${opersParam || "none"}&withObrot=${showObrot}`)
        .then(r => r.json())
        .then((data: Client[]) => {
          setClients(data);
        })
        .catch(() => { });
    }, 5000);

    return () => clearInterval(timer);
  }, [clients, selectedOpers, overrides, loadStartTime, geocodingTimeout, showObrot]);

  // ── init: user profile, superadmin & users ──────────────
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Fetch current user profile (includes oper_kod and superadmin)
        const profileRes = await fetch("/api/user/profile");
        const profileData = await profileRes.json();
        
        let isAdmin = false;
        let userOperKod: string | null = null;
        
        if (profileData.success && profileData.user) {
          isAdmin = profileData.user.superadmin || false;
          userOperKod = profileData.user.oper_kod || null;
          setIsSuperAdmin(isAdmin);
          setCurrentUserOperKod(userOperKod);
        } else {
          // Fallback: check superadmin separately
          const saRes = await fetch("/api/user/superadmin");
          const saData = await saRes.json();
          isAdmin = saData.superadmin || false;
          setIsSuperAdmin(isAdmin);
        }

        // 2. If superadmin, fetch all users for operator selection
        if (isAdmin) {
          const usersRes = await fetch("/api/users");
          const usersData = await usersRes.json();
          if (usersData.success) {
            setUsers(usersData.users.filter((u: any) => u.oper_kod));
          }
        } else if (userOperKod) {
          // Non-superadmin: auto-select their own oper_kod
          setSelectedOpers([userOperKod]);
        }
        
        setInitDataLoaded(true);
      } catch (err) {
        console.error("init error:", err);
        setInitDataLoaded(true);
      }
    };
    
    initData();
  }, []);

  // ── auto-fetch for non-superadmin after init ────────────
  useEffect(() => {
    if (initDataLoaded && !isSuperAdmin && selectedOpers.length > 0) {
      fetchClients();
    }
  }, [initDataLoaded, isSuperAdmin, selectedOpers, fetchClients]);

  // ── map init (once) ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    addCSS(CSS_URL);
    let cancelled = false;

    loadHere().then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const platform = new window.H.service.Platform({ apikey: API_KEY });
      const layers = platform.createDefaultLayers();
      const map = new window.H.Map(containerRef.current, layers.vector.normal.map, {
        zoom: 4,
        center: { lat: 39.8, lng: -98.6 },
        pixelRatio: window.devicePixelRatio || 1,
      });

      mapRef.current = map;
      map.getViewPort().resize();
      setTimeout(() => { if (mapRef.current) mapRef.current.getViewPort().resize(); }, 300);

      new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
      window.H.ui.UI.createDefault(map, layers, "en-US");

      const group = new window.H.map.Group();
      groupRef.current = group;
      map.addObject(group);

      // Marker click → show bubble + select client
      group.addEventListener("tap", (evt: any) => {
        const data: Client = evt.target.getData();
        if (!data) return;
        setSelectedClient(data);
        const ui = window.H.ui.UI.getInstances()[0];
        ui.getBubbles().forEach((b: any) => ui.removeBubble(b));
        ui.addBubble(new window.H.ui.InfoBubble(evt.target.getGeometry(), {
          content: `
            <div style="padding:10px;min-width:150px">
              <div style="color:#2563eb;font-weight:700;font-size:14px">${data.FIR_KOD}</div>
              <div style="font-weight:600;font-size:12px;margin-top:4px;color:#374151">${data.NAZ_SKR}</div>
              <div style="font-size:10px;color:#6b7280;margin-top:2px">${data.MIASTO || ""}, ${data.ADRES || ""}</div>
              ${data.is_overridden ? `<div style="font-size:9px;color:#f97316;margin-top:4px;font-weight:700">(Local change)</div>` : ""}
              ${data.oper_kod ? `<div style="font-size:9px;color:#3b82f6;margin-top:4px;font-weight:700">Operator: ${data.oper_kod}</div>` : ""}
            </div>`
        }));
      }, false);

      // Map tap (empty area) → pick location
      map.addEventListener("tap", async (evt: any) => {
        // Ignore taps on markers / objects
        if (evt.target !== map) return;
        if (!isPickingLocationRef.current || !selectedClientRef.current) return;

        const coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
        const client = selectedClientRef.current;

        let newAddress = client.ADRES;
        let newMiasto = client.MIASTO;

        try {
          const svc = new window.H.service.Platform({ apikey: API_KEY }).getSearchService();
          const result: any = await new Promise((res, rej) =>
            svc.reverseGeocode({ at: `${coord.lat},${coord.lng}` }, res, rej)
          );
          if (result.items?.length > 0) {
            const item = result.items[0];
            newAddress = item.address.street
              ? `${item.address.street} ${item.address.houseNumber || ""}`.trim()
              : item.address.label;
            newMiasto = item.address.city || item.address.district || "";
          }
        } catch { /* keep original address */ }

        const newOverride: Partial<Client> = { lat: coord.lat, lng: coord.lng, ADRES: newAddress, MIASTO: newMiasto };

        setOverrides(prev => ({ ...prev, [client.FIR_KOD]: newOverride }));
        setSelectedClient(prev => prev ? { ...prev, ...newOverride, is_overridden: true } : prev);
        setIsPickingLocation(false);
      });

      // Cursor style effect
      const updateCursor = () => {
        if (containerRef.current)
          containerRef.current.style.cursor = isPickingLocationRef.current ? "crosshair" : "";
      };
      (map as any).__updateCursor = updateCursor;

      const ro = new ResizeObserver(() => {
        requestAnimationFrame(() => { if (mapRef.current) mapRef.current.getViewPort().resize(); });
      });
      ro.observe(containerRef.current!);
      (map as any).__ro = ro;

      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.__ro?.disconnect();
        mapRef.current.dispose();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update cursor when picking mode changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = isPickingLocation ? "crosshair" : "";
    }
  }, [isPickingLocation]);

  // ── draw markers whenever mapClients changes ───
  useEffect(() => {
    if (!mapReady || !mapRef.current || !groupRef.current) return;

    const map = mapRef.current;
    const group = groupRef.current;
    let cancelled = false;

    (async () => {
      setMapLoading(true);
      group.removeAll();

      for (const client of mapClients) {
        if (cancelled) break;

        const lat = client.lat ?? client.GPS_SZER;
        const lng = client.lng ?? client.GPS_DLUG;

        if (lat != null && lng != null && (lat !== 0 || lng !== 0) && !cancelled) {
          const color = getMarkerColor(client.oper_kod, client.is_overridden);
          const safeNaz = (client.NAZ_SKR || "").replace(/"/g, '&quot;').replace(/'/g, '&#39;');
          const operName = client.oper_kod ? (users.find(u => u.oper_kod === client.oper_kod)?.name || client.oper_kod) : "";
          const titleText = `${client.FIR_KOD} - ${safeNaz}${operName ? `\nOperator: ${operName}` : ""}`;

          const domIcon = new window.H.map.DomIcon(`
            <div style="position:relative;width:14px;height:14px;" 
                 onmouseenter="this.querySelector('.marker-tooltip').style.display='block'; this.style.zIndex=1000;" 
                 onmouseleave="this.querySelector('.marker-tooltip').style.display='none'; this.style.zIndex='';">
              <div title="${titleText}" style="
                width:14px;height:14px;background:${color};
                border:2px solid white;border-radius:50%;
                box-shadow:0 0 6px rgba(0,0,0,.5);cursor:pointer;
                ${client.is_overridden ? "outline:2px solid #f97316;outline-offset:1px;" : ""}
              "></div>
              <div class="marker-tooltip" style="
                display:none; position:absolute; bottom:100%; left:50%; transform:translateX(-50%);
                margin-bottom:6px; background:white; padding:4px 8px; border-radius:6px;
                box-shadow:0 4px 12px rgba(0,0,0,0.15); white-space:nowrap; pointer-events:none;
                border: 1px solid #e5e7eb; z-index: 1000;
              ">
                <div style="color:#2563eb; font-size:12px; font-weight:700;">${client.FIR_KOD}</div>
                <div style="font-size:10px; color:#4b5563; font-weight:500;">${safeNaz}</div>
                ${client.obrot ? `<div style="font-size:10px; color:#10b981; font-weight:700; margin-top:2px;">Revenue: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.obrot)}</div>` : ""}
                ${operName ? `<div style="font-size:9px; color:#3b82f6; font-weight:700; margin-top:2px;">Operator: ${operName}</div>` : ""}
              </div>
            </div>`);
          const marker = new window.H.map.DomMarker({ lat, lng }, { icon: domIcon });
          marker.setData(client);
          group.addObject(marker);
        }
      }

      if (!initialZoomDoneRef.current && group.getObjects().length > 0) {
        map.getViewModel().setLookAtData({ bounds: group.getBoundingBox(), animate: true });
        initialZoomDoneRef.current = true;
      }

      if (!cancelled) setMapLoading(false);
    })();

    return () => { cancelled = true; };
  }, [mapReady, mapClients, users, getMarkerColor]); // useMemo ensures stable reference

  // ── navigate to client on list click ────────────────────
  const goToClient = (client: Client) => {
    setSelectedClient(client);
    const lat = client.lat || client.GPS_SZER;
    const lng = client.lng || client.GPS_DLUG;
    if (mapRef.current && lat && lng) {
      mapRef.current.setCenter({ lat, lng });
      mapRef.current.setZoom(15);
    }
  };

  // ── export CSV ───────────────────────────────────────────
  const exportClients = () => {
    const headers = ["fir_kod", "NAZ_SKR", "MIASTO", "ADRES", "GPS_SZER", "GPS_DLUG", "oper_kod", "lokalna_zmiana"];
    const rows = filteredClients.map(c => [
      c.FIR_KOD,
      `"${(c.NAZ_SKR || "").replace(/"/g, '""')}"`,
      `"${(c.MIASTO || "").replace(/"/g, '""')}"`,
      `"${(c.ADRES || "").replace(/"/g, '""')}"`,
      c.lat || c.GPS_SZER || 0,
      c.lng || c.GPS_DLUG || 0,
      c.oper_kod || "",
      c.is_overridden ? "TAK" : "",
    ]);
    const csv = "\uFEFF" + headers.join(";") + "\n" + rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `map_clients_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── render ───────────────────────────────────────────────
  return (
    <div className="flex h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">

      {/* ── Sidebar ── */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 z-10">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-800">Customers</h2>
            <div className="flex gap-3">
              {Object.keys(overrides).length > 0 && (
                <button
                  onClick={() => {
                    setOverrides({});
                    if (selectedClient) {
                      const orig = clients.find(c => c.FIR_KOD === selectedClient.FIR_KOD);
                      if (orig) setSelectedClient(orig);
                    }
                  }}
                  className="text-[10px] text-red-500 font-bold hover:underline"
                >
                  Reset changes ({Object.keys(overrides).length})
                </button>
              )}
              <button onClick={exportClients} className="text-[10px] text-green-600 font-bold hover:underline">
                Export CSV
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Operator filter (superadmin only) */}
        {isSuperAdmin && users.length > 0 && (
          <div className="px-4 py-3 bg-white border-b border-gray-100 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operators:</label>
              <button
                onClick={() => setShowOperDropdown(v => !v)}
                className="text-[10px] text-violet-600 font-bold hover:underline"
              >
                {showOperDropdown ? "Collapse" : "Change selection"}
              </button>
            </div>

            {/* Collapsed: show selected tags */}
            {!showOperDropdown && (
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {selectedOpers.length === 0 ? (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full border border-gray-200">
                    Select operators...
                  </span>
                ) : selectedOpers.map(o => (
                  <span key={o} className="px-2 py-0.5 bg-white text-gray-700 text-[10px] rounded-full border border-gray-200 font-medium flex items-center gap-1 shadow-sm" title={getOperName(o)}>
                    <div className="flex gap-0.5 mr-0.5">
                      {o.split(",").map(code => {
                        const normalized = code.trim().toUpperCase();
                        if (!normalized) return null;
                        return (
                          <span 
                            key={normalized}
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: operColorsMap[normalized] || "#6b7280" }}
                          />
                        );
                      })}
                    </div>
                    {o}: {getOperName(o)}
                  </span>
                ))}
              </div>
            )}

            {/* Expanded: checkbox grid */}
            {showOperDropdown && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOpers([])}
                    className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 border border-red-100"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-100">
                  {users.map(u => (
                    <label key={u.userId} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOpers.includes(u.oper_kod)}
                        onChange={e => {
                          setSelectedOpers(prev =>
                            e.target.checked ? [...prev, u.oper_kod] : prev.filter(o => o !== u.oper_kod)
                          );
                        }}
                        className="rounded border-gray-300 text-violet-600"
                      />
                      <div className="flex flex-col truncate">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            {u.oper_kod.split(",").map(code => {
                              const normalized = code.trim().toUpperCase();
                              if (!normalized) return null;
                              return (
                                <span 
                                  key={normalized}
                                  className="w-2 h-2 rounded-full inline-block" 
                                  style={{ backgroundColor: operColorsMap[normalized] || "#6b7280" }}
                                  title={normalized}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[11px] truncate font-bold text-gray-800">{u.oper_kod}</span>
                        </div>
                        <span className="text-[9px] truncate text-gray-500">{u.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Non-superadmin: show current operator info */}
        {!isSuperAdmin && currentUserOperKod && (
          <div className="px-4 py-3 bg-violet-50/50 border-b border-violet-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Your operator:</span>
              <span className="text-[12px] font-bold text-violet-700">{currentUserOperKod}</span>
            </div>
          </div>
        )}

        {/* Show firms button */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer py-1 select-none">
            <input
              type="checkbox"
              checked={showObrot}
              onChange={e => {
                setShowObrot(e.target.checked);
                if (!e.target.checked) {
                  setMinObrot(""); // clear filter when unchecked
                  setMaxObrot("");
                }
              }}
              className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
            />
            <span className="text-[11px] font-semibold text-gray-700">Show revenue (may take longer to load)</span>
          </label>

          {showObrot && (
            <div className="flex flex-col gap-2 mb-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minimum revenue (USD):</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={minObrot}
                  onChange={e => setMinObrot(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all bg-gray-50/50 hover:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Maximum revenue (USD):</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 200000"
                  value={maxObrot}
                  onChange={e => setMaxObrot(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all bg-gray-50/50 hover:bg-white"
                />
              </div>
            </div>
          )}

          <button
            onClick={fetchClients}
            className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Show companies on map
          </button>
        </div>

        {/* Firm count */}
        {clients.length > 0 && (() => {
          const totalCount = clients.length;
          const onMapCount = clientsWithOverrides.filter(c => {
            const lat = c.lat ?? c.GPS_SZER;
            const lng = c.lng ?? c.GPS_DLUG;
            return lat && lng && lat !== 0 && lng !== 0;
          }).length;
          const isFullyGeocoded = onMapCount === totalCount;

          return (
            <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-medium">
                {search ? `${filteredClients.length} z ${clients.length}` : `${clients.length}`} companies
              </span>
              <div className="flex items-center gap-1.5">
                {!isFullyGeocoded && !geocodingTimeout && (
                  <svg className="animate-spin h-3.5 w-3.5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {geocodingTimeout && (
                  <span className="text-[9px] text-gray-400 font-medium mr-1">(limit 2 min)</span>
                )}
                <span className={`text-[10px] font-bold ${isFullyGeocoded ? "text-violet-500" : "text-red-500"}`}>
                  {onMapCount} on map
                </span>
              </div>
            </div>
          );
        })()}

        {/* Client list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm italic">Loading...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-10 text-center text-gray-300 text-xs">No results</div>
          ) : filteredClients
          .map(client => {
            const hasGeo = (client.lat ?? client.GPS_SZER) !== 0 && (client.lng ?? client.GPS_DLUG) !== 0 && (client.lat ?? client.GPS_SZER) != null && (client.lng ?? client.GPS_DLUG) != null;
            return (
              <div
                key={client.FIR_KOD}
                onClick={() => goToClient(client)}
                className={`p-3 border-b border-gray-50 cursor-pointer transition-colors ${selectedClient?.FIR_KOD === client.FIR_KOD
                  ? "bg-violet-50 border-l-4 border-l-violet-500"
                  : "hover:bg-white"
                  } ${!hasGeo ? "opacity-75" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-violet-600">{client.FIR_KOD}</span>
                  <div className="flex items-center gap-1">
                    {!hasGeo && (
                      <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-medium animate-pulse">Not found</span>
                    )}
                    {client.is_overridden && (
                      <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">edited</span>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-700 truncate">{client.NAZ_SKR}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="text-[10px] text-gray-400 truncate max-w-[70%]">{client.MIASTO}, {client.ADRES}</div>
                  {client.obrot ? (
                    <div className="text-[10px] font-bold text-emerald-600 whitespace-nowrap ml-2">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.obrot)}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div> 

        {/* Selected client details */}
        {selectedClient && (
          <div className="p-4 border-t border-gray-200 bg-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{selectedClient.FIR_KOD}</h3>
                <div className="text-xs text-gray-600">{selectedClient.NAZ_SKR}</div>
              </div>
              <button
                onClick={() => setIsPickingLocation(v => !v)}
                className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${isPickingLocation
                  ? "bg-orange-500 text-white border-orange-600 animate-pulse"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
              >
                {isPickingLocation ? "Click the map..." : "Change location"}
              </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-2">
              <div>{selectedClient.MIASTO}, {selectedClient.ADRES}</div>
              {selectedClient.is_overridden && (
                <div className="flex justify-between items-center mt-2 p-1.5 bg-orange-50 rounded border border-orange-100">
                  <span className="text-orange-600 font-bold">⚠ Location changed locally</span>
                  <button
                    onClick={() => {
                      setOverrides(prev => {
                        const next = { ...prev };
                        delete next[selectedClient.FIR_KOD]; 
                        return next;
                      });
                      const orig = clients.find(c => c.FIR_KOD === selectedClient.FIR_KOD);
                      if (orig) setSelectedClient(orig);
                    }}
                    className="px-2 py-1 bg-white shadow-sm border border-orange-200 text-orange-600 rounded hover:bg-orange-100 font-bold transition-colors"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </div>   
        )}
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative bg-gray-100">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading Overlay */}
        {(loading || mapLoading || !mapReady) && (
          <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-200">
              <svg className="w-10 h-10 text-violet-600 animate-spin mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-gray-800 font-bold text-sm">
                {!mapReady ? "Initializing map..." : "Loading locations..."}
              </div>
              <div className="text-gray-500 text-[10px] mt-1 font-medium">Please wait, this may take a moment</div>
            </div>
          </div>
        )}

        {isPickingLocation && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none">
            Click the map to change location
          </div>
        )}
      </div>
    </div>
  );
}
