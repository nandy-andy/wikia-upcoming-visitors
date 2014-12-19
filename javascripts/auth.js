window.STATE = {
	authorized: {
		success: false,
		error: null
	}
};

function auth() {
	var config = {
		'client_id': '671827949894-b6eoa7u39g5cpecn0n42h2vqgh8sv0au.apps.googleusercontent.com',
		'scope': 'https://www.googleapis.com/auth/calendar.readonly'
	};

	gapi.auth.authorize(config, function(authResult) {
		if (authResult && !authResult.error) {
			window.STATE.authorized.success = true;
		} else {
			window.STATE.authorized.success = false;
			window.STATE.authorized.error = authResult.error;
		}
	});
}
