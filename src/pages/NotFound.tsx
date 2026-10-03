import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import logoAsset from "@/assets/studyflow-vintage-logo.png.asset.json";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center editorial-frame bg-card p-8 max-w-md w-full">
        <img src={logoAsset.url} alt="StudyFlow" className="h-28 mx-auto object-contain max-w-full mb-4" />
        <h1 className="mb-2 font-display text-4xl">404</h1>
        <p className="mb-4 text-muted-foreground">Esta página se perdeu entre as estantes.</p>
        <Link to="/" className="text-primary underline">Voltar ao início</Link>
      </div>
    </div>
  );
};

export default NotFound;
