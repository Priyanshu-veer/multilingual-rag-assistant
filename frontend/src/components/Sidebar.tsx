import {
  FileText,
} from "lucide-react";

import FileUploader from "./FileUploader";

import ProcessingCard from "./ProcessingCard";

import type {
  DocumentState,
} from "../types";

interface SidebarProps {

  documentState:
    DocumentState;

  onUpload:
    (file: File) => void;

}


export default function Sidebar({
  documentState,
  onUpload,
}: SidebarProps) {

  const processing =
    documentState.status ===
    "processing";


  return (
    <aside className="sidebar">

      <div className="sidebar-header">

        <div className="sidebar-logo">
          <FileText size={20} />
        </div>

        <div>

          <div className="sidebar-title">
            Documents
          </div>

          <div className="sidebar-subtitle">
            Knowledge base
          </div>

        </div>

      </div>


      <div className="sidebar-section">

        <div className="section-label">
          Add document
        </div>

        <FileUploader
          disabled={processing}
          onUpload={onUpload}
        />

      </div>


      {processing && (

        <ProcessingCard
          state={documentState}
        />

      )}

    </aside>
  );
}
