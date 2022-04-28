document.addEventListener('DOMContentLoaded', function (event) {
	clickAnchors();
	checkAgree();
	initModalPlaceholder();
	moveElements();
	fixedHeader();
	lazyLoad();
	pageUp();
	loadScript('libs/masking/script.js', () => { masking.init(); submitForm.init(); });
	loadScript('libs/fancybox/script.js', () => { Fancybox.defaults.dragToClose = false; Fancybox.defaults.Hash = false; });
	loadScript('libs/wow/script.js', () => new WOW({ offset: 100 }).init());
	loadScript('libs/swiper/script.js', initSwiper);
	loadScript('libs/loadPage/script.js', () => loadPage.init());
	loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', setMap);
});

document.addEventListener('scroll', function (event) {
	fixedHeader();
	pageUp();
	lazyLoad();
});

window.addEventListener('resize', function (event) {
	moveElements();
});

function initSwiper() {
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
	try {
		ymaps.ready(() => {
			maps = document.querySelectorAll('.map');
			if (!maps) return;
			for (let mapContainer of maps) {
				let id = mapContainer.getAttribute('id'),
					data = mapContainer.dataset,
					mapCenter = JSON.parse(data.center),
					mapCoord = data.coord ? JSON.parse(data.coord) : mapCenter,
					mapZoom = data.zoom,
					mapTitle = data.title,
					map = new ymaps.Map(id, {
						center: mapCenter,
						zoom: mapZoom,
						controls: ['smallMapDefaultSet']
					}),
					pin = new ymaps.Placemark(mapCoord, {
						hintContent: mapTitle
					}, {
						iconLayout: 'default#image'
					});
				map.behaviors.disable(['scrollZoom']);
				map.geoObjects.add(pin);
				setMapCenter();
				function setMapCenter() {
					(mapContainer.offsetWidth < 992) ? map.setCenter(mapCoord) : map.setCenter(mapCenter);
				}
				window.addEventListener('resize', setMapCenter);
			}
		});
	} catch (e) {
		console.log('Yandex Map is not initiated');
	}
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
	fixedHeader.setAttribute('id', 'fixedHeader');
	fixedHeader.classList.add('fixed-header');
	fixedHeader.classList.add('mmo-item');
	if (!fixedHeaderElement) document.body.prepend(fixedHeader);
	if (scrollPosition > headerHeight + offset) {
		setTimeout(() => fixedHeader.classList.add(activeClass), 0);
	}
	else {
		if (!fixedHeader) return;
		fixedHeader.classList.remove(activeClass);
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

//lazyLoad
async function lazyLoad() {
	let images, image, srcset, position, lazyClass, img;
	lazyClass = 'img_ll';
	images = document.querySelectorAll(`.${lazyClass}`);
	if (!images) return;
	for (image of images) {
		img = image.querySelector('img');
		if (!img) continue;
		srcset = img.dataset.srcset;
		if (!srcset || !img.srcset) continue;
		position = image.getBoundingClientRect();
		if ((window.innerHeight - position.top) < 0 || position.bottom < 0) continue;
		img.srcset = srcset;
		img.onload = function () {
			img.removeAttribute('data-srcset');
			image.classList.remove(lazyClass);
		};
	}
}
//lazyLoad