"use client";

import { useState } from "react";
import Image from "next/image";
import * as fal from "@fal-ai/serverless-client";
import dynamic from "next/dynamic";

const DrawingCanvas = dynamic(
  () => import("~@/DrawingCanvas").then((mod) => mod.default),
  { ssr: false }
);

fal.config({
  proxyUrl: "/api/fal/proxy",
});

const seed = Math.floor(Math.random() * 100000);
const baseArgs = {
  sync_mode: true,
  strength: 0.99,
  seed,
};

export default function Home() {
  const [input, setInput] = useState("Anthropomorphic cat dressed as a pilot");
  const [image, setImage] = useState(null);
  const [canvasImageData, setCanvasImageData] = useState("");
  const [downloadEnabled, setDownloadEnabled] = useState(false);

  const { send } = fal.realtime.connect("110602490-sdxl-turbo-realtime", {
    connectionKey: "110602490-lora-realtime",
    onResult: (result: any) => {
      if (result.error) return;
      if (result.images && result.images[0]) {
        setImage(result.images[0].url);
        setDownloadEnabled(true);
      }
    },
    onError: (error: any) => {
      console.error(error);
    },
  });

  const handleImageDownload = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'fal_generated_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-2 p-2 title-gradient">
            Imaginix
          </h1>
          <p className="text-gray-400 text-xl">
            Transform your sketches into AI-powered masterpieces
          </p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg glass-morphism focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
            value={input}
            placeholder="Enter your prompt here..."
            onChange={async (e) => {
              const { value } = e.target;
              setInput(value);
              send({
                ...baseArgs,
                prompt: value,
                image_url: canvasImageData,
              });
            }}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          <div className="w-full lg:w-1/2 glass-morphism rounded-xl p-4">
            <DrawingCanvas
              onCanvasChange={(canvasEvent) => {
                const { imageData } = canvasEvent;
                setCanvasImageData(imageData);
                send({
                  ...baseArgs,
                  prompt: input,
                  image_url: imageData,
                });
              }}
            />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center">
            {image && (
              <div className="space-y-4 w-full">
                <div className="relative rounded-xl overflow-hidden glass-morphism">
                  <Image
                    src={image}
                    alt="Generated Fal Image"
                    width={550}
                    height={550}
                    className="object-cover"
                  />
                </div>
                {downloadEnabled && (
                  <button
                    onClick={handleImageDownload}
                    className="w-full px-6 py-3 glass-morphism rounded-lg font-medium hover:bg-zinc-800/50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Image
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}