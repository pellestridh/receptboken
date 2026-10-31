"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { mmss } from "@/lib/format";
import { lsGet, lsSet } from "@/lib/api";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export default function Providers({ children }) {
  const [timers, setTimers] = useState({}); // key -> {end, label, ring}
  const [toasts, setToasts] = useState([]);
  const [, setTick] = useState(0);
  const audio = useRef(null);

  useEffect(() => { setTimers(lsGet("rb-timers", {})); }, []);
  useEffect(() => { lsSet("rb-timers", timers); }, [timers]);

  const beep = useCallback(() => {
    try { navigator.vibrate?.([300, 150, 300]); } catch {}
    const a = audio.current;
    if (!a) return;
    try {
      [0, 0.45, 0.9].forEach((d) => {
        const o = a.createOscillator(), g = a.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, a.currentTime + d);
        g.gain.exponentialRampToValueAtTime(0.35, a.currentTime + d + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d + 0.3);
        o.connect(g); g.connect(a.destination);
        o.start(a.currentTime + d); o.stop(a.currentTime + d + 0.32);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!Object.keys(timers).length) return;
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setTimers((cur) => {
        let changed = false;
        const next = { ...cur };
        for (const k of Object.keys(next)) {
          if (!next[k].ring && Date.now() >= next[k].end) { next[k] = { ...next[k], ring: true }; changed = true; beep(); }
        }
        return changed ? next : cur;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timers, beep]);

  const toggleTimer = useCallback((key, seconds, label) => {
    if (!audio.current) {
      try { audio.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    setTimers((cur) => {
      const next = { ...cur };
      if (next[key]) delete next[key];
      else next[key] = { end: Date.now() + seconds * 1000, label, ring: false };
      return next;
    });
  }, []);

  const stopTimer = useCallback((key) => setTimers((cur) => { const n = { ...cur }; delete n[key]; return n; }), []);

  const toast = useCallback((msg) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const timerText = (key, seconds) => {
    const t = timers[key];
    if (!t) return "⏱ " + mmss(seconds);
    const left = (t.end - Date.now()) / 1000;
    return left <= 0 ? "Klar!" : "⏱ " + mmss(left);
  };

  return (
    <Ctx.Provider value={{ timers, toggleTimer, stopTimer, timerText, toast }}>
      {children}
      <div className="dock" aria-live="polite">
        {Object.entries(timers).map(([k, t]) => (
          <button key={k} type="button" className={"pill" + (t.ring ? " ring" : "")} onClick={() => stopTimer(k)}>
            {t.label} · {t.ring ? "klar, tryck för att stänga" : mmss((t.end - Date.now()) / 1000)}
          </button>
        ))}
        {toasts.map((t) => <div key={t.id} className="toast">{t.msg}</div>)}
      </div>
    </Ctx.Provider>
  );
}
