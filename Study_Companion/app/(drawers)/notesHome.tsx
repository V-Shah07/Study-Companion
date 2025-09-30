import { AntDesign, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { router } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../Configs/firebaseConfig";
import pickImage from "../../utils/imagePicker";


const NotesPage = function() {

  const [groupNote, setGroupedNote] = useState({});


  const ip = "192.168.68.117";
  

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  

  const [isRecording, setIsRecording] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  

  const [selectedTag, setSelectedTag] = useState(null);
  const [allTags, setAllTags] = useState([]);


  const sendOCR = function() {
    pickImage(async function(base64, uri) {
      const response = await fetch("http://" + ip + ":8080/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await response.json();
      let text = "";
      if (data && data.text) {
        text = data.text.trim();
      }

      if (!text) {
        Alert.alert("Fail", "Could not extract text from the image.");
        return;
      }

      router.push({
        pathname: "/(notes)/addNote",
        params: {
          title: "Scanned Note",
          note: text,
          tags: JSON.stringify(["scanned"]),
        },
      });
    });
  };


  const sendAudioToBackend = async function(audioUri) {
    try {
      setAudioProcessing(true);

      const formData = new FormData();
      formData.append("audio", {
        uri: audioUri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      const response = await fetch("http://" + ip + ":8080/audio-to-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      let transcribedText = "";
      if (data && data.text) {
        transcribedText = data.text.trim();
      }

      if (!transcribedText) {
        Alert.alert("Failed", "Could not transcribe the audio.");
        return;
      }

      router.push({
        pathname: "/(notes)/addNote",
        params: {
          title: "Voice Note",
          note: transcribedText,
          tags: JSON.stringify(["transcribed"]),
        },
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      Alert.alert("Failed", "Could not upload audio file.");
    } finally {
      setAudioProcessing(false);
    }
  };


  const micOn = async function() {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      Alert.alert("Permission to access microphone was denied");
      return;
    }

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };


  const micOff = async function() {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      const audioUri = audioRecorder.uri;
      if (audioUri) {
        await sendAudioToBackend(audioUri);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
      Alert.alert("Recording Error", "Failed to process recording.");
    }
  };


  const clickMic = function() {
    if (isRecording) {
      micOff();
    } else {
      micOn();
    }
  };


  const addNoteRoute = function() {
    router.push("/(notes)/addNote");
  };


  const updateeNoteRoute = function(item) {
    let tagsToSend = [];
    if (item.tags) {
      tagsToSend = item.tags;
    }
    
    router.push({
      pathname: "/(notes)/updateNote",
      params: {
        id: item.id,
        title: item.title,
        note: item.note,
        subject: item.subject,
        tags: JSON.stringify(tagsToSend),
      },
    });
  };


  const clearFilter = function() {
    setSelectedTag(null);
  };


  const pickTag = function(tag) {
    setSelectedTag(tag);
  };


  const displayableNote = function(noteItem) {
    if (selectedTag === null) {
      return true;
    }
    
    if (noteItem.tags && noteItem.tags.includes(selectedTag)) {
      return true;
    }
    
    return false;
  };


  const getTagButtonStyle = function(tag) {
    let isActive = false;
    if (tag === null) {
      isActive = selectedTag === null;
    } else {
      isActive = selectedTag === tag;
    }
    
    if (isActive) {
      return [styles.tagButton, styles.tagButtonActive];
    } else {
      return [styles.tagButton, styles.tagButtonInactive];
    }
  };


  const tagStyle = function(tag) {
    let isActive = false;
    if (tag === null) {
      isActive = selectedTag === null;
    } else {
      isActive = selectedTag === tag;
    }
    
    if (isActive) {
      return styles.tagButtonTextActive;
    } else {
      return styles.tagButtonTextInactive;
    }
  };


  const micColor = function() {
    let backgroundColor = "#fff"; 
    
    if (isRecording) {
      backgroundColor = "#e74c3c"; 
    } else if (audioProcessing) {
      backgroundColor = "#bdc3c7"; 
    }
    
    return [
      styles.fabButton,
      {
        bottom: 210,
        backgroundColor: backgroundColor,
      },
    ];
  };


  const colors = function() {
    if (isRecording) {
      return "#fff"; 
    } else {
      return "#2c3e50"; 
    }
  };


  const clipNOte = function(noteText) {
    if (noteText.length > 50) {
      return noteText.substring(0, 50);
    } else {
      return noteText;
    }
  };


  useEffect(function() {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    //USED DOCS + GPT here to understand how to pull from database but didn't rly copy but rather used it to learn, and then used same strat in all other files for firestore
    const q = query(collection(db, "notes"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, function(querySnapshot) {
      const grouped = {};
      const tagsSet = new Set();
      
      querySnapshot.forEach(function(doc) {
        const data = doc.data();
        
        const note = {
          note: data.note,
          title: data.title,
          subject: data.subject,
          tags: data.tags,
          id: doc.id,
        };
        
        if (!note.subject) {
          note.subject = "Uncategorized";
        }
        
        if (!note.tags) {
          note.tags = [];
        }

        if (note.tags && note.tags.length > 0) {
          for (let i = 0; i < note.tags.length; i++) {
            tagsSet.add(note.tags[i]);
          }
        }

        if (!grouped[note.subject]) {
          grouped[note.subject] = [];
        }
        grouped[note.subject].push(note);
      });

      setGroupedNote(grouped);
      setAllTags(Array.from(tagsSet));
    });

    return function() {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📝 Notes</Text>

      <View style={styles.tagFilterContainer}>
        <Text style={styles.tagFilterLabel}>Filter by tag:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={clearFilter}
            style={getTagButtonStyle(null)}
          >
            <Text style={tagStyle(null)}>
              All
            </Text>
          </TouchableOpacity>
          
          {allTags.map(function(tag) {
            return (
              <TouchableOpacity
                key={tag}
                onPress={function() { pickTag(tag); }}
                style={getTagButtonStyle(tag)}
              >
                <Text style={tagStyle(tag)}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* I USED GPT OVER HERE since I couldn't figure out hwo to sort notes*/}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {Object.keys(groupNote).map(function(subject) {
          return (
            <View key={subject} style={{ marginBottom: 24 }}>
              <Text style={styles.subjectHeader}>{subject}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {groupNote[subject]
                  .filter(displayableNote)
                  .map(function(item) {
                    return (
                      <View key={item.id} style={styles.noteView}>
                        <Pressable
                          onPress={function() { updateeNoteRoute(item); }}
                        >
                          <Text style={styles.noteTitle}>{item.title}</Text>
                          <Text style={styles.noteContent}>
                            {clipNOte(item.note)}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
              </View>
            </View>
          );
        })}
      </ScrollView>


      <TouchableOpacity
        onPress={addNoteRoute}
        style={styles.fabButton}
      >
        <AntDesign name="plussquare" size={30} color="#2c3e50" />
      </TouchableOpacity>


      <TouchableOpacity
        onPress={sendOCR}
        style={[styles.fabButton, { bottom: 130 }]}
      >
        <MaterialIcons name="document-scanner" size={30} color="#2c3e50" />
      </TouchableOpacity>


      <TouchableOpacity
        onPress={clickMic}
        disabled={audioProcessing}
        style={micColor()}
      >
        <FontAwesome6
          name="microphone"
          size={25}
          color={colors()}
        />
      </TouchableOpacity>


      {audioProcessing && (
        <View style={styles.processingOverlay}>
          <Text style={styles.processingText}>Processing audio...</Text>
        </View>
      )}
    </View>
  );
};

export default NotesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  subjectHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
    marginTop: 16,
  },
  noteView: {
    width: "47%",
    margin: "1.5%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  noteContent: {
    fontSize: 14,
    marginTop: 8,
    color: "#2c3e50",
  },
  tagFilterContainer: {
    marginBottom: 16,
  },
  tagFilterLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c3e50",
    marginBottom: 8,
  },
  tagButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 15,
    borderWidth: 1,
  },
  tagButtonActive: {
    backgroundColor: "#2c3e50",
    borderColor: "#2c3e50",
  },
  tagButtonInactive: {
    backgroundColor: "#ecf0f1",
    borderColor: "#bdc3c7",
  },
  tagButtonTextActive: {
    color: "#fff",
  },
  tagButtonTextInactive: {
    color: "#2c3e50",
  },
  fabButton: {
    position: "absolute",
    bottom: 60,
    right: 30,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44, 62, 80, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});