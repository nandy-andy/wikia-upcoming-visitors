document.addEventListener("DOMContentLoaded", function() {
	var request,
		events,
		clientId = '671827949894-b6eoa7u39g5cpecn0n42h2vqgh8sv0au.apps.googleusercontent.com',
		calendarId = 'wikia-inc.com_4ch01et6e58vbfr2on5575alu8@group.calendar.google.com',

		today = new Date(),
		days = 30,
		future = new Date(today.getTime() + days*24*60*60*1000),
		resultsDiv = document.getElementById('results');

	function auth() {
		var config = {
			'client_id': clientId,
			'scope': 'https://www.googleapis.com/auth/calendar.readonly'
		};

		gapi.auth.authorize(config, function(authResult) {
			if (authResult && !authResult.error) {
				getCalendarEvents();
			}
		});
	}

	function getCalendarEvents() {
		gapi.client.load('calendar', 'v3', function() {
			request = gapi.client.calendar.events.list({
				'calendarId': calendarId,
				'timeMin': today.toISOString(),
				'timeMax': future.toISOString()
			});

			request.execute(function(resp) {
				if( resp.items ) {
					filterResults(resp.items);
				} else {
					hideLoader();
					showError('No results from API.');
				}
			});
		});
	}

	function filterResults(results) {
		var p = document.createElement('p');

		results.forEach(function(event) {
			var matches = event.summary.match('(.{1,}) in (.{1,})');

			if( matches ) {
				p.appendChild(document.createTextNode(event.summary + ' (' + event.start.date + ' - ' + event.end.date + ')'));
				resultsDiv.appendChild(p);
				events.push(event);
				console.log(event);
			}
		});

		if( events.length = 0 ) {
			p.appendChild(document.createTextNode('It seems no one is traveling in next 30 days.'));
			resultsDiv.appendChild(p);
		}

		console.log(events);

		hideLoader();
	}

	function hideLoader() {
		resultsDiv.classList.remove('loading');
	}

	function showError(errorMsg) {
		var errorDiv = document.getElementById('error');

		errorDiv.appendChild(document.createTextNode(errorMsg));
		errorDiv.style.display = 'block';
	}

	auth();
});
