// camera_reel_modal.jsx (extracto corregido)

///////////////////// arreglaaaaaaaaaaaaar    porque no graba esta mierdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:C //////////////////////////
import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

// IMPORTS CORREGIDOS:
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useVideoPlayer, VideoView } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import { RefreshCcw, Image as ImageIcon, X, Check, Circle } from "lucide-react-native";

export default function CameraModalReel({ visible, onClose, onSelect }) {
  const cameraRef = useRef(null);
  const recordingPromiseRef = useRef(null);

  // permisos
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // estados
  const [facing, setFacing] = useState("back"); // ahora 'back' | 'front'
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoUri, setVideoUri] = useState(null);

  // player para preview
  const player = useVideoPlayer(videoUri ?? undefined, (p) => {
    p.loop = true;
    if (videoUri) p.play?.();
  });

  useEffect(() => {
    if (visible) {
      requestCameraPermission();
      requestMicPermission();
    } else {
      setIsRecording(false);
      setLoading(false);
      setVideoUri(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!player) return;
    if (videoUri) {
      try {
        player.replace?.(videoUri);
        player.play?.();
      } catch (e) {}
    } else {
      player.pause?.();
    }
  }, [videoUri, player]);

  const toggleFacing = () => {
    setFacing((f) => (f === "back" ? "front" : "back"));
  };

  const waitForCameraReady = async (timeout = 4000, interval = 100) => {
    let waited = 0;
    // la API nueva no expone onCameraReady; comprobamos que exista el ref
    while (!(cameraRef.current) && waited < timeout) {
      await new Promise((r) => setTimeout(r, interval));
      waited += interval;
    }
    return !!cameraRef.current;
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      const ok = await waitForCameraReady(5000, 120);
      if (!ok) {
        Alert.alert("Cámara no lista", "Intenta de nuevo en unos segundos.");
        return;
      }
    }

    if (!cameraRef.current?.recordAsync) {
      Alert.alert(
        "No soportado",
        "La API de cámara de este dispositivo/SDK no soporta grabación desde aquí."
      );
      return;
    }

    setLoading(true);
    setIsRecording(true);

    const maxAttempts = 6;
    let attempt = 0;
    let recordedUri = null;

    while (attempt < maxAttempts && !recordedUri) {
      attempt++;
      try {
        await new Promise((r) => setTimeout(r, 150 * attempt));
        const recPromise = cameraRef.current.recordAsync({ maxDuration: 60 });
        recordingPromiseRef.current = recPromise;
        const result = await recPromise;
        const uri = result?.uri ?? result?.output ?? null;
        if (uri) {
          recordedUri = uri;
          break;
        } else {
          throw new Error("No URI returned");
        }
      } catch (err) {
        const msg = String(err?.message ?? err).toLowerCase();
        if (msg.includes("camera not ready") || msg.includes("not ready")) {
          await new Promise((r) => setTimeout(r, 200 * attempt));
          continue;
        }
        if (msg.includes("cancelled") || msg.includes("abort")) break;
        Alert.alert("Error al grabar", msg);
        break;
      }
    }

    if (recordedUri) setVideoUri(recordedUri);
    setIsRecording(false);
    setLoading(false);
    recordingPromiseRef.current = null;
  };

  const stopRecording = async () => {
    try {
      cameraRef.current?.stopRecording?.();
    } catch (e) {
      console.warn("[REEL] stopRecording error:", e);
    } finally {
      setIsRecording(false);
      setLoading(false);
      recordingPromiseRef.current = null;
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Permite acceso a la galería para seleccionar un video.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    const uri = res?.assets?.[0]?.uri ?? res?.uri ?? null;
    const canceled = typeof res?.canceled === "boolean" ? res.canceled : false;
    if (!canceled && uri) setVideoUri(uri);
  };

  const acceptVideo = () => {
    if (videoUri) {
      onSelect(videoUri);
      setVideoUri(null);
      handleClose();
    }
  };

  const cancelPreview = () => setVideoUri(null);

  const handleClose = async () => {
    if (isRecording) await stopRecording();
    try { player?.pause?.(); } catch (e) {}
    setVideoUri(null);
    setIsRecording(false);
    setLoading(false);
    onClose();
  };

  // UI permisos
  if (!cameraPermission?.granted || !micPermission?.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.center}>
          <Text style={{ color: "white", textAlign: "center", marginBottom: 18 }}>
            Necesitamos permisos de cámara y micrófono para grabar.
          </Text>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={async () => {
              await requestCameraPermission();
              await requestMicPermission();
            }}
          >
            <Text style={{ color: "white" }}>Dar permisos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {videoUri ? (
          <>
            <VideoView
              style={styles.preview}
              player={player}
              contentFit="contain"
              nativeControls
              allowsPictureInPicture
              allowsFullscreen
            />
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={cancelPreview}>
                <X size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: "#1ED760" }]}
                onPress={acceptVideo}
              >
                <Check size={32} color="white" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Usar CameraView (API nueva) */}
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              // otras props: enableTorch, autofocus, etc.
            />
            <View style={styles.bottomControls}>
              <TouchableOpacity onPress={toggleFacing} style={styles.sideButton}>
                <RefreshCcw size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && { backgroundColor: "red", transform: [{ scale: 0.9 }] },
                  (loading) && { opacity: 0.6 },
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Circle size={60} color="white" />}
              </TouchableOpacity>
              <TouchableOpacity onPress={openGallery} style={styles.sideButton}>
                <ImageIcon size={28} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={28} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

// (mantén tus estilos tal cual)


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  preview: { flex: 1, width: "100%", height: "100%" },
  center: { flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center", padding: 20 },
  bottomControls: { position: "absolute", bottom: Platform.OS === "ios" ? 80 : 60, width: "100%", flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  sideButton: { backgroundColor: "rgba(0,0,0,0.6)", padding: 12, borderRadius: 30 },
  recordButton: { backgroundColor: "#FF0000", padding: 4, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  closeButton: { position: "absolute", top: 40, right: 20, backgroundColor: "rgba(0,0,0,0.6)", padding: 8, borderRadius: 20 },
  controls: { position: "absolute", bottom: 40, width: "100%", flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  controlButton: { backgroundColor: "rgba(0,0,0,0.6)", padding: 12, borderRadius: 30 },

    sideButton: { 
    backgroundColor: "rgba(0,0,0,0.6)", 
    padding: 14, 
    borderRadius: 50 
  },
  recordButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 4,
    borderColor: "white",
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 50,
    marginHorizontal: 12,
  },
  controls: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 50,
  },
});
