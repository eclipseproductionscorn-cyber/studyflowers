import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/studyflow-vintage-logo.png.asset.json";

export function OpeningSequence() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(() => {
    if (sessionStorage.getItem("studyflow-opening-seen")) return false;
    sessionStorage.setItem("studyflow-opening-seen", "true");
    return true;
  });
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    const first = window.setTimeout(() => setPage(1), 1500);
    const last = window.setTimeout(() => setVisible(false), 3900);
    return () => { window.clearTimeout(first); window.clearTimeout(last); };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setVisible(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  // Show before the first screen only; never interrupt a deep link to a study session.
  if (pathname !== "/" && pathname !== "/dashboard") return null;

  return <AnimatePresence>
    {visible && <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .55 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-5 overflow-hidden"
      role="dialog" aria-label="Abertura do StudyFlow"
    >
      <div className="absolute inset-3 md:inset-6 border border-primary/60 pointer-events-none" />
      <div className="absolute inset-5 md:inset-8 border border-primary/25 pointer-events-none" />
      <span className="absolute top-10 left-10 text-primary/60 text-3xl" aria-hidden="true">✦</span>
      <span className="absolute bottom-10 right-10 text-primary/60 text-3xl" aria-hidden="true">✦</span>
      <div className="relative text-center max-w-lg w-full">
        <AnimatePresence mode="wait">
          {page === 0 ? <motion.div key="cover" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: .7 }}>
            <img src={logoAsset.url} alt="StudyFlow" className="w-56 sm:w-72 mx-auto drop-shadow-md" />
          </motion.div> : <motion.div key="invitation" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .65 }}>
            <div className="text-5xl mb-6" aria-hidden="true">✦</div>
            <p className="text-xs uppercase text-muted-foreground mb-4">Uma nova página começa</p>
            <h2 className="text-4xl sm:text-5xl font-display text-foreground leading-tight">Todo conhecimento é uma descoberta.</h2>
            <div className="border-t border-b border-border py-3 mt-8 text-sm text-muted-foreground">Aprender. Evoluir. Conquistar.</div>
          </motion.div>}
        </AnimatePresence>
      </div>
      <Button variant="ghost" className="absolute bottom-10 right-10 text-muted-foreground" onClick={() => setVisible(false)}>Pular introdução →</Button>
    </motion.div>}
  </AnimatePresence>;
}