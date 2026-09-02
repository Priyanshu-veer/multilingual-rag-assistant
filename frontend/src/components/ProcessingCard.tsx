import {
  Check,
  Loader2,
  Upload,
  FileText,
  Scissors,
  Brain,
  Database,
  CheckCircle2,
} from "lucide-react";

import type {
  DocumentState,
} from "../types";

interface ProcessingCardProps {

  state: DocumentState;

}

const stages = [

  {
    key: "uploading",
    label: "Uploading PDF",
    icon: Upload,
  },

  {
    key: "loading",
    label: "Loading document",
    icon: FileText,
  },

  {
    key: "chunking",
    label: "Splitting into chunks",
    icon: Scissors,
  },

  {
    key: "embedding",
    label: "Generating embeddings",
    icon: Brain,
  },

  {
    key: "storing",
    label: "Storing vectors",
    icon: Database,
  },

];


const stageOrder: Record<string, number> = {

  uploading: 0,

  loading: 1,

  chunking: 2,

  embedding: 3,

  storing: 4,

  completed: 5,

};


export default function ProcessingCard({
  state,
}: ProcessingCardProps) {

  if (
    state.status !==
    "processing"
  ) {
    return null;
  }


  const currentIndex =
    stageOrder[state.stage] ?? 0;


  return (
    <div className="processing-card">

      <div className="processing-header">

        <div>

          <div className="processing-title">
            Document processing
          </div>

          <div className="processing-subtitle">
            Preparing your document for AI
          </div>

        </div>

        <div className="processing-pulse">
          <span />
          Processing
        </div>

      </div>


      <div className="processing-steps">

        {stages.map(
          (
            stage,
            index
          ) => {

            const Icon =
              stage.icon;

            const completed =
              index < currentIndex;

            const active =
              index === currentIndex;


            return (
              <div
                className="processing-step"
                key={stage.key}
              >

                <div className="step-track">

                  <div
                    className={`step-circle ${
                      completed
                        ? "step-circle-complete"
                        : active
                        ? "step-circle-active"
                        : "step-circle-pending"
                    }`}
                  >

                    {completed ? (

                      <Check size={14} />

                    ) : active ? (

                      <Loader2
                        size={14}
                        className="spin"
                      />

                    ) : (

                      <Icon size={13} />

                    )}

                  </div>

                  {index <
                    stages.length - 1 && (
                    <div
                      className={`step-connector ${
                        index <
                        currentIndex
                          ? "step-connector-complete"
                          : ""
                      }`}
                    />
                  )}

                </div>


                <div className="step-content">

                  <div
                    className={`step-label ${
                      completed
                        ? "step-label-complete"
                        : active
                        ? "step-label-active"
                        : "step-label-pending"
                    }`}
                  >
                    {stage.label}
                  </div>

                  {active && (

                    <div className="step-active-message">
                      {state.message}
                    </div>

                  )}

                </div>

              </div>
            );

          }
        )}

      </div>

    </div>
  );
}
