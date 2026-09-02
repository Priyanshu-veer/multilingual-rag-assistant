import {
  useEffect,
  useState,
} from "react";

import Sidebar from "./components/Sidebar";

import Chat from "./components/Chat";

import Toast, {
  type ToastType,
} from "./components/Toast";

import {
  getDocumentStatus,
  uploadDocument,
} from "./api";

import type {
  DocumentState,
} from "./types";


interface ToastState {

  type:
    ToastType;

  message:
    string;

}


const initialDocumentState:
  DocumentState = {

  status: "idle",

  stage: "",

  message: "",

  ready: false,

};


export default function App() {

  const [
    documentState,
    setDocumentState,
  ] = useState<DocumentState>(
    initialDocumentState
  );


  const [
    toast,
    setToast,
  ] = useState<
    ToastState | null
  >(null);

  // TOAST
  function showToast(
    type: ToastType,
    message: string
  ) {

    setToast({
      type,
      message,
    });


    window.setTimeout(() => {

      setToast(null);

    }, 3000);

  }

  // INITIAL STATUS
  useEffect(() => {

    getDocumentStatus()
      .then(state => {

        if (state) {

          setDocumentState(
            state
          );

        }

      });

  }, []);


  // DOCUMENT STATUS POLLING
  useEffect(() => {

    if (
      documentState.status !==
      "processing"
    ) {
      return;
    }


    const interval =
      window.setInterval(
        async () => {

          const state =
            await getDocumentStatus();


          if (!state) {
            return;
          }


          setDocumentState(
            state
          );

          // COMPLETED

          if (
            state.status ===
            "completed"
          ) {

            showToast(
              "success",
              "Document uploaded successfully!"
            );

          }


          // DUPLICATE

          if (
            state.status ===
            "duplicate"
          ) {

            showToast(
              "warning",
              "This document is already available."
            );

          }

          // ERROR

          if (
            state.status ===
            "error"
          ) {

            showToast(
              "error",
              state.message ||
                "Document processing failed."
            );

          }

        },

        1000

      );


    return () => {

      window.clearInterval(
        interval
      );

    };

  }, [
    documentState.status,
  ]);

  // UPLOAD

  async function handleUpload(
    file: File
  ) {

    try {

      const response =
        await uploadDocument(
          file
        );

      // STARTED
      if (
        response.status ===
        200
      ) {

        setDocumentState({

          status: "processing",

          stage: "uploading",

          message:
            "Uploading PDF...",

          ready: false,

          filename:
            file.name,

        });

        return;

      }

      // DUPLICATE / PROCESSING
      if (
        response.status ===
        409
      ) {

        showToast(
          "warning",
          "Another document is currently being processed."
        );

        return;

      }

      // ERROR

      let detail =
        "Upload failed.";


      try {

        const data =
          await response.json();

        detail =
          data.detail ||
          detail;

      } catch {

        // Ignore JSON parsing error

      }


      showToast(
        "error",
        detail
      );


    } catch (error) {

      console.error(
        error
      );


      showToast(
        "error",
        "Could not connect to FastAPI."
      );

    }

  }


  return (
    <div className="app">

      <Sidebar
        documentState={
          documentState
        }
        onUpload={
          handleUpload
        }
      />


      <Chat
        documentState={
          documentState
        }
      />


      {toast && (

        <Toast
          type={
            toast.type
          }

          message={
            toast.message
          }

          onClose={() =>
            setToast(null)
          }
        />

      )}

    </div>
  );
}
