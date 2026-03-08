import { withAppBuildGradle } from '@expo/config-plugins';
import fs from 'fs';

let buildNumber = 9;
try {
    buildNumber = JSON.parse(fs.readFileSync('./build-number.json', 'utf8')).buildNumber;
} catch (e) {
    console.warn("Could not read build-number.json, defaulting to 9");
}

const baseConfig = {
    "expo": {
        "name": "FlexiList",
        "slug": "flexilist",
        "version": "1.0.1",
        "orientation": "default",
        "icon": "./assets/images/logo.png",
        "scheme": "flexilist",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "ios": {
            "supportsTablet": true,
            "bundleIdentifier": "com.erindshkurti.flexilist",
            "usesAppleSignIn": true,
            "buildNumber": buildNumber.toString(),
            "infoPlist": {
                "ITSAppUsesNonExemptEncryption": false
            }
        },
        "android": {
            "versionCode": buildNumber,
            "adaptiveIcon": {
                "backgroundColor": "#E6F4FE",
                "foregroundImage": "./assets/images/adaptive-icon-foreground.png"
            },
            "package": "com.erindshkurti.flexilist",
            "googleServicesFile": process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
            "buildFeatures": {
                "BuildConfig": true
            },
            "edgeToEdgeEnabled": true,
            "predictiveBackGestureEnabled": false
        },
        "web": {
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        "plugins": [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    "image": "./assets/images/logo.png",
                    "imageWidth": 200,
                    "resizeMode": "contain",
                    "backgroundColor": "#ffffff",
                    "dark": {
                        "backgroundColor": "#000000"
                    }
                }
            ],
            "expo-font",
            "expo-asset",
            "expo-web-browser",
            [
                "@react-native-google-signin/google-signin",
                {
                    "iosClientId": "701865353940-j58jlccnedr3os4cv2du46jleratvh56.apps.googleusercontent.com",
                    "iosUrlScheme": "com.googleusercontent.apps.701865353940-j58jlccnedr3os4cv2du46jleratvh56",
                    "webClientId": "701865353940-0i3bkuu0j8p3qr1mbnok35vikq4ngjck.apps.googleusercontent.com"
                }
            ],
            "expo-apple-authentication"
        ],
        "experiments": {
            "typedRoutes": true,
            "reactCompiler": true
        },
        "extra": {
            "router": {},
            "eas": {
                "projectId": "68db176a-e321-41cb-afe7-60fa91f72d9e"
            }
        }
    }
};

const withFixEntryPointPackageName = (config) => {
    return withAppBuildGradle(config, (config) => {
        const buildGradle = config.modResults.contents;
        const taskInjection = `
// [INJECTED BY EXPO CONFIG PLUGIN: fix-entry-point-package-name]
project.afterEvaluate {
    tasks.all { task ->
        if (task.name.startsWith("generateReactNativeEntryPoint")) {
            task.doLast {
                def entryPointFile = file("\${project.buildDir}/generated/autolinking/src/main/java/com/facebook/react/ReactNativeApplicationEntryPoint.java")
                if (entryPointFile.exists()) {
                    def content = entryPointFile.text
                    def updatedContent = content.replaceAll("if \\\\(com\\\\.flexilist\\\\.BuildConfig", "if (com.erindshkurti.flexilist.BuildConfig")
                    entryPointFile.write(updatedContent)
                    println "Fixed package name in ReactNativeApplicationEntryPoint.java"
                }
            }
        }
    }
}
`;
        if (!buildGradle.includes("fix-entry-point-package-name")) {
            config.modResults.contents = buildGradle + "\\n" + taskInjection;
        }
        return config;
    });
};

export default (config) => withFixEntryPointPackageName(baseConfig);
