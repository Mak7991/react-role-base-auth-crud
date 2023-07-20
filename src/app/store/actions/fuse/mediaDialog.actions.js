export const OPEN_MEDIA_DIALOG = '[DIALOG] OPEN';
export const CLOSE_MEDIA_DIALOG = '[DIALOG] CLOSE';

export function closeMediaDialog() {
	return {
		type: CLOSE_MEDIA_DIALOG
	};
}

export function openMediaDialog(options) {
	return {
		type: OPEN_MEDIA_DIALOG,
		options
	};
}
