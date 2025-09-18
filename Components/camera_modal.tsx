import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Linking,
} from "react-native";
import { CameraView, CameraType, Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import {
  Camera as CameraIcon,
  RefreshCcw,
  Image as ImageIcon,
  X,
  Check,
} from "lucide-react-native";

type CameraModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (uri: string) => void;
};

export default function CameraModal({
  visible,
  onClose,
  onSelect,
}: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef<CameraView | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // pedir permiso de cámara al abrir el modal
  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === "granted");
      })();
    }
  }, [visible]);

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setPreviewUri(photo.uri);
    } catch (err) {
      console.warn("Error taking picture:", err);
    }
  };

    const openGallery = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permiso de galería denegado");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true, // 🔹 abre recorte
        aspect: [4, 3],      // opcional, define la proporción
      });

      if (!result.canceled) {
        setPreviewUri(result.assets[0].uri);
      }
    };


  const acceptImage = async () => {
    if (!previewUri) return;

    const manipulated = await ImageManipulator.manipulateAsync(
      previewUri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    onSelect(manipulated.uri);
    setPreviewUri(null);
    onClose();
  };

  const cancelPreview = () => {
    setPreviewUri(null);
  };

  if (hasCameraPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.center}>
          <Text style={{ color: "white", textAlign: "center", marginBottom: 20 }}>
            No se otorgaron permisos de cámara.  
            Actívalos en la configuración del sistema.
          </Text>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={{ color: "white" }}>Abrir Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {previewUri ? (
          <>
            <Image source={{ uri: previewUri }} style={styles.preview} />
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={cancelPreview}
              >
                <X size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={acceptImage}
              >
                <Check size={32} color="white" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {hasCameraPermission ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                onCameraReady={onCameraReady}
              />
            ) : (
              <View style={styles.center}>
                <Text style={{ color: "white" }}>
                  Solicitando permisos de cámara...
                </Text>
              </View>
            )}

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}
              >
                <RefreshCcw size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={takePicture}
                disabled={!isCameraReady}
              >
                <CameraIcon
                  size={32}
                  color={isCameraReady ? "white" : "gray"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={openGallery}
              >
                <ImageIcon size={28} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={28} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 50,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 50,
  },
  preview: { flex: 1, resizeMode: "contain" },
  center: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
