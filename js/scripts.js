const ACTIVE_CLASS = 'is-active';
const TEMPLATE_PATH = '/';

document.addEventListener('DOMContentLoaded', function () {
	globalFunctions();
	setFancyboxDefaults();
	new WOW({ offset: 100 }).init();
	//loadPage.init()
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

//Устанавливает значения по умолчанию для Fancybox
function setFancyboxDefaults() {
	Fancybox.defaults.dragToClose = false;
	Fancybox.defaults.Hash = false;
	Fancybox.defaults.autoFocus = false;
}

//Функция вызывает все глобальные функции
function globalFunctions() {
	initSvgViewBox();
	clickAnchors();
	checkAgree();
	initModalPlaceholder();
	moveElements();
	fixedHeader();
	lazyLoad();
	pageUp();
	initSwiper();
	masking.init();
	submitForm.init();
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
	let icons = document.createElement('img');
	icons.src = TEMPLATE_PATH + 'img/ico.svg';
	icons.onload = main();
	function main() {
		for (let svg of document.querySelectorAll('svg')) {
			if (!svg.querySelector('use') || svg.getAttribute('viewBox')) continue;
			let size = svg.getBBox(),
				width = Math.round(size.width),
				height = Math.round(size.height);
			svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		}
	}
}

// Работает с объектами input типа checkbox, содержащими data-form-confirm. Должен быть потомком элемента .form или form, который содержит submit элементы
function checkAgree() {
	let confirmElement = 'input[data-form-confirm]',
		form = 'form',
		parentElement = '.form',
		queryElement = '[type=submit]';
	for (let agree of document.querySelectorAll(confirmElement)) {
		let parent = agree.closest(parentElement) ? agree.closest(parentElement) : agree.closest(form);
		if (!agree.checked) for (let submit of parent.querySelectorAll(queryElement)) submit.disabled = true;
		agree.addEventListener('change', () => setSubmitStatus(parent));
	}
	function setSubmitStatus(parent) {
		let formSubmitEnabled = true,
			submits = parent.querySelectorAll(queryElement);
		for (let agree of parent.querySelectorAll(confirmElement)) {
			if (!agree.checked) {
				formSubmitEnabled = false;
				for (let submit of submits) submit.disabled = true;
				break;
			}
		}
		for (let submit of submits) submit.disabled = !formSubmitEnabled;
	}
}

// Обрабатывает якорные ссылки
function clickAnchors() {
	for (let anchor of document.querySelectorAll('[href*="#"]')) {
		anchor.addEventListener('click', (event) => {
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

//Обрабатывает контент модальных окон, которые передаются в парметре data-modal-content.
//Пример: 'Ключ':'Значение','Ключ':'Значение'.
//Принимает префикс класса объекта. По умолчанию .modal__
function initModalPlaceholder(prefix = '.modal__') {
	for (let modalInit of document.querySelectorAll('[data-fancybox][data-src*="#"]')) {
		modalInit.addEventListener('click', function (event) {
			let element = this,
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
		});
	}
}

//Перемещает элементы при зменении ширины экрана
//Объект перемещения должен содержать:
//data-move - определяет объект
//data-size - опредеяет ширину экрана при которой элемент будет перемещения
//data-break - опеределеят ширину экрана при которой элемент вернется на место 
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

//делает копию шапки для фиксированной
//основная шапка должна содержать id=mainHeader
function fixedHeader(headerId = 'mainHeader', fixedId = 'fixedHeader') {
	let header = document.getElementById(headerId);
	if (!header) return;
	let headerHeight = header.offsetHeight,
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

//Инициализирует элемент поднятия страницы
function pageUp() {
	let pageUpBtn = document.getElementById('pageup'),
		topShow = 280,
		scrollPosition = window.scrollY,
		documentFooter = document.querySelector('footer');
	if (!pageUpBtn) return;
	let footerHeight = documentFooter ? documentFooter.offsetHeight : 0;
	if (scrollPosition > topShow && scrollPosition < document.body.offsetHeight - window.innerHeight - footerHeight) pageUpBtn.classList.add(ACTIVE_CLASS);
	else pageUpBtn.classList.remove(ACTIVE_CLASS);
}

//Ленивая загрузка фото фото должно содержать класс img_ll и data-srcset с возможными размерами
async function lazyLoad() {
	let lazyClass = 'img_ll';
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
