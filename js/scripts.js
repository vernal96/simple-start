const ACTIVE_CLASS = 'is-active';
const TEMPLATE_PATH = '/';

window.addEventListener('load', () => {
	initSvgViewBox();
});

document.addEventListener('DOMContentLoaded', function () {
	fastLoadPage();
	clickAnchors();
	pageUp();
	globalFunctions();
	checkAgree();
	setFancyboxDefaults();
	initModalPlaceholder();
	initViberLink();
	new WOW({ offset: 100 }).init();
	loadScript(window.location.protocol + '//api-maps.yandex.ru/2.1/?lang=ru_RU', setMap);
});

document.addEventListener('scroll', function () {
	fixedHeader();
	pageUp();
});

window.addEventListener('resize', function () {
	moveElements();
});

function setFancyboxDefaults() {
	Fancybox.defaults.dragToClose = false;
	Fancybox.defaults.Hash = false;
	Fancybox.defaults.autoFocus = false;
}

function initSwiper() {
	Swiper.defaults.speed = 1000;
	Swiper.defaults.allowTouchMove = false;
	Swiper.defaults.rewind = true;
}

function globalFunctions() {
	moveElements();
	initSwiper();
	setPhonesMask();
	setCustomSelect();
}

function setMap() {
	try {
		ymaps.ready(() => {
			for (let mapContainer of document.querySelectorAll('.map')) {
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