# How to Build an Ionic Chat App

Read the full tutorial here: [**>> How to Build an Ionic Chat App**](https://www.cometchat.com/tutorials/#)

[Live Demo]()

This example shows How to Build an Ionic Chat App:

## Technology

This demo uses:

- CometChat
- Ionic
- Capacitor
- Chooser
- Image Picker
- Firebase
- React
- Uuid
- Validator

## Running the demo

To run the demo follow these steps:

1. [Head to CometChat Pro and create an account](https://app.cometchat.com/signup)
2. From the [dashboard](https://app.cometchat.com/apps), add a new app called **"ionic-chat-app"**
3. Select this newly added app from the list.
4. From the Quick Start copy the **APP_ID, APP_REGION and AUTH_KEY**. These will be used later.
5. Also copy the **REST_API_KEY** from the API & Auth Key tab.
6. Navigate to the Users tab, and delete all the default users and groups leaving it clean **(very important)**.
7. Download the repository [here](https://github.com/hieptl/ionic-chat-app/archive/main.zip) or by running `git clone https://github.com/hieptl/ionic-chat-app.git` and open it in a code editor.
8. [Head to Firebase and create a new project](https://console.firebase.google.com)
9. Create a file called **env** in the root folder of your project.
10. Import and inject your secret keys in the **env** file containing your CometChat and Firebase in this manner.

```js
REACT_APP_FIREBASE_API_KEY=xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx

REACT_APP_COMETCHAT_APP_ID=xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
REACT_APP_COMETCHAT_REGION=xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
REACT_APP_COMETCHAT_AUTH_KEY=xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx
```

11. Install capacitor cli with version 2.4.1

```js
npm install -g @capacitor/cli@2.4.1
```

12. Install ionic cli

```js
npm install -g @ionic/cli
```

12. cd to your root folder and hit npm i to install the packages.
13. Run the following statement.

```js
cap sync
```

14. Run cd to the ios/App folder then run pod install to install the pods. Once pods are installed run cd .. to go back to the root folder.
15. build the project by running the following statement.

```js
ionic build
```

16. Copy the build folder to your native platform

```js
cap copy
```

17. Make sure to include .env file in your gitIgnore file from being exposed online.
18. Run the project by using Android Studio/Xcode. Fore more information you can refer to the [Ionic documentation](https://ionicframework.com/docs/intro/cli)

Questions about running the demo? [Open an issue](https://github.com/hieptl/react-native-gifted-chat-app/issues). We're here to help ✌️

## Useful links

- 🏠 [CometChat Homepage](https://app.cometchat.com/signup)
- 🚀 [Create your free account](https://app.cometchat.com/apps)
- 📚 [Documentation](https://prodocs.cometchat.com)
- 👾 [GitHub](https://www.github.com/cometchat-pro)
- 🔥 [Firebase](https://console.firebase.google.com)
- 🔷 [Ionic](https://ionicframework.com)