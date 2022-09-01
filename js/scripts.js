const ACTIVE_CLASS = 'is-active';
const TEMPLATE_PATH = '/';

window.addEventListener('load', () => {
	initSvgViewBox();
});

document.addEventListener('DOMContentLoaded', function () {
	clickAnchors();
	pageUp();
	globalFunctions();
	checkAgree();
	setFancyboxDefaults();
	initModalPlaceholder();
	new WOW({ offset: 100 }).init();
	loadScript(window.location.protocol + '//api-maps.yandex.ru/2.1/?lang=ru_RU', setMap);
});

document.addEventListener('scroll', function () {
	fixedHeader();
	pageUp();
	lazyLoad();
});

window.addEventListener('resize', function () {
	moveElements();
});

function on(event, object, func = function () { }) {
	document.addEventListener(event, function (e) {
		const eTarget = e.target.closest(object);
		if (eTarget == null) return;
		func.call(eTarget, e);
	});
}

//Устанавливает значения по умолчанию для Fancybox
function setFancyboxDefaults() {
	Fancybox.defaults.dragToClose = false;
	Fancybox.defaults.Hash = false;
	Fancybox.defaults.autoFocus = false;
}

//Функция вызывает все глобальные функции
function globalFunctions() {
	moveElements();
	initSwiper();
}

//Инициализирует все слайдеры
function initSwiper() {
	Swiper.defaults.speed = 1000;
	Swiper.defaults.allowTouchMove = false;
	Swiper.defaults.rewind = true;
}

//Вызвает асинхронные скрипты
async function loadScript(src, func = false) {
	let script = document.createElement('script');
	script.src = src;
	document.body.append(script);
	if (func) script.onload = () => func();
}

function initSvgViewBox() {
	for (let svg of document.querySelectorAll('svg')) {
		if (!svg.querySelector('use') || (svg.getAttribute('viewBox') && svg.viewBox == '0 0 0 0')) continue;
		let size = svg.getBBox(),
			width = Math.round(size.width),
			height = Math.round(size.height);
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
	}
}

// Работает с объектами input типа checkbox, содержащими data-form-confirm. Должен быть потомком элемента .form или form, который содержит submit элементы
function checkAgree() {
	const confirmElementDOM = 'input[data-form-confirm]',
		formDOM = 'form',
		parentFormElementDOM = '.form',
		queryElementDOM = '[type=submit]';
	for (let agree of document.querySelectorAll(confirmElementDOM)) changeAgree(agree);
	on('change', confirmElementDOM, function (e) { changeAgree(this); });
	function changeAgree(object) {
		const parent = object.closest(formDOM) ? object.closest(formDOM) : object.closest(parentFormElementDOM),
			submits = parent.querySelectorAll(queryElementDOM);
		if (!submits) return;
		for (let agree of parent.querySelectorAll(confirmElementDOM)) {
			for (let submit of submits) submit.disabled = false;
			if (!agree.checked) {
				for (let submit of submits) submit.disabled = true;
				break;
			}
		}
	}
}

