document.addEventListener('DOMContentLoaded', function() {
	// Initialize the app
	console.log('App initialized');

	const postWrapper = document.getElementById('postwrapper');
	const subreddits = {};

	async function fetchData(subredditName, url) {
		const loadingElement = document.getElementById('loading');
		loadingElement.classList.remove('hidden');

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}

			const json = await response.json();
			addToSubredditList(subredditName, json)
			console.log(json);
		} catch (error) {
			console.error(error.message);
		} finally {
			loadingElement.classList.add('hidden');
		}
	}

	function addToSubredditList(subredditName, json) {
		subreddits[subredditName] = json;
	}

	function createSubredditColumn(subredditName) {
		const column = document.createElement('div');
		column.className = 'flex-1 flex flex-col border-r min-w-[300px]';
		column.innerHTML = `
    <div class="flex items-center justify-between p-4 border-b relative">
      <h2 class="text-lg">/r/${subredditName}</h2>
      <button class="more-options-btn">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
					<circle cx="12" cy="12" r="1"></circle>
					<circle cx="12" cy="5" r="1"></circle>
					<circle cx="12" cy="19" r="1"></circle>
				</svg>
			</button>
      <div class="dropdown-menu hidden absolute mt-8 right-0 w-40 rounded-xl border-2 bg-white z-10 top-10">
        <div class="py-3 px-4 cursor-pointer hover:bg-gray-50 refresh-button">Refresh</div>
        <div class="py-3 px-4 cursor-pointer hover:bg-gray-50 delete-button">Delete</div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto max-h-[300px]">
      ${subreddits[subredditName].data.children.map(post => `
        <div class="flex items-start p-4 border-b hover:bg-gray-50 cursor-pointer">
          <div class="flex flex-col items-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="m18 15-6-6-6 6"></path>
            </svg>
            <span class="text-lg">${post.data.ups}</span>
          </div>
          <p>${post.data.title}</p>
        </div>
      `).join('')}
    </div>
  `;

		// Add event listener to the more options button
		const moreOptionsBtn = column.querySelector('.more-options-btn');

		moreOptionsBtn.addEventListener('click', function(e) {
			e.stopPropagation();
			// Close all other dropdowns
			closeDropdowns.call(this);
			// Toggle this dropdown
			toggleDropdown.call(this);
		});

		const removeButton = column.querySelector('.delete-button');

		removeButton.addEventListener('click', function(e) {
			e.stopPropagation();
			removeSubredditColumn(column, subredditName);
		});

		const refreshButton = column.querySelector('.refresh-button');

		refreshButton.addEventListener('click', function(e) {
			e.stopPropagation();
			refreshSubredditColumn(subredditName);
		});

		return column;
	}

	function refreshSubredditColumn(subredditName) {
		console.log('refresh');
		const subredditUrl = `https://www.reddit.com/r/${subredditName}.json`;
		fetchData(subredditName, subredditUrl);
	}

	function removeSubredditColumn(column, subredditName) {
		if (column) {
			column.remove();
			delete subreddits[subredditName];
		}
	}

	function toggleDropdown() {
		console.log('this', this);
		this.nextElementSibling.classList.toggle('hidden');
	}

	function closeDropdowns() {
		document.querySelectorAll('.dropdown-menu').forEach(menu => {
			if (menu !== this.nextElementSibling) {
				menu.classList.add('hidden');
			}
		});
	}

	// Close dropdowns when clicking elsewhere
	document.addEventListener('click', function() {
		document.querySelectorAll('.dropdown-menu').forEach(menu => {
			menu.classList.add('hidden');
		});
	});

	// Show subreddit dialog
	document.getElementById('add-subreddit-btn').addEventListener('click', function() {
		document.getElementById('subreddit-dialog').classList.remove('hidden');
		document.getElementById('popup-subreddit-input').focus();
	});

	// Close dialog when clicking outside
	document.getElementById('subreddit-dialog').addEventListener('click', function(e) {
		if (e.target === this) {
			this.classList.add('hidden');
		}
	});

	// Add subreddit from popup
	document.getElementById('popup-add-subreddit').addEventListener('click', async function () {
		const subredditName = document.getElementById('popup-subreddit-input').value.trim();
		const subredditUrl = `https://www.reddit.com/r/${subredditName}.json`;
		const subredditText = document.getElementById('popup-subreddit-text');

		if (subredditName) {
			try {
				await fetchData(subredditName, subredditUrl);
				postWrapper.appendChild(createSubredditColumn(subredditName));
				document.getElementById('popup-subreddit-input').value = '';
				document.getElementById('subreddit-dialog').classList.add('hidden');
			} catch (error) {
				subredditText.textContent = 'Error fetching subreddit';
				document.getElementById('popup-subreddit-input').value = '';
				console.error('Error fetching subreddit:', error);
			}
		}
	});
});
