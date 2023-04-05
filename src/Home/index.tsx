import { useEffect, useState } from "react";
import { ImageSourcePropType, View } from "react-native";
import { styles } from "./styles";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import neutralImg from "../assets/neutral.png";
import grinningImg from "../assets/grinning.png";
import winkingImg from "../assets/winking.png";

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralImg);

  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };
      setFaceDetected(true);
      if (face.smilingProbability > 0.5) {
        setEmoji(grinningImg);
      } else if (
        face.leftEyeOpenProbability > 0.5 &&
        face.rightEyeOpenProbability < 0.5
      ) {
        setEmoji(winkingImg);
      }
    } else {
      setFaceDetected(false);
    }

    // console.log("resultado faces>>>", faces);
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y + 250 },
    ],
  }));

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return null;
  }

  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
