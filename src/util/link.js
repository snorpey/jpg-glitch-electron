import { shell } from 'electron';

export function openLink ( url ) {
	shell.openExternal( url );
}