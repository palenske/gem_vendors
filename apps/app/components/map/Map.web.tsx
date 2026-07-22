import { useState, useEffect } from "react";
import type { MapProps } from "./MapContent.web";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Componente de mapa para web usando react-leaflet.
 *
 * Usa lazy loading para evitar erro "window is not defined" no SSR.
 */
export function Map(props: MapProps) {
  return (
    <ErrorBoundary>
      <MapContentInner {...props} />
    </ErrorBoundary>
  );
}

function MapContentInner(props: MapProps) {
  const [MapContent, setMapContent] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Lazy loading dos componentes do react-leaflet e Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;

    import("./MapContent.web").then((module) => {
      setMapContent(() => module.MapContent);
      setIsLoaded(true);
    });
  }, []);

  if (!props.origin) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e5e7eb",
        }}
      >
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗺️</div>
          <div>O mapa aparecerá aqui após a busca</div>
        </div>
      </div>
    );
  }

  if (!isLoaded || !MapContent) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e5e7eb",
        }}
      >
        <div style={{ color: "#6b7280" }}>Carregando mapa...</div>
      </div>
    );
  }

  return <MapContent {...props} />;
}

export default Map;
