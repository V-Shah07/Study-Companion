import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Button,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { db } from "../../Configs/firebaseConfig";


const UpdateNote = function () {

  const searchParams = useLocalSearchParams();

  //USED GPT HERE---------- fixed small typescript error
  let noteId;
  if (Array.isArray(searchParams.id)) {
    noteId = searchParams.id[0];
  } else {
    noteId = searchParams.id;
  }

  const noteTitle = searchParams.title;
  const noteContent = searchParams.note;
  const noteSubject = searchParams.subject;
  const noteTags = searchParams.tags;


  //needa check for all the types on the states since they are incoming params cuz otherwise throws error

  const [noteState, setNoteState] = useState(function () {
    if (typeof noteContent === "string") {
      return noteContent;
    } else {
      return "";
    }
  });

  const [titleeState, setTitleeState] = useState(function () {
    if (typeof noteTitle === "string") {
      return noteTitle;
    } else {
      return "";
    }
  });


  const [noteSubjectState, setNoteSubjectState] = useState(function () {
    if (typeof noteSubject === "string") {
      return noteSubject;
    } else {
      return "General";
    }
  });


  const [allTags, setAllTags] = useState(function () {
    if (noteTags && typeof noteTags === "string") {
      try {
        const parsedTags = JSON.parse(noteTags);
        if (Array.isArray(parsedTags)) {
          return parsedTags;
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    }
    return [];
  });

 
  const [newTag, setNewTag] = useState("");


  const update = async function () {
    if (titleeState && noteState.length > 0) {
      try {
        const noteReference = doc(db, "notes", noteId);
        await updateDoc(noteReference, {
          title: titleeState,
          note: noteState,
          subject: noteSubjectState,
          tags: allTags,
        });
        router.push("/notesHome");
      } catch (error) {
        Alert.alert("Error", "Wasn't able to update note");
      }
    }
  };

  const deleteing = async function () {
    Alert.alert("Delete note", "Confimr that you want to delete this note.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async function () {
          try {

            let idToDelete;
            if (Array.isArray(searchParams.id)) {
              idToDelete = searchParams.id[0];
            } else {
              idToDelete = searchParams.id;
            }

            const noteReference = doc(db, "notes", idToDelete);
            await deleteDoc(noteReference);
            router.push("/notesHome");
          } catch (error) {
            console.error("delete didnt work");
            Alert.alert("Error!!", "The app wasn't able to delete youre note.");
          }
        },
      },
    ]);
  };

  const delTag = function (indexToRemove: number) {
    const updatedTags = [];
    for (let i = 0; i < allTags.length; i++) {
      if (i !== indexToRemove) {
        updatedTags.push(allTags[i]);
      }
    }
    setAllTags(updatedTags);
  };


  const addTag = function () {
    const trimmedTag = newTag.trim();
    if (trimmedTag !== "" && !allTags.includes(trimmedTag)) {
      const newTags = [...allTags, trimmedTag];
      setAllTags(newTags);
      setNewTag("");
    }
  };

  const changeSubj = function (selectedValue: string) {
    setNoteSubjectState(selectedValue);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>✏️ Edit Note</Text>

        <TextInput
          placeholder="Title"
          value={titleeState}
          onChangeText={setTitleeState}
          style={styles.inputTitle}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Note"
          value={noteState}
          onChangeText={setNoteState}
          style={styles.inputNote}
          multiline={true}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Add a tag and click enter"
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={addTag}
          style={styles.inputTitle}
          placeholderTextColor="#999"
        />

        <View style={styles.tagContainer}>
          {allTags.map(function (tag, index) {
            return (
              <View key={index} style={styles.tagWrapper}>
                <Text style={styles.tag}>#{tag}</Text>
                <Button
                  title="×"
                  onPress={function () {
                    delTag(index);
                  }}
                  color="#e74c3c"
                />
              </View>
            );
          })}
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Subject:</Text>
          <Picker
            selectedValue={noteSubjectState}
            onValueChange={changeSubj}
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

        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Update Note"
              onPress={update}
              color="#27ae60"
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Delete Note"
              color="#e74c3c"
              onPress={deleteing}
            />
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default UpdateNote;

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
    marginBottom: 20,
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
  buttonContainer: {
    gap: 10,
  },
  buttonWrapper: {
    marginBottom: 10,
  },
});