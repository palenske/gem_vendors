module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-reanimated/plugin deve ser sempre o último plugin da lista.
    // Reanimated 4 já embute o worklets plugin internamente — não adicionar
    // "react-native-worklets/plugin" separadamente (causa erro de plugin duplicado).
    plugins: ["react-native-reanimated/plugin"],
  };
};
