# Expo Share Extension

![npm](https://img.shields.io/npm/v/expo-share-extension.svg)
![License](https://img.shields.io/npm/l/expo-share-extension.svg)
![Downloads](https://img.shields.io/npm/dm/expo-share-extension.svg)
![GitHub stars](https://img.shields.io/github/stars/MaxAst/expo-share-extension.svg)

> **Note**: The default `Text` and `TextInput` components by React Native do not work in the share extension due to a font scaling issue. You can fix this by setting `allowFontScaling={false}` or by importing the given components from `expo-share-extension`.

## Overview

Create an [iOS share extension](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/Share.html) with a custom view (similar to e.g. Pinterest). Supports Apple Sign-In, [React Native Firebase](https://rnfirebase.io/) (including shared auth session via access groups), custom background, custom height, and custom fonts.

https://github.com/MaxAst/expo-share-extension/assets/13224092/e5a6fb3d-6c85-4571-99c8-4efe0f862266

## Compatibility

| Expo       | `expo-share-extension` |
| ---------- | ---------------------- |
| **SDK 53** | 4.0.0+                 |
| **SDK 52** | 2.0.0+ and 3.0.0+      |
| **SDK 51** | 1.5.3+                 |
| **SDK 50** | 1.0.0+                 |

## Quick Start

### 1. Installation

```sh
npx expo install expo-share-extension
```

### 2. Basic Configuration

1. Update your `app.json` or `app.config.js`:

```json
"expo": {
  ...
  "plugins": ["expo-share-extension"],
  ...
}
```

2. Ensure your `package.json` has the correct `main` entry:

```json
{
  ...
  "main": "index.js",
  ...
}
```

3. Create the required entry points:

`index.js` (main app):

```ts
import { registerRootComponent } from "expo";

import App from "./App";

registerRootComponent(App);

// or if you're using expo-router:
// import "expo-router/entry";
```

`index.share.js` (share extension):

```ts
import { AppRegistry } from "react-native";

// could be any component you want to use as the root component of your share extension's bundle
import ShareExtension from "./ShareExtension";

// IMPORTANT: the first argument to registerComponent, must be "shareExtension"
AppRegistry.registerComponent("shareExtension", () => ShareExtension);
```

4. Wrap your metro config with `withShareExtension` in metro.config.js (if you don't have one, run: `npx expo customize metro.config.js` first):

```js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withShareExtension } = require("expo-share-extension/metro");

module.exports = withShareExtension(getDefaultConfig(__dirname), {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});
```

## Accessing Shared Data

The shared data is passed to the share extension's root component as an initial prop based on this type:

```ts
export type InitialProps = {
  files?: string[];
  images?: string[];
  videos?: string[];
  text?: string;
  url?: string;
  preprocessingResults?: unknown;
};
```

You can import `InitialProps` from `expo-share-extension` to use it as a type for your root component's props.

## Activation Rules

The config plugin supports almost all [NSExtensionActivationRules](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AppExtensionKeys.html#//apple_ref/doc/uid/TP40014212-SW10). It currently supports.

- `NSExtensionActivationSupportsText`, which is triggered e.g. when sharing a WhatsApp message's contents or when selecting a text on a webpage and sharing it via the iOS tooltip menu. The result is passed as the `text` field in the initial props
- `NSExtensionActivationSupportsWebURLWithMaxCount: 1`, which is triggered when using the share button in Safari. The result is passed as the `url` field in the initial props
- `NSExtensionActivationSupportsWebPageWithMaxCount: 1`, which is triggered when using the share button in Safari. The result is passed as the `preprocessingResults` field in the initial props. When using this rule, you will no longer receive `url` as part of initial props, unless you extract it in your preprocessing JavaScript file. You can learn more about this in the [Preprocessing JavaScript](#preprocessing-javascript) section.
- `NSExtensionActivationSupportsImageWithMaxCount: 1`, which is triggered when using the share button on an image. The result is passed as part of the `images` array in the initial props.
- `NSExtensionActivationSupportsMovieWithMaxCount: 1`, which is triggered when using the share button on a video. The result is passed as part of the `videos` array in the initial props.
- `NSExtensionActivationSupportsFileWithMaxCount: 1`, which is triggered when using the share button on a file. The result is passed as part of the `files` array in the initial props.

You need to list the activation rules you want to use in your `app.json`/`app.config.(j|t)s` file like so:

```json
[
  "expo-share-extension",
  {
    "activationRules": [
      {
        "type": "file",
        "max": 3
      },
      {
        "type": "image",
        "max": 2
      },
      {
        "type": "video",
        "max": 1
      },
      {
        "type": "text"
      },
      {
        "type": "url",
        "max": 1
      }
    ]
  }
]
```

If no values for `max` are provided, the default value is `1`. The `type` field can be one of the following: `file`, `image`, `video`, `text`, `url`.

If you want to use the `image` and `video` types, you need to make sure to add this to your `app.json`:

```jsonc
{
  // ...
  "ios": {
    // ...
    "privacyManifests": {
      "NSPrivacyAccessedAPITypes": [
        {
          "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
          "NSPrivacyAccessedAPITypeReasons": ["C617.1"],
        },
        // ...
      ],
    },
  },
}
```

If you do not specify the `activationRules` option, `expo-share-extension` enables the `url` and `text` rules by default, for backwards compatibility.

Contributions to support the remaining [NSExtensionActivationRules](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/AppExtensionKeys.html#//apple_ref/doc/uid/TP40014212-SW10) (`NSExtensionActivationSupportsAttachmentsWithMaxCount` and `NSExtensionActivationSupportsAttachmentsWithMinCount`) are welcome!

## Basic Usage

Need a way to close the share extension? Use the `close` method from `expo-share-extension`:

```ts
import { close } from "expo-share-extension"
import { Button, Text, View } from "react-native";

// if ShareExtension is your root component, url is available as an initial prop
export default function ShareExtension({ url }: { url: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text>{url}</Text>
      <Button title="Close" onPress={close} />
    </View>
  );
}
```

If you want to open the host app from the share extension, use the `openHostApp` method from `expo-share-extension` with a valid path:

```ts
import { openHostApp } from "expo-share-extension"
import { Button, Text, View } from "react-native";

// if ShareExtension is your root component, url is available as an initial prop
export default function ShareExtension({ url }: { url: string }) {
  const handleOpenHostApp = () => {
    openHostApp(`create?url=${url}`)
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>{url}</Text>
      <Button title="Open Host App" onPress={handleOpenHostApp} />
    </View>
  );
}
```

When you share images and videos, `expo-share-extension` stores them in a `sharedData` directory in your app group's container.
These files are not automatically cleaned up, so you should delete them when you're done with them. You can use the `clearAppGroupContainer` method from `expo-share-extension` to delete them:

```ts
import { clearAppGroupContainer } from "expo-share-extension"
import { Button, Text, View } from "react-native";

// if ShareExtension is your root component, url is available as an initial prop
export default function ShareExtension({ url }: { url: string }) {
  const handleCleanUp = async () => {
    await clearAppGroupContainer()
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>I have finished processing all shared images and videos</Text>
      <Button title="Clear App Group Container" onPress={handleOpenHostApp} />
    </View>
  );
}
```

## Configuration Options

### Exlude Expo Modules

Exclude unneeded expo modules to reduce the share extension's bundle size by adding the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "excludedPackages": [
        "expo-dev-client",
        "expo-splash-screen",
        "expo-updates",
        "expo-font",
      ],
    },
],
```

**Note**: The share extension does not support `expo-updates` as it causes the share extension to crash. Since version `1.5.0`, `expo-updates` is excluded from the share extension's bundle by default. If you're using an older version, you must exclude it by adding it to the `excludedPackages` option in your `app.json`/`app.config.(j|t)s`. See the [Exlude Expo Modules](#exlude-expo-modules) section for more information.

### React Native Firebase

Using [React Native Firebase](https://rnfirebase.io/)? Given that share extensions are separate iOS targets, they have their own bundle IDs, so we need to create a _dedicated_ GoogleService-Info.plist in the Firebase console, just for the share extension target. The bundle ID of your share extension is your existing bundle ID with `.ShareExtension` as the suffix, e.g. `com.example.app.ShareExtension`.

```json
[
  "expo-share-extension",
    {
      "googleServicesFile": "./path-to-your-separate/GoogleService-Info.plist",
    },
],
```

You can share a firebase auth session between your main app and the share extension by using the [`useUserAccessGroup` hook](https://rnfirebase.io/reference/auth#useUserAccessGroup). The value for `userAccessGroup` is your main app's bundle ID with the `group.` prefix, e.g. `group.com.example.app`. For a full example, check [this](examples/with-firebase/README.md).

### Custom Background Color

Want to customize the share extension's background color? Add the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "backgroundColor": {
        "red": 255,
        "green": 255,
        "blue": 255,
        "alpha": 0.8 // if 0, the background will be transparent
      },
    },
],
```

### Custom Height

Want to customize the share extension's height? Do this in your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "height": 500
    },
],
```

### Custom Fonts

This plugin automatically adds custom fonts to the share extension target if they are [embedded in the native project](https://docs.expo.dev/develop/user-interface/fonts/#embed-font-in-a-native-project) via the `expo-font` config plugin.

It currently does not support custom fonts that are [loaded at runtime](https://docs.expo.dev/develop/user-interface/fonts/#load-font-at-runtime), due to an `NSURLSesssion` [error](https://stackoverflow.com/questions/26172783/upload-nsurlsesssion-becomes-invalidated-in-sharing-extension-in-ios8-with-error). To fix this, Expo would need to support defining a [`sharedContainerIdentifier`](https://developer.apple.com/documentation/foundation/nsurlsessionconfiguration/1409450-sharedcontaineridentifier) for `NSURLSessionConfiguration` instances, where the value would be set to the main app's and share extension's app group identifier (e.g. `group.com.example.app`).

### Preprocessing JavaScript

As explained in [Accessing a Webpage](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/ExtensionScenarios.html#//apple_ref/doc/uid/TP40014214-CH21-SW12), we can use a JavaScript file to preprocess the webpage before the share extension is activated. This is useful if you want to extract the title and URL of the webpage, for example. To use this feature, add the following to your `app.json`/`app.config.(j|t)s`:

```json
[
  "expo-share-extension",
    {
      "preprocessingFile": "./preprocessing.js"
    },
],
```

The `preprocessingFile` option adds [`NSExtensionActivationSupportsWebPageWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportswebpagewithmaxcount) as an `NSExtensionActivationRule`. Your preprocessing file must adhere to some rules:

1. You must create a class with a `run` method, which receives an object with a `completionFunction` method as its argument. This `completionFunction` method must be invoked at the end of your `run` method. The argument you pass to it, is what you will receive as the `preprocessingResults` object as part of initial props.

```javascript
class ShareExtensionPreprocessor {
  run(args) {
    args.completionFunction({
      title: document.title,
    });
  }
}
```

2. Your file must create an instance of a class using `var`, so that it is globally accessible.

```javascript
var ExtensionPreprocessingJS = new ShareExtensionPreprocessor();
```

For a full example, check [this](examples/with-preprocessing/README.md).

**WARNING:** Using this option enables [`NSExtensionActivationSupportsWebPageWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportswebpagewithmaxcount) and this is mutually exclusive with [`NSExtensionActivationSupportsWebURLWithMaxCount: 1`](https://developer.apple.com/documentation/bundleresources/information_property_list/nsextension/nsextensionattributes/nsextensionactivationrule/nsextensionactivationsupportsweburlwithmaxcount), which `expo-share-extension` enables by default. This means that once you set the `preprocessingFile` option, you will no longer receive `url` as part of initial props. However, you can still get the URL via `preprocessingResults` by using `window.location.href` in your preprocessing file:

```javascript
class ShareExtensionPreprocessor {
  run(args) {
    args.completionFunction({
      url: window.location.href,
      title: document.title,
    });
  }
}
```

## Development

If you want to contribute to this project, you can use the example app to test your changes. Run the following commands to get started:

1. Start the expo module build in watch mode: `npm run build`
2. Start the config plugin build in watch mode: `npm run build plugin`
3. `cd /example` and generate the iOS project: `npm run prebuild`
4. Run the app from the /example folder: `npm run ios`

### Troubleshooting

#### Command PhaseScriptExecution failed with a nonzero exit code

If you encounter this error when building your app in XCode and you use yarn as a package manager, it is most likely caused by XCode using the wrong node binary. To fix this, navigate into your project's ios directory and replace the contents in the `.xcode.env.local` file with the contents of the `.xcode.env` file.

#### Clear XCode Cache

1. navigate to `~/Library/Developer/Xcode/DerivedData/`
2. `rm -rf` folders that are prefixed with your project name

#### Clear CocoaPods Cache

1. `pod cache clean --all`
2. `pod deintegrate`

#### Attach Debugger to Share Extension Process:

1. In XCode in the top menu, navigate to Debug > Attach to Process.
2. In the submenu, you should see a list of running processes. Find your share extension's name in this list. If you don't see it, you can try typing its name into the search box at the bottom.
3. Once you've located your share extension's process, click on it to attach the debugger to that process.
4. With the debugger attached, you can also set breakpoints within your share extension's code. If these breakpoints are hit, Xcode will pause execution and allow you to inspect variables and step through your code, just like you would with your main app.

#### Check Device Logs

1. Open the Console app from the Applications/Utilities folder
2. Select your device from the Devices list
3. Filter the log messages by process name matching your share extension target name

#### Check Crash Logs

1. On your Mac, open Finder.
2. Select Go > Go to Folder from the menu bar or press Shift + Cmd + G.
3. Enter ~/Library/Logs/DiagnosticReports/ and click Go.
4. Look for any recent crash logs related to your share extension. These logs should have a .crash or .ips extension.

## Credits

This project would not be possible without existing work in the react native ecosystem. I'd like to give credit to the following projects and their authors:

- https://github.com/Expensify/react-native-share-menu
- https://github.com/andrewsardone/react-native-ios-share-extension
- https://github.com/alinz/react-native-share-extension
- https://github.com/ajith-ab/react-native-receive-sharing-intent
- https://github.com/timedtext/expo-config-plugin-ios-share-extension
- https://github.com/achorein/expo-share-intent-demo
- https://github.com/andrewsardone/react-native-ios-share-extension
- https://github.com/EvanBacon/pillar-valley/tree/master/targets/widgets
- https://github.com/andrew-levy/react-native-safari-extension
- https://github.com/bndkt/react-native-app-clip
