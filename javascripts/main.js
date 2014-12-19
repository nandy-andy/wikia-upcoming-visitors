(function(){
	var events = [],
		filters = [],
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
				'timeMax': future.toISOString()
			});

			request.execute(function(resp) {
				if( resp.items ) {
					handleResponseItems(resp.items);
				} else {
					hideLoader();
					showError('No results from API.');
				}
			});
		});
	}

	function handleResponseItems(results) {
		results.forEach(function(event) {
			var matches = event.summary.match('(.{1,}) in (.{1,})');

			if( matches ) {
				events.push({
					who: matches[1],
					where: matches[2],
					notes: matches[3] || '',
					summary: event.summary,
					start: event.start.date,
					end: event.end.date
				});
			}
		});

		sortEvents();
		prepareFilteringOptions();

		hideLoader();
		displayFilteringOptions();
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

	function displayFilteringOptions() {
		if( filters.length > 0 ) {
			filters.forEach(function(filter) {
				filter.options.forEach(function(option) {
					var button = document.createElement('button');

					button.dataset.filter = filter.name;
					button.dataset.filterValue = option;

					button.appendChild(document.createTextNode(option));
					resultsDiv.appendChild(button);
				});
			});
		}
	}

	function sortEvents() {
		if( events.length > 0 ) {
			events.sort(function(a, b) {
				if( a.start > b.start ) {
					return 1;
				} else if( a.start < b. start) {
					return -1;
				}

				return 0;
			});
		}
	}

	function prepareFilteringOptions() {
		if( events.length > 0 ) {
			var places = [];

			events.forEach(function(event) {
				if( !places[event.where] ) {
					places[event.where] = true;
				}
			});

			filters.push({
				name: 'Places',
				options: Object.keys(places)
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