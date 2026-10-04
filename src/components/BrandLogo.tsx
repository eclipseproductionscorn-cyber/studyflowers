import { useState, type ImgHTMLAttributes } from "react";
import logoAsset from "@/assets/studyflow-vintage-logo.png.asset.json";
import fallbackLogo from "@/assets/studyflow-logo-fallback.webp";

/** StudyFlow logo: CDN original first, bundled copy if it fails, text as last resort. */
export function BrandLogo({ alt = "StudyFlow", className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [stage, setStage] = useState(0);
  if (stage > 1) return <span className={`font-display text-2xl text-primary inline-flex items-center ${className ?? ""}`} role="img" aria-label={alt}>StudyFlow</span>;
  return <img {...rest} src={stage === 0 ? logoAsset.url : fallbackLogo} alt={alt} className={className} onError={() => setStage(s => s + 1)} />;
}
