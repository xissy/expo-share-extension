const path = require("path");
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          alias: {
            // For development, we want to alias the library to the source
            "expo-share-extension": path.join(
              __dirname,
              "..",
              "..",
              "src",
              "index.ts"
            ),
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
