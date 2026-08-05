"use client";

import React, { createContext, useContext, useState } from "react";
import { ModelId } from "@/app/api/chat/model";

interface ModelContextType {
  selectedModel: ModelId;
  setSelectedModel: (model: ModelId) => void;
}

const ModelContext = createContext<ModelContextType>({
  selectedModel: "gemini-2.5-flash",
  setSelectedModel: () => {},
});

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedModel, setSelectedModel] =
    useState<ModelId>("gemini-2.5-flash");

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = () => useContext(ModelContext);
