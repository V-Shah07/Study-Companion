import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../../Configs/firebaseConfig";

//USED YOTUUBE TUTORIAL BUT LEARNEWD FROM IT

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function Register() {
    setLoading(true);
    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);
      const response = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      Alert.alert("Success", "User created and logged in");
      router.replace("../(drawers)/home");
    } catch (error) {
      setLoading(false);
      Alert.alert("Oops", "Something went wrong");
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: "#333" }]}
        placeholder="email"
        placeholderTextColor="#aaa"
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { marginTop: 10, color: "#333" }]}
        placeholder="password"
        placeholderTextColor="#aaa"
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={Register}>
        {loading ? (
          <ActivityIndicator
            size={"small"}
            color={"white"}
            animating={loading}
          />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegisterPage;
