(function(){
	var filteredEvents = [],
		calendarId = 'wikia-inc.com_4ch01et6e58vbfr2on5575alu8@group.calendar.google.com',

		today = new Date(),
		days = 30,
		future = new Date(today.getTime() + days*24*60*60*1000),
		resultsDiv = document.getElementById('results');

	console.log('== resultsDiv ==');
	console.log(resultsDiv);

	console.log('== filteredEvents ==');
	console.log(filteredEvents);

	function getCalendarEvents() {
		gapi.client.load('calendar', 'v3', function() {
			var request = gapi.client.calendar.events.list({
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
		console.log('== results ==');
		console.log(results);

		console.log('== filteredEvents ==');
		console.log(filteredEvents);

		results.forEach(function(event) {
			var matches = event.summary.match('(.{1,}) in (.{1,})'),
				newEventObj;

			if( matches ) {
				console.log('match!');
				newEventObj = {
					who: matches[1],
					where: matches[2],
					summary: event.summary,
					start: event.start.date,
					end: event.end.date
				};

				filteredEvents.push(newEventObj);

				console.log('== newEventObj ==');
				console.log(newEventObj);
				console.log('== filteredEvents ==');
				console.log(filteredEvents);
			}
		});

		console.log('== filteredEvents ==');
		console.log(filteredEvents);

		hideLoader();
		displayResults();
	}

	function displayResults() {
		console.log('== filteredEvents ==');
		console.log(filteredEvents);

		if( filteredEvents.length = 0 ) {
			showError('It seems no one is traveling in next 30 days.');
		} else {
			var p = document.createElement('p');

			filteredEvents.forEach(function(event) {
				console.log(event);

				p.appendChild(document.createTextNode(event.who + ' is in ' + event.where + '(' + event.start + ' - ' + event.end + ')'));
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