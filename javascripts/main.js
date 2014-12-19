(function(){
	var events = [],
		filters = [],
		calendarId = 'wikia-inc.com_4ch01et6e58vbfr2on5575alu8@group.calendar.google.com',

		today = moment(),
		future = moment().add(30, 'days'),
		filtersDiv = document.getElementById('filters'),
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
				var newEvent = {
					who: matches[1],
					where: matches[2],
					notes: matches[3] || '',
					summary: event.summary,
					start: event.start.date,
					end: event.end.date
				};

				events.push(newEvent);
			}
		});

		sortEvents();
		prepareFilteringOptions();

		hideLoader();
		displayFilteringOptions();
		displayResults();
	}

	function displayResults(inputEvents) {
		clearResultsDiv();

		var eventsList = inputEvents || events;

		if( eventsList.length === 0 ) {
			showError('It seems no one is traveling in next 30 days.');
		} else {
			eventsList.forEach(function(event) {
				var p = document.createElement('p'),
					text = prepareText(
						event.who,
						event.where,
						event.start,
						event.end,
						event.diff
					);

				p.appendChild(document.createTextNode(text));
				resultsDiv.appendChild(p);
			});
		}
	}

	function prepareText(who, where, start, end, diff) {
		var momentStart = moment(start),
			diffHours = today.diff(momentStart, 'hours'),
			diffDays = today.diff(momentStart, 'days');

		if( diffHours < 0 ) {
			return event.who +
				' will be in ' +
				event.where +
				' in ' +
				diffDays +
				' for ' +
				momentStart.diff(moment(end, 'days')) +
				' days';
		} else {
			return event.who +
			' is in ' +
			event.where +
			' for ' +
			today.diff(moment(end, 'days')) +
			' days';
		}
	}

	function displayFilteringOptions() {
		if( filters.length > 0 ) {
			filters.push({
				name: 'reset',
				options: ['All']
			});

			filters.forEach(function(filter) {
				filter.options.forEach(function(option) {
					var button = document.createElement('button');

					button.dataset.filter = filter.name;
					button.dataset.filterValue = option;

					button.addEventListener('click', function(event) {
						var targetData = event.target.dataset || {filter: 'none', value: null};
						filterEvents(targetData.filter, targetData.filterValue);
					});

					button.appendChild(document.createTextNode(option));
					filtersDiv.appendChild(button);
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

	function filterEvents(filterType, filterValue) {
		if( filterType === 'reset' ) {
			displayResults(events);
		} else {
			var newEvents = events.filter(function (event) {
				return event[filterType] === filterValue;
			});

			displayResults(newEvents);
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
				name: 'where',
				options: Object.keys(places)
			});
		}
	}

	function hideLoader() {
		resultsDiv.classList.remove('loading');
	}

	function clearResultsDiv() {
		while(resultsDiv.firstChild) resultsDiv.removeChild(resultsDiv.firstChild);
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
