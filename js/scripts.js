document.addEventListener('DOMContentLoaded', function (event) {
	clickAnchors();
	checkAgree();
	initModalPlaceholder();
	moveElements();
	fixedHeader();
	pageUp();
	loadScript('libs/masking/script.js', () => { masking.init(); /*submitForm.init();*/ });
	loadScript('libs/fancybox/script.js', () => { Fancybox.defaults.dragToClose = false; });
	loadScript('libs/wow/script.js', () => new WOW().init());
	loadScript('libs/carousel/script.js', initCarousel);
	loadScript('libs/carousel/autoplay.js');
	loadScript('http://api-maps.yandex.ru/2.1/?lang=ru_RU', setMap);
});

document.addEventListener('scroll', function (event) {
	fixedHeader();
	pageUp();
});

window.addEventListener('resize', function (event) {
	moveElements();
});

function initCarousel() {
}

async function loadScript(src, func = false) {
	let script = document.createElement('script');
	script.src = src;
	document.body.append(script);
	if (func) script.onload = () => func();
}

function checkAgree() {
	let confirmElement = 'input[data-form-confirm]',
		parentElement = 'form',
		queryElement = '[type=submit]';
	for (let agree of document.querySelectorAll(confirmElement)) {
		if (!agree.checked) for (let submit of agree.closest(parentElement).querySelectorAll(queryElement)) submit.disabled = true;
		agree.addEventListener('change', function (event) {
			if (agree.checked) for (let submit of agree.closest(parentElement).querySelectorAll(queryElement)) submit.disabled = false;
			else for (let submit of agree.closest(parentElement).querySelectorAll(queryElement)) submit.disabled = true;
		});
	}
}

function clickAnchors() {
	for (let anchor of document.querySelectorAll('[href*="#"]')) {
		anchor.addEventListener('click', function (event) {
			event.preventDefault();
			let id = anchor.getAttribute('href');
			if (id == '#') return;
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		});
	}
}

//Modal
function initModalPlaceholder() {
	for (let modalInit of document.querySelectorAll('[data-fancybox][data-src*="#"]')) {
		modalInit.addEventListener('click', function (event) {
			let element = event.target,
				prefix = '.modal__',
				data = element.dataset,
				modalObject = document.querySelector(data.src);
			if (!modalObject) return;
			for (let defaultElement of modalObject.querySelectorAll('[data-default]')) {
				let defaultValue = defaultElement.dataset.default;
				if (defaultElement.nodeName.toLowerCase() == 'input') defaultElement.value = defaultValue;
				else defaultElement.innerHTML = defaultValue;
			}
			for (let dataItem in data) {
				let element = prefix + dataItem,
					input = 'input[name="' + dataItem + '"]',
					modalInputElement;
				if (modalInputElement = modalObject.querySelector(input)) modalInputElement.value = data[dataItem];
				if (modalInputElement = modalObject.querySelector(element)) modalInputElement.innerHTML = data[dataItem];
			}
		});
	}
}
//Modal

//moveElement
function moveElements() {
	for (let moveElement of document.querySelectorAll('[data-move]')) {
		let data = moveElement.dataset,
			windowWidth = window.innerWidth,
			element,
			dataSize = (data.size) ? +data.size : 576,
			dataBreak = (data.break) ? +data.break : windowWidth - 1,
			dataToElement = document.querySelector(data.to);
		if (!dataToElement) return;
		if (windowWidth < dataSize && windowWidth > dataBreak) {
			element = moveElement.innerHTML;
			if (!element) return;
			moveElement.innerHTML = '';
			dataToElement.innerHTML = element;
		}
		else {
			element = dataToElement.innerHTML;
			if (!element) return;
			dataToElement.innerHTML = '';
			moveElement.innerHTML = element;
		}
	}
}
//moveElement

//Map
function setMap() {
	ymaps.ready(() => {
		for (let mapContainer of document.querySelectorAll('.map')) {
			let id = mapContainer.getAttribute('id'),
				data = mapContainer.dataset,
				mapCenter = JSON.parse(data.center),
				mapZoom = data.zoom,
				mapTitle = data.title,
				map = new ymaps.Map(id, {
					center: mapCenter,
					zoom: mapZoom,
					controls: ['smallMapDefaultSet']
				}),
				pin = new ymaps.Placemark(mapCenter, {
					hintContent: mapTitle
				}, {
					iconLayout: 'default#image'
					// iconImageHref: '../img/ico/map_marker.png',
					// iconImageSize: [45, 56],
					// iconImageOffset: [-22, -56]
				});
			map.geoObjects.add(pin);
		}
	});
}
//Map

//FixedHeader
function fixedHeader() {
	let header = document.getElementById('mainHeader');
	if (!header) return;
	let headerHeight = header.offsetHeight,
		activeClass = 'is-active',
		offset = 50,
		scrollPosition = window.pageYOffset,
		fixedHeaderElement = document.getElementById('fixedHeader'),
		fixedHeader = fixedHeaderElement ? fixedHeaderElement : header.cloneNode(true);
	if (scrollPosition > headerHeight + offset) {
		fixedHeader.setAttribute('id', 'fixedHeader');
		fixedHeader.classList.add('fixed-header');
		if (!fixedHeaderElement) document.body.prepend(fixedHeader);
		setTimeout(() => fixedHeader.classList.add(activeClass), 0);
	}
	else {
		if (!fixedHeader) return;
		fixedHeader.classList.remove(activeClass);
		setTimeout(() => fixedHeader.remove(), 300);
	}
}
//FixedHeader

//Pageup
function pageUp() {
	let pageUpBtn = document.getElementById('pageup'),
		topShow = 280,
		activeClass = 'is-active',
		scrollPosition = window.scrollY,
		documentFooter = document.querySelector('footer');
	if (!pageUpBtn) return;
	footerHeight = documentFooter ? documentFooter.offsetHeight : 0;
	if (scrollPosition > topShow && scrollPosition < document.body.offsetHeight - window.innerHeight - footerHeight) pageUpBtn.classList.add(activeClass);
	else pageUpBtn.classList.remove(activeClass);
}
//Pageup