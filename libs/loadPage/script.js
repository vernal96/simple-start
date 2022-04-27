loadPage = {
	init: function () {
		for (let a of document.querySelectorAll('a')) {
			if (a.dataset.fancybox != null) continue;
			if (a.getAttribute('href').match(/^#|tel:|mailto:/g)) continue;
			a.addEventListener('click', this.onClick);
		}
	},
	onClick: async function (event) {
		event.preventDefault();
		if (event.target.href == window.location) return;
		loadPage.url = event.target.href;
		fetch(loadPage.url).then(function (response) { return response.text(); }).then(function (response) {
			loadPage.newDocument = document.createElement('html');
			loadPage.newDocument.innerHTML = response;
			loadPage.go();
			loadPage.replaceContent('#main');
		});
	},
	replaceContent(from, to = false) {
		mainBlock = loadPage.newDocument.querySelector(from).innerHTML;
		to = to ? to : from;
		document.querySelector(to).innerHTML = mainBlock;
	},
	go: function (event) {
		history.replaceState(null, document.title, loadPage.url);
		history.pushState({ url: loadPage.url }, document.title, loadPage.url);
	}
};