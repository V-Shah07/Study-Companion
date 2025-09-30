import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PieChart from "react-native-pie-chart";
import { auth, db } from "../../Configs/firebaseConfig";

const HomePage = () => {

  const [email, setEmail] = useState("");
  const [notesData, setNotesData] = useState([]);
  const [stats, setStats] = useState({
    sessions: 0,
    workTime: 0,
    breakTime: 0,
  });
  const [loading, setLoading] = useState(true);

  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#34495e",
    "#e91e63",
    "#27ae60",
    "#8e44ad",
    "#f1c40f",
    "#d35400",
    "#95a5a6",
  ];


  const subjects = [
    "General",
    "Mathematics",
    "Science",
    "History",
    "Literature",
    "Business",
    "Technology",
    "Personal",
    "Health",
    "Finance",
    "Travel",
    "Cooking",
    "Other",
  ];


  const getStats = async () => {
    //auth shit
    try {
      const user = auth.currentUser;


      if (!user) {
        return;
      }


      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);


      if (userDoc.exists()) {
        const data = userDoc.data();

        // Set pomodoro stats with default values if data doesn't exist
        const newStats = {
          sessions: 0,
          workTime: 0,
          breakTime: 0,
        };

        if (data.totalSessions) {
          newStats.sessions = data.totalSessions;
        }
        if (data.totalWorkTime) {
          newStats.workTime = data.totalWorkTime;
        }
        if (data.totalBreakTime) {
          newStats.breakTime = data.totalBreakTime;
        }

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error getting stat:", error);
    }
  };


  const getJNotes = async () => {
    try {
      const user = auth.currentUser;


      if (!user) {
        return;
      }


      const notesQuery = query(
        collection(db, "notes"),
        where("uid", "==", user.uid)
      );


      const querySnapshot = await getDocs(notesQuery);
      //getting all notes and coiunting theyre subje ct frequenceis 

      const counts = {};


      let subjectIndex = 0;
      while (subjectIndex < subjects.length) {
        const currentSubject = subjects[subjectIndex];
        counts[currentSubject] = 0;
        subjectIndex = subjectIndex + 1;
      }


      querySnapshot.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        let subject = data.subject;


        if (!subject) {
          subject = "General";
        }


        counts[subject] = counts[subject] + 1;
      });


      const chartData = [];
      let subjectIndex2 = 0;
      while (subjectIndex2 < subjects.length) {
        const subject = subjects[subjectIndex2];
        const count = counts[subject];


        if (count > 0) {
          const dataItem = {
            subject: subject,
            count: count,
            color: colors[subjectIndex2],
          };
          chartData.push(dataItem);
        }

        subjectIndex2 = subjectIndex2 + 1;
      }

      setNotesData(chartData);
    } catch (error) {
      console.error("Error getting notes:", error);
    }


    setLoading(false);
  };


  useEffect(() => {
    const user = auth.currentUser;

    if (user) {

      let email = "";
      if (user.email) {
        email = user.email;
      }
      setEmail(email);


      getJNotes();
      getStats();
    }
  }, []);


  const subjDisp = (subject, count) => {
    Alert.alert(subject, "You have " + count + " notes in " + subject, [
      { text: "OK" },
    ]);
  };


  let totalNotes = 0;
  let noteIndex = 0;
  while (noteIndex < notesData.length) {
    totalNotes = totalNotes + notesData[noteIndex].count;
    noteIndex = noteIndex + 1;
  }


  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>👋 Welcome! 👋</Text>
      <Text style={styles.email}>Logged in as: {email}</Text>


      {notesData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}> Notes by Subject</Text>
          <Text style={styles.totalNotes}>Total Notes: {totalNotes}</Text>

          <PieChart
            widthAndHeight={200}
            series={notesData.map(function (item) {
              return { value: item.count, color: item.color };
            })}
          />

          <View style={styles.legend}>
            {notesData.map(function (item, index) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.legendItem}
                  onPress={function () {
                    subjDisp(item.subject, item.count);
                  }}
                >
                  <View
                    style={[styles.colorBox, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.legendText}>
                    {item.subject} ({item.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {notesData.length === 0 && (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>📝 No notes yet!</Text>
          <Text style={styles.noDataSubtext}>
            Add some notes to see the chart
          </Text>
        </View>
      )}

      {/* check nd make sure there is ascutally data to showlw */}
      {(stats.sessions > 0 ||
        stats.workTime > 0 ||
        stats.breakTime > 0) && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>⏰ Pomodoro Stats</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.sessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.workTime}</Text>
              <Text style={styles.statLabel}>Work Minutes</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.breakTime}</Text>
              <Text style={styles.statLabel}>Break Minutes</Text>
            </View>
          </View>
        </View>
      )}

      {stats.sessions === 0 &&
        stats.workTime === 0 &&
        stats.breakTime === 0 && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>⏰ No pomodoro sessions yet!⏰</Text>
            <Text style={styles.noDataSubtext}>
              Complete some studying to see your stats
            </Text>
          </View>
        )}
    </ScrollView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
  },
  loading: {
    fontSize: 18,
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 50,
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  totalNotes: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
  },
  legend: {
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  noDataContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  noDataText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    fontWeight: "500",
  },
});
