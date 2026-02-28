const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * An Expo Config Plugin to dynamically inject the Android package name 
 * directly into the AndroidManifest.xml root tag during `npx expo prebuild`.
 * This cleanly fixes the React Native autolinking fallback bug.
 */
module.exports = function withAndroidNamespace(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        // Ensure the root manifest object exists
        if (!androidManifest.manifest) {
            androidManifest.manifest = {};
        }
        if (!androidManifest.manifest.$) {
            androidManifest.manifest.$ = {};
        }

        // Inject the exact package name explicitly defined in app.config.js
        if (config.android && config.android.package) {
            androidManifest.manifest.$['package'] = config.android.package;
        }

        return config;
    });
};
