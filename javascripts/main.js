var request,
	events = [],
	calendarId = 'wikia-inc.com_4ch01et6e58vbfr2on5575alu8@group.calendar.google.com',

	today = new Date(),
	days = 30,
	future = new Date(today.getTime() + days*24*60*60*1000),
	resultsDiv = document.getElementById('results');

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
	results.forEach(function(event) {
		var matches = event.summary.match('(.{1,}) in (.{1,})');

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

	if( events.length = 0 ) {
		showError('It seems no one is traveling in next 30 days.');
	} else {
		displayResults();
	}

	hideLoader();
}

function displayResults() {
	console.log(events);
	var p = document.createElement('p');

	events.forEach(function(event) {
		p.appendChild(document.createTextNode(event.who + ' is in ' + event.where + '(' + event.start + ' - ' + event.end + ')'));
		resultsDiv.appendChild(p);
	});
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
