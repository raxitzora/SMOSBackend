let mediaRecorder = null;

let audioChunks = [];

let mediaStream = null;

/* ===========================================
   Check Browser Support
=========================================== */

export const isVoiceSupported = () => {
  return (
    navigator.mediaDevices &&
    window.MediaRecorder
  );
};

/* ===========================================
   Request Microphone Permission
=========================================== */

export const requestMicrophone = async () => {
  if (!isVoiceSupported()) {
    throw new Error(
      "Voice recording is not supported."
    );
  }

  mediaStream =
    await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

  return mediaStream;
};

/* ===========================================
   Start Recording
=========================================== */

export const startRecording =
  async () => {
    audioChunks = [];

    if (!mediaStream) {
      await requestMicrophone();
    }

    mediaRecorder =
      new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (
      event
    ) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();

    return true;
  };

/* ===========================================
   Stop Recording
=========================================== */

export const stopRecording =
  () => {
    return new Promise((resolve) => {
      if (!mediaRecorder) {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(
          audioChunks,
          {
            type: "audio/webm",
          }
        );

        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  };

/* ===========================================
   Cancel Recording
=========================================== */

export const cancelRecording =
  () => {
    if (
      mediaRecorder &&
      mediaRecorder.state === "recording"
    ) {
      mediaRecorder.stop();
    }

    audioChunks = [];
  };

/* ===========================================
   Release Microphone
=========================================== */

export const releaseMicrophone =
  () => {
    if (mediaStream) {
      mediaStream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      mediaStream = null;
    }

    mediaRecorder = null;

    audioChunks = [];
  };

/* ===========================================
   Recording State
=========================================== */

export const isRecording = () => {
  return (
    mediaRecorder &&
    mediaRecorder.state === "recording"
  );
};