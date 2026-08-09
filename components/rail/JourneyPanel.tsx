"use client";

import type { CSSProperties } from "react";

import { BranchIcon } from "@/components/icons/BranchIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { DropletIcon } from "@/components/icons/DropletIcon";
import { QuillIcon } from "@/components/icons/QuillIcon";
import { SealIcon } from "@/components/icons/SealIcon";
import { ShieldIcon } from "@/components/icons/ShieldIcon";
import { Panel } from "@/components/ui/Panel";
import type { JourneyStep } from "@/types/domain";

interface JourneyPanelProps {
  steps: JourneyStep[];
}

const STEP_ICON: Record<JourneyStep["key"], React.ComponentType<{ size?: number }>> = {
  flood: DropletIcon,
  fidelity: ShieldIcon,
  momentum: BranchIcon,
  chosen: QuillIcon,
  finished: SealIcon,
};

/**
 * "Your Creative Journey": a five-node vertical timeline.
 *
 * Completion is never colour-only — every completed node carries a filled
 * check badge as well as the brightened chip and spine segment.
 */
export function JourneyPanel({ steps }: JourneyPanelProps) {
  return (
    <Panel label="Your Creative Journey" labelId="journey-heading">
      <ol className="journey" aria-labelledby="journey-heading">
        {steps.map((step, index) => {
          const Icon = STEP_ICON[step.key];
          const isLast = index === steps.length - 1;
          const style = { "--stagger-index": index } as CSSProperties;

          return (
            <li
              key={step.key}
              className={`journey__node ${
                step.key === "fidelity" ? "journey__node--fidelity-highlight" : ""
              }`}
              style={style}
            >
              {!isLast ? (
                <span
                  className={
                    step.complete
                      ? "journey__spine journey__spine--lit"
                      : "journey__spine"
                  }
                  aria-hidden="true"
                />
              ) : null}

              <span
                className={
                  step.complete ? "journey__chip journey__chip--done" : "journey__chip"
                }
              >
                <Icon size={12} />
                {step.complete ? (
                  <span className="journey__check" aria-hidden="true">
                    <CheckIcon size={7} strokeWidth={3.2} />
                  </span>
                ) : null}
              </span>

              <span>
                <span className="journey__title">
                  {step.title}
                  {step.complete ? (
                    <span className="sr-only"> — complete</span>
                  ) : null}
                </span>
                <span className="journey__subtitle">{step.subtitle}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
