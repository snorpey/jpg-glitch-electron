# JPG Glitch Electron

> An app for glitching images

![Windows Screenshot](assets/screenshots/mac/01.png)

You can use this app to transform images so that appear glitched.

This is a hybrid desktop / progressive web app for [jpg-glitch](https://snorpey.github.io/jpg-glitch).

You can either download a standalone app for your (desktop) operating or just open it in your browser: [
JPG Glitch](https://snorpey.github.io/jpg-glitch-electron)

## Download
The following operating systems are supported:

_Please note:_ This software hasn't been extensively tested. Please [report](../../issues) any bugs you might encounter.

* [Windows](https://github.com/snorpey/jpg-glitch-electron/releases/download/0.0.4/JPG.Glitch.Setup.0.0.4.exe)
* [macOS](https://github.com/snorpey/jpg-glitch-electron/releases/download/0.0.4/JPG.Glitch-0.0.4.dmg)
* Linux: [AppImage](https://github.com/snorpey/jpg-glitch-electron/releases/download/0.0.4/JPG.Glitch.0.0.4.AppImage) / [deb](https://github.com/snorpey/jpg-glitch-electron/releases/download/0.0.4/jpg-glitch-electron_0.0.4_amd64.deb) / [snap](https://github.com/snorpey/jpg-glitch-electron/releases/download/0.0.4/jpg-glitch-electron_0.0.4_amd64.snap) / [tar.gz](https://github.com/snorpey/jpg-glitch-electron/releases/download/0.0.4/jpg-glitch-electron-0.0.4.tar.gz)


### Development

The app is built using [vue-cli-plugin-electron-builder](https://nklayman.github.io/vue-cli-plugin-electron-builder).

#### Build Setup

This project has `node-canvas` as a dependency, which requires additional software to be installed.

``` bash
# install dependencies
npm install

# serve pwa with hot reload
npm run pwa:serve

# serve electron with hot reload
npm run electron:serve

# build the pwa and electron apps for production
npm run build

```

You can find installation instructions for building `node-canvas` are [here](https://github.com/Automattic/node-canvas), and special ones for windows [here](https://github.com/Automattic/node-canvas/wiki/Installation---Windows#install-with-chocolatey). 

These instructions may or may not work for you on the first try. If in doubt, delete the `node_modules` directory start a fresh install with `npm install`, and google any error messages. With persistance, you'll get there eventually.

When building on Linux, ensure that `snapcraft` and `snap core` are available and installed (or comment out the `snap` target entry in `vue.config.js`).
