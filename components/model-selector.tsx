"use client";

import { memo, useCallback, useState } from "react";
import { CheckIcon, ChevronDown, Lock } from "lucide-react";
import { useModel } from "@/context/model-context";
import { ModelId } from "@/app/api/chat/model";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const models = [
  {
    chef: "Google",
    chefSlug: "google",
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    providers: ["google"],
    isProOnly: false,
  },
  {
    chef: "Google",
    chefSlug: "google",
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    providers: ["google"],
    isProOnly: false,
  },
  {
    chef: "Google",
    chefSlug: "google",
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Pro)",
    providers: ["google"],
    isProOnly: true,
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    providers: ["openai"],
    isProOnly: false,
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o",
    name: "GPT-4o (Pro)",
    providers: ["openai"],
    isProOnly: true,
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet (Pro)",
    providers: ["anthropic"],
    isProOnly: true,
  },
];

interface ModelItemProps {
  model: (typeof models)[0];
  selectedModel: string;
  onSelect: (id: string) => void;
  isLocked: boolean;
}

const ModelItem = memo(
  ({ model, selectedModel, onSelect, isLocked }: ModelItemProps) => {
    const handleSelect = useCallback(() => {
      // Prevent selection if the model is locked
      if (isLocked) return;
      onSelect(model.id);
    }, [onSelect, model.id, isLocked]);

    return (
      <ModelSelectorItem
        key={model.id}
        onSelect={handleSelect}
        value={model.id}
        disabled={isLocked}
        className={cn(
          "flex items-center gap-2",
          isLocked && "opacity-50 cursor-not-allowed text-muted-foreground",
        )}
      >
        <ModelSelectorLogo provider={model.chefSlug} />
        <ModelSelectorName>{model.name}</ModelSelectorName>
        <ModelSelectorLogoGroup className={cn(isLocked && "opacity-50")}>
          {model.providers.map((provider) => (
            <ModelSelectorLogo key={provider} provider={provider} />
          ))}
        </ModelSelectorLogoGroup>

        {/* Status Indicators */}
        <div className="ml-auto flex items-center justify-end w-5">
          {isLocked ? (
            <Lock className="size-4 text-muted-foreground" />
          ) : selectedModel === model.id ? (
            <CheckIcon className="size-4" />
          ) : null}
        </div>
      </ModelSelectorItem>
    );
  },
);

ModelItem.displayName = "ModelItem";

import { usePathname } from "next/navigation";

export const ModelSelectorComponent = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useModel();
  const userHaveProPlan = false;

  const handleModelSelect = useCallback(
    (id: string) => {
      setSelectedModel(id as ModelId);
      setOpen(false);
    },
    [setSelectedModel]
  );

  if (pathname === "/upgrade") {
    return null;
  }

  const selectedModelData = models.find((model) => model.id === selectedModel);

  // Get unique chefs in order of appearance
  const chefs = [...new Set(models.map((model) => model.chef))];

  return (
    <div className="flex size-full items-center justify-center">
      <ModelSelector onOpenChange={setOpen} open={open}>
        <ModelSelectorTrigger asChild>
          <Button className="w-54 justify-between bg-[#2f2f2f] text-white border-[#424242] hover:bg-[#3f3f3f]" variant="outline">
            <div className="flex items-center gap-2 min-w-0">
              {selectedModelData?.chefSlug && (
                <ModelSelectorLogo provider={selectedModelData.chefSlug} />
              )}
              {selectedModelData?.name && (
                <ModelSelectorName className="truncate">{selectedModelData.name}</ModelSelectorName>
              )}
            </div>
            <ChevronDown className="size-4 shrink-0 opacity-60 ml-2" />
          </Button>
        </ModelSelectorTrigger>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Search models..." />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            {chefs.map((chef) => (
              <ModelSelectorGroup heading={chef} key={chef}>
                {models
                  .filter((model) => model.chef === chef)
                  .map((model) => {
                    // Determine if the current model should be locked
                    // If the query is pending, data is undefined, so Pro models default to locked
                    const isLocked = model.isProOnly && !userHaveProPlan;

                    return (
                      <ModelItem
                        key={model.id}
                        model={model}
                        onSelect={handleModelSelect}
                        selectedModel={selectedModel}
                        isLocked={isLocked}
                      />
                    );
                  })}
              </ModelSelectorGroup>
            ))}
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    </div>
  );
};
