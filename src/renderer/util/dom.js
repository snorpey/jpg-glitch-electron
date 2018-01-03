export function isDescendant ( parentEl, childEl ) {
	let node = childEl.parentNode;

	while ( node != null ) {
		if ( node == parentEl ) {
			return true;
		}

		node = node.parentNode;
	}

	return false;
}