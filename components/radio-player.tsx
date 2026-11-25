"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { radioStations } from "@/lib/radio";

export function RadioPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stations = radioStations();
  const [stationIdx, setStationIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  if (!pathname || pathname.startsWith("/admin")) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    audio.src = stations[stationIdx].url;
    audio.play().catch(() => setPlaying(false));
  };

  const changeStation = (idx: number) => {
    setStationIdx(idx);
    setOpen(false);
    const audio = audioRef.current;
    if (audio && playing) {
      audio.src = stations[idx].url;
      audio.play().catch(() => setPlaying(false));
    }
  };

  const current = stations[stationIdx];

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label={playing ? "Pausar rádio" : "Tocar rádio"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-lg text-neutral-950 shadow-md transition hover:scale-105 hover:bg-amber-400"
          >
            {playing ? "⏸" : "▶"}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Ao vivo
              </span>
              {playing && (
                <span className="flex h-3 items-end gap-[2px]">
                  <i className="eq-bar h-1.5 w-[3px] rounded bg-amber-400" />
                  <i className="eq-bar h-2.5 w-[3px] rounded bg-amber-300" />
                  <i className="eq-bar h-1 w-[3px] rounded bg-amber-500" />
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="max-w-full truncate text-sm font-semibold text-white"
            >
              {current.name} {open ? "▴" : "▾"}
            </button>
          </div>

          <button
            onClick={() => setMuted(!muted)}
            aria-label="Mutar"
            className="text-sm text-neutral-400 transition hover:text-amber-400"
          >
            {muted || volume === 0 ? "🔇" : volume > 0.5 ? "🔊" : "🔈"}
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            aria-label="Minimizar rádio"
            className="text-xs text-neutral-500 transition hover:text-white"
          >
            {expanded ? "▾" : "▴"}
          </button>
        </div>

        {open && (
          <div className="mt-2 space-y-1 border-t border-neutral-800 pt-2">
            {stations.map((station, idx) => (
              <button
                key={station.url}
                onClick={() => changeStation(idx)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  idx === stationIdx
                    ? "bg-amber-500/10 font-semibold text-amber-400"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                📻 {station.name}
                {idx === stationIdx && <span className="ml-auto text-xs">▶</span>}
              </button>
            ))}
          </div>
        )}

        {expanded && (
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (Number(e.target.value) > 0) setMuted(false);
            }}
            aria-label="Volume"
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-700 accent-amber-500"
          />
        )}
      </div>
    </div>
  );
}
