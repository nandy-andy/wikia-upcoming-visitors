(function(){
	var events = [],
		calendarId = 'wikia-inc.com_4ch01et6e58vbfr2on5575alu8@group.calendar.google.com',

		today = new Date(),
		days = 30,
		future = new Date(today.getTime() + days*24*60*60*1000),
		resultsDiv = document.getElementById('results');

	function getCalendarEvents() {
		gapi.client.load('calendar', 'v3', function() {
			var request = gapi.client.calendar.events.list({
				'calendarId': calendarId,
				'timeMin': today.toISOString(),
				'timeMax': future.toISOString(),
				'orderBy': startTime
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
		results.forEach(function(event) {
			var matches = event.summary.match('(.{1,}) in (.{1,})'),
				newEventObj;

			if( matches ) {
				events.push({
					who: matches[1],
					where: matches[2],
					summary: event.summary,
					start: event.start.date,
					end: event.end.date
				});
			}
		});

		hideLoader();
		displayResults();
	}

	function displayResults() {
		if( events.length === 0 ) {
			showError('It seems no one is traveling in next 30 days.');
		} else {
			events.forEach(function(event) {
				var p = document.createElement('p'),
					text = event.who + ' is in ' + event.where + ' (' + event.start + ' - ' + event.end + ')';

				p.appendChild(document.createTextNode(text));
				resultsDiv.appendChild(p);
			});
		}
	}

	function hideLoader() {
		resultsDiv.classList.remove('loading');
	}

	function showError(errorMsg) {
		var errorDiv = document.getElementById('error');

		errorDiv.appendChild(document.createTextNode(errorMsg));
		errorDiv.style.display = 'block';
	}

	window.STATE.authorized.watch('success', function(id, oldval, newval) {
		if( newval === true ) {
			getCalendarEvents();
		}
	});
})();