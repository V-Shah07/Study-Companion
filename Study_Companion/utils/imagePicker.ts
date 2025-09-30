import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

function pickImage(onImagePicked) {
// most of this code is from expo docs
  ImagePicker.requestCameraPermissionsAsync().then(function (cameraPerm) {

    ImagePicker.requestMediaLibraryPermissionsAsync().then(function (
      mediaLibPerm
    ) {

      if (cameraPerm.granted === false || mediaLibPerm.granted === false) {
        Alert.alert(
          "Permission denied",
          "You need to give access to camera and media library to scan notes"
        );
        return;
      }


      Alert.alert("Select Image Source", "Choose image source", [
        {
          text: "Take Photo",
          onPress: function () {

            ImagePicker.launchCameraAsync({
              base64: true,
              allowsEditing: true,
              aspect: [16, 9],
            }).then(function (result) {

              if (result.canceled === false) {

                if (result.assets[0].base64) {
                  onImagePicked(result.assets[0].base64, result.assets[0].uri);
                }
              }
            });
          },
        },
        {
          text: "Gallery",
          onPress: function () {

            ImagePicker.launchImageLibraryAsync({
              base64: true,
              allowsEditing: true,
              aspect: [16, 9],
            }).then(function (result) {

              if (result.canceled === false) {
                onImagePicked(result.assets[0].base64, result.assets[0].uri);
              }
            });
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    });
  });
}

export default pickImage;
