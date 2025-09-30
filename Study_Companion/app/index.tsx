import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const HomePage = function() {
  

  const handleLoginPress = function() {
    router.push("/(auth)/login");
  };
  

  const handleRegisterPress = function() {
    router.push("/(auth)/register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚Paperless📚</Text>
      
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLoginPress}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegisterPress}
      >
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    marginBottom: 50 
  },
  loginButton: {
    width: "80%",
    height: 45,
    borderRadius: 6,
    backgroundColor: "teal",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  registerButton: {
    width: "80%",
    height: 45,
    borderRadius: 6,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  loginButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "500" 
  },
  registerButtonText: { 
    color: "#333", 
    fontSize: 16, 
    fontWeight: "500" 
  },
});

export default HomePage;