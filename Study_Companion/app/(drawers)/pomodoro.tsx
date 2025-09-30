import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { auth, db } from "../../Configs/firebaseConfig";


Notifications.setNotificationHandler({
  handleNotification: async function () {
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});


function PomodoroTimer() {

  const [studytime, setStudytime] = useState(30);
  const [breaktime, setBreaktime] = useState(5);
  const [totalCycles, setTotalcycles] = useState(4);


  const [remainTime, setRemainTime] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [worksesh, setWorksesh] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [seshDone, setSeshDone] = useState(false);


  const [intervalId, setIntervalId] = useState(null);

  const notify = async function (message) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message,
      },
      trigger: null, 
    });
  };


  const updateStats = async function (
    workMinutes,
    breakMinutes,
    sessions
  ) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const existingData = userSnap.data();

      const currentSessions = existingData.totalSessions;
      const currentWorkTime = existingData.totalWorkTime;
      const currentBreakTime = existingData.totalBreakTime;

      await updateDoc(userRef, {
        totalSessions: currentSessions + sessions,
        totalWorkTime: currentWorkTime + workMinutes,
        totalBreakTime: currentBreakTime + breakMinutes,
      });
    } else {
      await setDoc(userRef, {
        totalSessions: sessions,
        totalWorkTime: workMinutes,
        totalBreakTime: breakMinutes,
      });
    }
  };

  const minsChange = function (inputValue) {
    let minutes = parseInt(inputValue);
    if (isNaN(minutes)) {
      minutes = 0;
    }
    setStudytime(minutes);
    if (!running) {
      setRemainTime(minutes * 60);
    }
  };


  const breakMinschange = function (inputValue) {
    let minutes = parseInt(inputValue);
    if (isNaN(minutes)) {
      minutes = 0;
    }
    setBreaktime(minutes);
  };

  const cycles = function (inputValue) {
    let cycles = parseInt(inputValue);
    if (isNaN(cycles)) {
      cycles = 0;
    }
    setTotalcycles(cycles);
  };

  const pausing = function () {
    setRunning(!running);
  };


  const reset = function () {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setRunning(false);
    setWorksesh(true);
    setCurrentCycle(0);
    setSeshDone(false);
    setRemainTime(studytime * 60);
  };


  const timeString = function (totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return formattedMinutes + ":" + formattedSeconds;
  };

  function status() {
    if (seshDone) {
      return "✅ Study session completed!";
    }

    if (worksesh) {
      return "📚 Work Session";
    }

    return "☕ Break Time";
  }


  useEffect(
    function () {

      const setupNotifications = async function () {
        const permissionResult = await Notifications.requestPermissionsAsync();
        if (permissionResult.status !== "granted") {
          console.warn("Notification permissions not granted.");
        }
      };

      setupNotifications();


      if (!running || seshDone) {
        return;
      }


      const newIntervalId = setInterval(function () {
        setRemainTime(function (previousTimeLeft) {

          if (previousTimeLeft <= 1) {
            clearInterval(newIntervalId);
            setIntervalId(null);

            if (worksesh) {
              const nextCycle = currentCycle + 1;
              if (nextCycle >= totalCycles) {

                setSeshDone(true);
                setRunning(false);
                notify("🎉 Study session complete!🎉");

                
                const totalWorkMinutes = studytime * totalCycles;
                const totalBreakMinutes = breaktime * (totalCycles - 1);
                updateStats(
                  totalWorkMinutes,
                  totalBreakMinutes,
                  totalCycles
                );
              }
              setCurrentCycle(nextCycle);
              setWorksesh(false);
              setRemainTime(breaktime * 60);
              notify("Break!");
            } else {
              setWorksesh(true);
              setRemainTime(studytime * 60);
              notify("Back to work!");
            }

            return 0;
          }
          return previousTimeLeft - 1;
        });
      }, 1000);

      setIntervalId(newIntervalId);

      return function () {
        if (newIntervalId) {
          clearInterval(newIntervalId);
        }
      };
    },
    [
      running,
      worksesh,
      currentCycle,
      seshDone,
      studytime,
      breaktime,
      totalCycles,
    ]
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.header}>⏰Pomodoro Timer⏰</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Study</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="30"
              value={studytime.toString()}
              onChangeText={minsChange}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Break</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="5"
              value={breaktime.toString()}
              onChangeText={breakMinschange}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cycles</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="4"
              value={totalCycles.toString()}
              onChangeText={cycles}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              placeholderTextColor="#999"
            />
          </View>
        </View>
        {/* Then use it in your JSX: */}
        <Text style={styles.label}>{status()}</Text>
        <Text style={styles.timer}>{timeString(remainTime)}</Text>
        <View style={styles.buttonContainer}>
          {!seshDone && (
            <TouchableOpacity
              style={styles.button}
              onPress={pausing}
            >
              {(() => {
                if (running) {
                  return <Text style={styles.buttonText}>Pause</Text>;
                } else {
                  return <Text style={styles.buttonText}>Start</Text>;
                }
              })()}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default PomodoroTimer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 30,
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#2c3e50",
    textAlign: "center",
  },
  label: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
  },
  inputContainer: {
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    width: 80,
    textAlign: "center",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#2c3e50",
  },
  buttonContainer: {
    gap: 15,
    marginTop: 20,
    width: "60%",
  },
  button: {
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