// Обрабатывает якорные ссылки
function clickAnchors() {
	on('click', 'a[href*="#"]', function (e) {
		e.preventDefault();
		const id = this.getAttribute('href');
		if (id == '#') return;
		document.getElementById(id.substr(1)).scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
}

//Обрабатывает контент модальных окон, которые передаются в парметре data-modal-content.
function initModalPlaceholder(prefix = '.modal__') {
	on('click', '[data-fancybox][data-src*="#"]', function () {
		const element = this,
			data,
			modalObject;
		try {
			data = JSON.parse('{' + element.dataset.modalContent.replaceAll('\'', '"') + '}');
		} catch (error) {
			data = [];
		}
		modalObject = document.querySelector(element.dataset.src);
		if (!modalObject) return;
		for (let defaultElement of modalObject.querySelectorAll('[data-default]')) {
			let defaultValue = defaultElement.dataset.default;
			if (defaultElement.nodeName.toLowerCase() == 'input') defaultElement.value = defaultValue;
			else defaultElement.innerHTML = defaultValue;
		}
		for (let dataItem in data) {
			let element = prefix + dataItem,
				input = 'input[name="' + dataItem + '"]';
			if (modalInputElement = modalObject.querySelector(input)) modalInputElement.value = data[dataItem];
			if (modalInputElement = modalObject.querySelector(element)) modalInputElement.innerHTML = data[dataItem];
		}
	})
}

function moveElements() {

	const preffix = 'movedIn';
	for (let moveElement of document.querySelectorAll('[data-move]')) {
		let data = moveElement.dataset,
			windowWidth = window.innerWidth,
			dataSize = (data.move) ? +data.move : 576,
			dataBreak = (data.break) ? +data.break : false,
			toElement = (data.to) ? document.getElementById(data.to) : false,
			oldPosition = document.getElementById(preffix + data.to);
		if (!toElement) return;
		if (windowWidth < dataSize && !oldPosition && windowWidth >= dataBreak) {
			let newOldPosition = document.createElement('div');
			newOldPosition.id = preffix + data.to;
			newOldPosition.style.display = 'none';
			moveElement.before(newOldPosition);
			toElement.append(moveElement);
		}
		else if ((windowWidth >= dataSize || (dataBreak && dataBreak > windowWidth)) && oldPosition) {
			if (!oldPosition) return;
			oldPosition.after(moveElement);
			oldPosition.remove();
		}
	}
}

//Пример инициализации Yandex карты
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

function fixedHeader(headerId = 'mainHeader', fixedId = 'fixedHeader') {
	const header = document.getElementById(headerId);
	if (!header) return;
	const headerHeight = header.offsetHeight,
		offset = 50,
		scrollPosition = window.pageYOffset,
		fixedHeaderElement = document.getElementById(fixedId),
		fixedHeader = fixedHeaderElement ? fixedHeaderElement : header.cloneNode(true);
	fixedHeader.setAttribute('id', 'fixedHeader');
	fixedHeader.classList.add('fixed-header', 'mm-item');
	if (!fixedHeaderElement) document.body.prepend(fixedHeader);
	if (scrollPosition > headerHeight + offset) {
		setTimeout(() => fixedHeader.classList.add(ACTIVE_CLASS), 0);
	}
	else {
		if (!fixedHeader) return;
		fixedHeader.classList.remove(ACTIVE_CLASS);
	}
}

function pageUp() {
	const pageUpBtn = document.getElementById('pageup'),
		topShow = 280,
		scrollPosition = window.scrollY,
		documentFooter = document.querySelector('footer'),
		footerHeight = documentFooter ? documentFooter.offsetHeight : 0;
	if (!pageUpBtn) return;
	if (scrollPosition > topShow && scrollPosition < document.body.offsetHeight - window.innerHeight - footerHeight) pageUpBtn.classList.add(ACTIVE_CLASS);
	else pageUpBtn.classList.remove(ACTIVE_CLASS);
}

//Ленивая загрузка фото фото должно содержать класс img_ll и data-srcset с возможными размерами
async function lazyLoad() {
	const lazyClass = 'img_ll';
	for (let image of document.querySelectorAll(`.${lazyClass}`)) {
		let img = image.querySelector('img');
		if (!img) continue;
		let srcset = img.dataset.srcset;
		if (!srcset || !img.srcset) continue;
		let position = image.getBoundingClientRect();
		if ((window.innerHeight - position.top) < 0 || position.bottom < 0) continue;
		img.srcset = srcset;
		img.onload = function () {
			img.removeAttribute('data-srcset');
			image.classList.remove(lazyClass);
		};
	}
}

// Добавляет CSS стили для элмента в формате JSON
function css(element, css) {
	for (var style in css) {
		element.style[style] = css[style];
	}
}


// Разварачивает и сварачивает объект
// Передаются объект, метод (по умолчанию NULL. Значения: down|up), скорость (по умолчанию 300)
function slideToggle(element, method = null, speed = 300,) {
	if (['right', 'left', 'backLeft', 'backRight'].includes(method)) {
		css(element, { 'transition': 'transform ' + speed + 'ms' });
		let parent = document.createElement('div');
		css(parent, { 'display': 'block', 'overflow': 'hidden' });
		element.before(parent);
		parent.append(element);
		if (element.offsetWidth == 0 && !['backLeft', 'backRight'].includes(method)) {
			css(element, { 'display': 'block', 'transform': 'translateX(' + ((method == 'left') ? '-100' : '100') + '%)' });
			css(parent, { 'width': element.offsetWidth + 'px' });
			setTimeout(() => element.style.transform = 'translateX(0)', 0);
			setTimeout(() => {
				parent.before(element);
				parent.remove();
				element.removeAttribute('style');
				element.style.display = 'block';
			}, speed);
		}
		else if (element.offsetWidth > 0 && /back/.test(method)) {
			element.style.transform = 'translateX(0)';
			css(parent, { 'width': element.offsetWidth + 'px' });
			setTimeout(() => element.style.transform = 'translateX(' + ((method == 'backLeft') ? '-100' : '100') + '%)', 0);
			setTimeout(() => {
				parent.before(element);
				parent.remove();
				element.removeAttribute('style');
				element.style.display = 'none';
			}, speed);
		}
	}
	else {
		css(element, { 'transition': 'height ' + speed + 'ms', 'overflow': 'hidden' });
		let height = element.clientHeight + 'px';
		if (element.offsetHeight == 0 && method != 'up') {
			css(element, { 'display': 'block', 'height': 'auto' });
			height = element.clientHeight + 'px';
			element.style.height = '0px';
			setTimeout(() => element.style.height = height, 0);
			setTimeout(() => {
				element.removeAttribute('style');
				element.style.display = 'block';
			}, speed);
		}
		else if (element.offsetHeight > 0 && method != 'down') {
			height = element.clientHeight + 'px';
			element.style.height = height;
			setTimeout(() => element.style.height = '0px', 0);
			setTimeout(() => {
				element.removeAttribute('style');
				element.style.display = 'none';
			}, speed);
		}
	}
}
// Показывает скрывает объект
// Передаются объект, скорость (по умолчанию 300), метод (по умолчанию NULL. Значения: 'show')
function fadeToggle(element, method = null, speed = 300) {
	if (element.offsetHeight == 0 && method != 'hide') {
		css(element, { 'transition': 'opacity ' + speed + 'ms', 'display': 'block', 'opacity': 0 });
		setTimeout(() => element.style.opacity = 1, 0);
		setTimeout(() => {
			element.removeAttribute('style');
			element.style.display = 'block';
		}, speed);
	}
	else if (element.offsetHeight != 0 && method != 'show') {
		css(element, { 'transition': 'opacity ' + speed + 'ms' });
		setTimeout(() => element.style.opacity = 0, 0);
		setTimeout(() => {
			element.removeAttribute('style');
			element.style.display = 'none';
		}, speed);
	}
}
