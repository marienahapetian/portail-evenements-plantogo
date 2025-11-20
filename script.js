String.prototype.cleanDate = function () {
	let date = new Date(this);
	return date.toLocaleDateString();
};
Object.prototype.getVenue = function () {
	return this.venue.venue ? this.venue.venue : this.is_virtual ? "Virtual" : "No venue";
};

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
		card.dataset.id = event.id;
		card.className = "card";
		card.innerHTML = `<div><h2>${event.title}</h2><p>Date: ${event.date.cleanDate()}</p><p>Lieu: ${event.getVenue()}</p></div>`;

		let buttonsCont = document.createElement("div");
		buttonsCont.className = "flex";
		buttonsCont.classList.add("dir-col");
		let viewButton = document.createElement("button");
		viewButton.className = "view";
		viewButton.textContent = "Afficher les détails";
		viewButton.addEventListener("click", viewEvent);

		let addButton = document.createElement("button");
		addButton.className = "add";
		if (eventAlreadyAdded(event.id)) {
			addButton.textContent = "Supprimer";
			addButton.classList.add("remove");
			addButton.addEventListener("click", removeEvent);
		} else {
			addButton.textContent = "Ajouter";
			addButton.addEventListener("click", addEvent);
		}

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

async function getEvent(id) {
	let response = await fetch(url + "/" + id);

	if (!response.ok) {
		throw new Error("Could not fetch event");
	}

	let event = await response.json();

	if (!event) {
		throw new Error("Could not fetch event");
	}

	openModal(event);
}

function openModal(event) {
	popup.firstElementChild.innerHTML = `<div class='img-cont'><img src="${event.image.url}"/></div>`;
	popup.firstElementChild.innerHTML += `<h3>${event.title}</h3>`;
	popup.firstElementChild.innerHTML += `${event.description}`; // already comes wrapped in p
	popup.firstElementChild.innerHTML += `<p><b>Cost:</b> ${event.cost ? event.cost : "Free"}</p>`;
	popup.firstElementChild.innerHTML += `<p><b>Date:</b> ${event.date.cleanDate()}</p>`;
	popup.firstElementChild.innerHTML += `<p><b>Lieu:</b> ${event.getVenue()}</p>`;
	popup.firstElementChild.innerHTML += `<p><b>URL:</b> <a href='${event.url}' target='blank'>${event.url}</a></p>`;

	let closeButton = document.createElement("span");
	closeButton.className = "close";
	closeButton.textContent = "X";
	closeButton.addEventListener("click", hideModal);

	popup.firstElementChild.appendChild(closeButton);

	popup.classList.remove("hidden");
}

function hideModal() {
	popup.firstElementChild.innerHTML = "";
	popup.classList.add("hidden");
}

async function viewEvent(e) {
	let buttonClicked = e.currentTarget;
	let eventId = buttonClicked.parentElement.parentElement.dataset.id;

	let event = await getEvent(eventId);
}

function addEvent(e) {
	let buttonClicked = e.currentTarget;
	let eventId = buttonClicked.parentElement.parentElement.dataset.id;

	let events = getMyEvents();
	console.log(events, eventId);
	events.push(eventId);

	localStorage.setItem("myevents", JSON.stringify(events));

	buttonClicked.removeEventListener("click", addEvent);
	buttonClicked.textContent = "Supprimer";
	buttonClicked.classList.add("remove");
	buttonClicked.addEventListener("click", removeEvent);

	updatePlanning();
}

function removeEvent(e) {
	let buttonClicked = e.currentTarget;
	let eventId = buttonClicked.parentElement.parentElement.dataset.id;

	let events = getMyEvents();
	console.log(events, eventId);
	events.splice(events.indexOf(eventId), 1);

	localStorage.setItem("myevents", JSON.stringify(events));

	buttonClicked.removeEventListener("click", removeEvent);
	buttonClicked.classList.remove("remove");
	buttonClicked.textContent = "Ajouter";
	buttonClicked.addEventListener("click", addEvent);

	updatePlanning();
}

function getMyEvents() {
	return localStorage.getItem("myevents") ? JSON.parse(localStorage.getItem("myevents")) : [];
}

function eventAlreadyAdded(eventId) {
	return getMyEvents().includes(eventId.toString());
}

function switchTheme() {
	var now = new Date();
	var expiryDate = now.setFullYear(now.getFullYear() + 1);
	now.setTime(expiryDate);
	if (document.body.className == "theme-dark") {
		document.body.className = "theme-light";
		document.cookie = "theme=theme-light; expires=" + now.toUTCString() + ";path=/";
	} else {
		document.body.className = "theme-dark";
		document.cookie = "theme=theme-dark; expires=" + now.toUTCString() + ";path=/";
	}
}

function getTheme() {
	return getCookie("theme") ? getCookie("theme") : "theme-light";
}

function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");

	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function updatePlanning() {}

let currPage = 1;
let eventsContainer = document.getElementById("allevents").firstElementChild;
let eventsPage = document.getElementById("allevents");
let planningPage = document.getElementById("myevents");
let loadMore = document.getElementById("loadmore");
let popup = document.getElementById("popup");
let planningToggle = document.getElementById("planning-toggle");
let themeToggle = document.getElementById("theme-toggle");

planningToggle.addEventListener("click", function () {
	if (this.textContent == "Mon Planning") {
		this.textContent = "Toutes les evennements";
		eventsPage.classList.add("hidden");
		planningPage.classList.remove("hidden");
	} else {
		this.textContent = "Mon Planning";
		eventsPage.classList.remove("hidden");
		planningPage.classList.add("hidden");
	}
});

themeToggle.addEventListener("click", switchTheme);

document.body.className = getTheme();

let myEvents = getMyEvents();

console.log("myevents", myEvents);

let url = "https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events";
getEvents(url);
