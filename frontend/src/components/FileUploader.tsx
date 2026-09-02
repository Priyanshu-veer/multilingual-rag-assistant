import {
  Upload,
  FileText,
  X,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

interface FileUploaderProps {

  disabled: boolean;

  onUpload: (
    file: File
  ) => void;

}

export default function FileUploader({
  disabled,
  onUpload,
}: FileUploaderProps) {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    dragging,
    setDragging,
  ] = useState(false);


  function selectFile(
    file: File
  ) {

    if (
      file.type !==
      "application/pdf"
    ) {
      return;
    }

    setSelectedFile(file);
  }


  function handleInput(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (file) {
      selectFile(file);
    }
  }


  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {

    event.preventDefault();

    setDragging(false);

    if (disabled) {
      return;
    }

    const file =
      event.dataTransfer.files[0];

    if (file) {
      selectFile(file);
    }
  }


  function removeFile() {

    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }


  function upload() {

    if (!selectedFile) {
      return;
    }

    onUpload(selectedFile);
  }


  return (
    <div className="uploader">

      <div
        className={`drop-zone ${
          dragging
            ? "drop-zone-active"
            : ""
        } ${
          disabled
            ? "drop-zone-disabled"
            : ""
        }`}

        onDragOver={(event) => {

          event.preventDefault();

          if (!disabled) {
            setDragging(true);
          }

        }}

        onDragLeave={() =>
          setDragging(false)
        }

        onDrop={handleDrop}

        onClick={() => {

          if (!disabled) {
            inputRef.current?.click();
          }

        }}
      >

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          disabled={disabled}
          onChange={handleInput}
        />

        <div className="upload-icon">
          <Upload size={22} />
        </div>

        <div className="drop-title">
          Drop your PDF here
        </div>

        <div className="drop-subtitle">
          or click to browse
        </div>

        <div className="drop-format">
          PDF files only
        </div>

      </div>


      {selectedFile && (

        <div className="selected-file">

          <div className="selected-file-icon">
            <FileText size={18} />
          </div>

          <div className="selected-file-info">

            <div className="selected-file-name">
              {selectedFile.name}
            </div>

            <div className="selected-file-size">
              {(
                selectedFile.size /
                1024 /
                1024
              ).toFixed(2)} MB
            </div>

          </div>

          <button
            className="remove-file"
            onClick={(
              event
            ) => {

              event.stopPropagation();

              removeFile();

            }}
            disabled={disabled}
          >
            <X size={16} />
          </button>

        </div>

      )}


      <button
        className="upload-button"
        disabled={
          disabled ||
          !selectedFile
        }
        onClick={(
          event
        ) => {

          event.stopPropagation();

          upload();

        }}
      >

        <Upload size={17} />

        {disabled
          ? "Processing..."
          : "Upload PDF"}

      </button>

    </div>
  );
}
