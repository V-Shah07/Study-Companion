import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { auth, db } from "../../Configs/firebaseConfig";

export default function AddNotePage() {
  const ip = "192.168.68.117";

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState("General");
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagValue, setTagValue] = useState("");
  const [isClassified, setIsClassified] = useState(false);

  const searchParams = useLocalSearchParams();
  const ocrTitle = searchParams.title;
  const ocrNote = searchParams.note;
  const tagParam = searchParams.tags;

  useEffect(() => {
    //auto make title for special casess

    if (ocrTitle && typeof ocrTitle === "string") {
      setTitle(ocrTitle);
    }

    if (ocrNote && typeof ocrNote === "string") {
      setNote(ocrNote);
    }

    if (tagParam && typeof tagParam === "string") {
      try {
        const parsedTags = JSON.parse(tagParam);
        if (Array.isArray(parsedTags)) {
          setTags(parsedTags);
        }
      } catch (err) {
        console.error("Error parsing tags:", err);
      }
    }
  }, []);

  const classifySubject = async () => {
    try {
      setIsLoading(true);

      const requestData = {
        title: title,
        note: note,
      };

      const response = await fetch("http://" + ip + ":8080/classify-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        return data.subject;
      } else {
        alert("Couldn't make a classifcation of note.");
        return "General";
      }
    } catch (error) {
      alert("Error with classification");
      return "General";
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("User not signed in");
        return;
      }

      if (!isClassified) {
        const classifiedSubject = await classifySubject();
        console.log("subject is " + classifiedSubject);
        setSubject(classifiedSubject);
        setIsClassified(true);
      } else {
        const noteData = {
          title: title,
          note: note,
          subject: subject,
          tags: tags,
          uid: user.uid,
        };

        await addDoc(collection(db, "notes"), noteData);

        //clearing
        setTitle("");
        setNote("");
        setTags([]);
        setTagValue("");
        setSubject("General");
        setIsClassified(false);

        Keyboard.dismiss();
        router.push("/(drawers)/notesHome");
      }
    } catch (error) {
      alert(error);
    }
  };

  const removetag = (indexToRemove) => {
    const newTags = [];
    let currentIndex = 0;

    //mantain all other tags
    while (currentIndex < tags.length) {
      if (currentIndex !== indexToRemove) {
        newTags.push(tags[currentIndex]);
      }
      currentIndex = currentIndex + 1;
    }

    setTags(newTags);
  };

  const addTag = () => {
    const trimmedTag = tagValue.trim();

    if (trimmedTag !== "") {
      let existing = false;
      let tagIndex = 0;

      while (tagIndex < tags.length) {
        if (tags[tagIndex] === trimmedTag) {
          existing = true;
          break;
        }
        tagIndex = tagIndex + 1;
      }

      if (!existing) {
        const newTags = [];
        let copyIndex = 0;

        // Copy existing tags
        while (copyIndex < tags.length) {
          newTags.push(tags[copyIndex]);
          copyIndex = copyIndex + 1;
        }

        newTags.push(trimmedTag);
        setTags(newTags);
      }

      setTagValue("");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.header}>✏️ Add New Note</Text>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.inputTitle}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Note"
          value={note}
          onChangeText={setNote}
          style={styles.inputNote}
          multiline
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Add a tag and press enter"
          value={tagValue}
          onChangeText={setTagValue}
          onSubmitEditing={addTag}
          style={styles.inputTitle}
          placeholderTextColor="#999"
        />

        <View style={styles.tagContainer}>
          {tags.map(function (tag, index) {
            return (
              <View key={index} style={styles.tagWrapper}>
                <Text style={styles.tag}>#{tag}</Text>
                <Button
                  title="×"
                  onPress={function () {
                    removetag(index);
                  }}
                  color="#e74c3c"
                />
              </View>
            );
          })}
        </View>

        {isLoading && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}

        {!isLoading && (
          <View style={styles.buttonContainer}>
            <Button
              title={(function () {
                if (isClassified) {
                  return "Confirm & Add Note";
                } else {
                  return "Classify & Add Note";
                }
              })()}
              onPress={handleAdd}
              color="#27ae60"
            />
          </View>
        )}

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Subject:</Text>
          <Picker
            selectedValue={subject}
            onValueChange={function (itemValue) {
              setSubject(itemValue);
            }}
            enabled={!isLoading}
            style={styles.picker}
          >
            <Picker.Item label="General" value="General" color="#2c3e50" />
            <Picker.Item
              label="Mathematics"
              value="Mathematics"
              color="#2c3e50"
            />
            <Picker.Item label="Science" value="Science" color="#2c3e50" />
            <Picker.Item label="History" value="History" color="#2c3e50" />
            <Picker.Item
              label="Literature"
              value="Literature"
              color="#2c3e50"
            />
            <Picker.Item label="Business" value="Business" color="#2c3e50" />
            <Picker.Item
              label="Technology"
              value="Technology"
              color="#2c3e50"
            />
            <Picker.Item label="Personal" value="Personal" color="#2c3e50" />
            <Picker.Item label="Health" value="Health" color="#2c3e50" />
            <Picker.Item label="Finance" value="Finance" color="#2c3e50" />
            <Picker.Item label="Travel" value="Travel" color="#2c3e50" />
            <Picker.Item label="Cooking" value="Cooking" color="#2c3e50" />
            <Picker.Item label="Other" value="Other" color="#2c3e50" />
          </Picker>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  inputTitle: {
    fontSize: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  inputNote: {
    fontSize: 16,
    height: 150,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  processingText: {
    color: "#3498db",
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 15,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 15,
  },
  tagWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    borderRadius: 15,
    paddingLeft: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#bdc3c7",
  },
  tag: {
    fontSize: 14,
    paddingVertical: 6,
    marginRight: 8,
    color: "#2c3e50",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  picker: {
    color: "#2c3e50",
  },
});
