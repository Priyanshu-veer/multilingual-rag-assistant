# Document(PDF) State 
import threading
class DocumentState:

    def __init__(self):
        self._lock = threading.Lock()

        self.status = "idle"
        self.stage = ""
        self.message = ""
        self.ready = False
        self.filename = ""

    # Start
    def start(self, filename=""):

        with self._lock:
            self.status = "processing"
            self.stage = "uploading"
            self.message = "📤 Uploading PDF..."
            self.ready = False
            self.filename = filename

    # UPDATE
    def update(self, stage, message):

        with self._lock:
            self.status = "processing"
            self.stage = stage
            self.message = message
            self.ready = False

    # COMPLETE
    def complete(self):

        with self._lock:
            self.status = "completed"
            self.stage = "completed"
            self.message = "✅ File processed successfully."
            self.ready = True

    # DUPLICATE
    def duplicate(self, filename=""):

        with self._lock:
            self.status = "duplicate"
            self.stage = "duplicate"
            self.message = "⚠️ File already available."
            self.ready = True

            if filename:
                self.filename = filename

    # ERROR
    def error(self, message):

        with self._lock:
            self.status = "error"
            self.stage = "error"
            self.message = message
            self.ready = False

    # IS PROCESSING
    def is_processing(self):

        with self._lock:
            return self.status == "processing"

    # GET STATE
    def get_state(self):

        with self._lock:
            return {
                "status": self.status,
                "stage": self.stage,
                "message": self.message,
                "ready": self.ready,
                "filename": self.filename,
            }


# GLOBAL INSTANCE
document_state = DocumentState()
