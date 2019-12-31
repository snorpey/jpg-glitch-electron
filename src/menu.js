import { remote } from 'electron';
import store from './store';

import { homepage, bugs } from '../package.json';

const { app, Menu } = remote;

console.log( homepage, bugs );

const template = [
	{
		id: 'file',
		label: 'File',
		submenu: [
			{
				id: 'open',
				label: 'Open',
				accelerator: 'CommandOrControl+O',
				click: () => {
					store.dispatch( 'requestToOpenFiles' )
				}
			},
			// {
			// 	id: 'import',
			// 	label: 'Import Image',
			// 	accelerator: 'CommandOrControl+Shift+O',
			// 	click: () => {
			// 		store.dispatch( 'requestToOpenFile' )
			// 	}
			// },
			{
				id: 'save',
				label: 'Save File',
				accelerator: 'CommandOrControl+S',
				click: () => {
					if ( store.getters.activeFile ) {
						store.dispatch( 'saveFile', store.getters.activeFileId );
					}
				}
			},
			{
				id: 'saveas',
				label: 'Save File As',
				accelerator: 'CommandOrControl+Shift+S',
				click: () => {
					if ( store.getters.activeFile ) {
						store.dispatch( 'requestToSaveFileAs', store.getters.activeFileId );
					}
				}
			},
			{
				id: 'export',
				label: 'Export File',
				accelerator: 'CommandOrControl+E',
				click: () => {
					if ( store.getters.activeFile ) {
						store.dispatch( 'requestToExportImage', store.getters.activeFileId );
					}
				}
			}
		]
	},
	// 
	// {
	// 	label: 'Edit',
	// 	submenu: [
	// 		{ role: 'undo' },
	// 		{ role: 'redo' },
	// 		{ type: 'separator'},
	// 		{ role: 'cut' },
	// 		{ role: 'copy' },
	// 		{ role: 'paste'},
	// 		{ role: 'pasteandmatchstyle' },
	// 		{ role: 'delete' },
	// 		{ role: 'selectall' }
	// 	]
	// },
	// {
	// 	label: 'View',
	// 	submenu: [
	// 		{ role: 'reload' },
	// 		{ role: 'forcereload' },
	// 		{ role: 'toggledevtools' },
	// 		{ type: 'separator' },
	// 		{ role: 'resetzoom' },
	// 		{ role: 'zoomin' },
	// 		{ role: 'zoomout' },
	// 		{ type: 'separator' },
	// 		{ role: 'togglefullscreen' }
	// 	]
	// },
	{
		role: 'window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'close' }
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'About',
				click () {
					store.dispatch( 'toggleAbout' );
				}
			},
			{
				label: 'Open Project Website',
				click () { require('electron').shell.openExternal( homepage ) }
			},
			{
				label: 'Report a Bug',
				click () { require('electron').shell.openExternal( bugs ) }
			}
		]
	}
]

if ( process.platform === 'darwin' ) {
	template.unshift({
		label: app.getName(),
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services', submenu: []},
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideothers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	} );

	// template.push( {
	// 	role: 'window',
	// 	submenu: [
	// 		{ role: 'minimize' },
	// 		{ role: 'close' }
	// 	]
	// } );

	// Edit menu
	// template[1].submenu.push(
	// 	{type: 'separator'},
	// 	{
	// 		label: 'Speech',
	// 		submenu: [
	// 			{role: 'startspeaking'},
	// 			{role: 'stopspeaking'}
	// 		]
	// 	}
	// )

	// Window menu
	template[2].submenu = [
		{ role: 'close' },
		{ role: 'minimize' },
		{ role: 'zoom' },
		{ type: 'separator' },
		{ role: 'front' }
	];
}

export const menu = Menu.buildFromTemplate( template );

export function initMenu () {
	Menu.setApplicationMenu( menu );
}
