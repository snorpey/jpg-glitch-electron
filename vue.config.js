module.exports = {
	// configureWebpack: {
	// 	// Configuration applied to all builds
	// },
	pluginOptions: {
		pwa: {
			themeColor: '#333333',
			msTileColor: '#333333',
			appleMobileWebAppCapable: true,
			appleMobileWebAppStatusBarStyle: 'default',
			iconPaths: {
				favicon32: 'img/icons/favicon-32x32.png',
				favicon16: 'img/icons/favicon-16x16.png',
				favicon192: 'img/icons/android-chrome-192x192.png',
				favicon512: 'img/icons/android-chrome-512x512.png',
				appleTouchIcon: 'img/icons/apple-touch-icon.png',
				maskIcon: 'img/icons/safari-pinned-tab.svg',
				msTileImage: 'img/icons/mstile-150x150.png'
			}
		},
		electronBuilder: {
			chainWebpackMainProcess: config => {
				// Chain webpack config for electron main process only
			},
			chainWebpackRendererProcess: config => {
				// Chain webpack config for electron renderer process only
				// The following example will set IS_ELECTRON to true in your app
				config
					.plugin( 'define' )
					.tap( args => {
						args[0]['IS_ELECTRON'] = true
						return args;
					} )
			},
			builderOptions: {
				"productName": "JPG Glitch",
				"appId": "com.snorpey.jpg-glitch-electron",
				"copyright": "Copyright (c) 2018 - 2019 Georg Fischer <hi@snorpey.com>",
				"directories": {
					"output": "build"
				},
				"dmg": {
				  "contents": [
					{
						"x": 410,
						"y": 150,
						"type": "link",
						"path": "/Applications"
					},
					{
						"x": 130,
						"y": 150,
						"type": "file"
					}
				  ]
				},
				"mac": {
					"icon": "build/icons/icon.icns"
				},
				"win": {
					"icon": "build/icons/icon.ico"
				},
				"deb": {
					"packageCategory": "graphics",
					"priority": "optional"
				},
				"linux": {
					"target": [
						"AppImage",
						"snap",
						"deb",
						"tar.gz"
					],
					// "icon": "build/icons",
					"category": "Graphics",
					"desktop": {
						"Type": "Application",
						"Name": "JPG Glitch",
						"Comment": "An application for glitching images"
					}
				},
				"snap": {
					"confinement": "classic",
					"grade": "stable",
					"summary": "An application for glitching images"
				}
			},
			// Use this to change the entrypoint of your app's main process
			// mainProcessFile: 'src/background.js',
			// Provide an array of files that, when changed, will recompile the main process and restart Electron
			// Your main process file will be added by default
			// mainProcessWatch: ['src/myFile1', 'src/myFile2'],
			// [1.0.0-rc.4+] Provide a list of arguments that Electron will be launched with during "electron:serve",
			// which can be accessed from the main process (src/background.js).
			// Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
			// Command line args (excluding --debug, --dashboard, and --headless) are passed to Electron as well
			// mainProcessArgs: ['--arg-name', 'arg-value']
		}
	}
}