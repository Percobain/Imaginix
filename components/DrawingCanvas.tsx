import React, { useEffect, useState } from "react";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";

import { type Excalidraw } from "@excalidraw/excalidraw";

import {
  serializeAsJSON,
} from "@excalidraw/excalidraw";

export type CanvasChangeEvent = {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  imageData: string;
};

export type DrawingCanvasProps = {
  onCanvasChange: (event: CanvasChangeEvent) => void;
};

const isBrowser = typeof window !== "undefined";

export async function blobToBase64(blob: Blob): Promise<string> {
  return await new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = resolve;
    reader.readAsDataURL(blob);
  }).then((e: any) => e.target.result);
}

const DrawingCanvas = ({ onCanvasChange }: DrawingCanvasProps) => {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<
    typeof Excalidraw | null
  >(null);
  const [syncData, setSyncData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 450, height: 450 });

  useEffect(() => {
    if (isBrowser) {
      import("@excalidraw/excalidraw").then((comp) =>
        setExcalidrawComponent(comp.Excalidraw)
      );

      const updateDimensions = () => {
        const container = document.querySelector('.canvas-container');
        if (container) {
          const width = container.clientWidth;
          // Maintain aspect ratio
          const height = Math.min(width, window.innerHeight - 100);
          setDimensions({ width, height });
        }
        if (excalidrawAPI) {
          excalidrawAPI.refresh();
        }
      };

      // Initial dimension setup
      updateDimensions();

      // Update dimensions on resize
      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }
  }, [excalidrawAPI]);

  async function handleCanvasChanges(
    elements: readonly ExcalidrawElement[],
    appState: AppState
  ) {
    if (!excalidrawAPI || !elements || !elements.length) return;

    const { exportToBlob } = await import("@excalidraw/excalidraw");

    const newSyncData = serializeAsJSON(
      elements,
      appState,
      excalidrawAPI.getFiles(),
      "local"
    );

    if (newSyncData !== syncData) {
      setSyncData(newSyncData);

      const blob = await exportToBlob({
        elements,
        exportPadding: 10,
        appState,
        quality: 1,
        mimeType: "image/webp",
        files: excalidrawAPI.getFiles(),
        getDimensions: () => dimensions,
      });

      const imageData = await blobToBase64(blob);

      return onCanvasChange({
        elements,
        appState,
        imageData,
      });
    }
  }

  return (
    <div className="canvas-container w-full h-full min-h-[300px] relative">
      {ExcalidrawComponent && (
        <div style={{ width: dimensions.width, height: dimensions.height }}>
          <ExcalidrawComponent
            autoFocus={true}
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            onChange={handleCanvasChanges}
          />
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;