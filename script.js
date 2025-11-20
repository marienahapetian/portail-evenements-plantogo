async function getEvents(url) {
	let response = await fetch(url);

	if (!response.ok) {
		throw new Error("Could not fetch events");
	}

	let data = await response.json();

	if (!data) {
		throw new Error("Could not fetch events");
	}

	console.log("data", data);

	let eventsToShow = data.events;
	let totalEventsCount = data.total;
	let pages = data.total_pages;
	let nextPageUrl = data.next_rest_url;

	console.log("events", eventsToShow);

	eventsToShow.forEach((event) => {
		let card = document.createElement("div");
		card.className = "card";
		let date = new Date(event.date);
		let venue = event.venue.venue ? event.venue.venue : event.is_virtual ? "Virtual" : "No venue";
		card.innerHTML = `<div><h2>${event.title}</h2><p>Date: ${date.toLocaleDateString()}</p><p>Lieu: ${venue}</p></div>`;

		let buttonsCont = document.createElement("div");
		buttonsCont.className = "flex";
		buttonsCont.classList.add("dir-col");
		let viewButton = document.createElement("button");
		viewButton.className = "view";
		viewButton.textContent = "Afficher les détails";
		viewButton.addEventListener("click", viewEvent);

		let addButton = document.createElement("button");
		addButton.className = "add";
		addButton.textContent = "Ajouter";
		addButton.addEventListener("click", addEvent);

		buttonsCont.appendChild(viewButton);
		buttonsCont.appendChild(addButton);

		card.appendChild(buttonsCont);
		eventsContainer.appendChild(card);
	});

	loadMore.innerHTML = "";

	if (currPage < pages) {
		let loadMoreButton = document.createElement("button");
		loadMoreButton.textContent = "Voir plus";
		loadMoreButton.addEventListener("click", function () {
			currPage++;
			getEvents(nextPageUrl);
		});
		loadMore.appendChild(loadMoreButton);
	}
}

function viewEvent() {}

function addEvent() {}

let currPage = 1;
let eventsContainer = document.getElementById("allevents");
let loadMore = document.getElementById("loadmore");

let url = "https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events";
getEvents(url);
