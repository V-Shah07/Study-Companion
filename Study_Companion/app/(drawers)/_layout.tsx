import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TabsLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: "Home",
            title: "Home Page",
          }}
        />
        <Drawer.Screen
          name="notes"
          options={{
            drawerLabel: "Notes",
            title: "Notes Page",
          }}
        />
        <Drawer.Screen
          name="pomodoro"
          options={{
            drawerLabel: "Focus",
            title: "Focus Page",
          }}
        />
        
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default TabsLayout;
