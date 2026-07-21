import { StyleSheet, View } from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text } from "@/components/Themed";

export default function TabOneScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-red-800 dark:bg-red-500 ">
      <Text style={styles.title}>Tab One</Text>
      <View
        style={styles.separator}
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
