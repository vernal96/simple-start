ACTIVE_CLASS = 'is-active';

document.addEventListener('DOMContentLoaded', function (event) {
	globalFunctions();
	masking.init();
	masking.init();
	submitForm.init();
	Fancybox.defaults.dragToClose = false;
	Fancybox.defaults.Hash = false;
	Fancybox.defaults.autoFocus = false;
	new WOW({ offset: 100 }).init();
	//loadPage.init()
	// loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', setMap);
});

document.addEventListener('scroll', function () {
	fixedHeader();
	pageUp();
	lazyLoad();
});

window.addEventListener('resize', function () {
	moveElements();
});


//Функция вызывает все глобальные функции
function globalFunctions() {
	clickAnchors(); 
	checkAgree();
	initModalPlaceholder();
	moveElements();
	fixedHeader();
	lazyLoad();
	pageUp();
	initSwiper();
}

//Инициализирует все слайдеры
function initSwiper() {
}

//Вызвает асинхронные скрипты
async function loadScript(src, func = false) {
	script = document.createElement('script');
	script.src = src;
	document.body.append(script);
	if (func) script.onload = () => func();
}

// Работает с объектами input типа checkbox, содержащими data-form-confirm. Должен быть потомком элемента .form или form, который содержит submit элементы
function checkAgree() {
	confirmElement = 'input[data-form-confirm]';
	form = 'form';
	parentElement = '.form';
	queryElement = '[type=submit]';
	for (agree of document.querySelectorAll(confirmElement)) {
		parent = agree.closest(parentElement) ? agree.closest(parentElement) : agree.closest(form);
		if (!agree.checked) {
			for (submit of parent.querySelectorAll(queryElement)) submit.disabled = true;
		}
		agree.addEventListener('change', setSubmitStatus)
	}
	function setSubmitStatus() {
		formSubmitEnabled = true;
		submits = parent.querySelectorAll(queryElement);
		for (agree of parent.querySelectorAll(confirmElement)) {
			if (!agree.checked) {
				formSubmitEnabled = false;
				for (submit of submits) submit.disabled = true;
				break;
			}
		}
		for (submit of submits) {
			submit.disabled = (formSubmitEnabled) ? false : true;
		}
	}
}

// Обрабатывает якорные ссылки
function clickAnchors() {
	for (anchor of document.querySelectorAll('[href*="#"]')) {
		anchor.addEventListener('click', function (event) {
			event.preventDefault();
			id = anchor.getAttribute('href');
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
function initModalPlaceholder(prefix='.modal__') {
	for (modalInit of document.querySelectorAll('[data-fancybox][data-src*="#"]')) {
		modalInit.addEventListener('click', function (event) {
			element = event.target;
			try {
				data = JSON.parse('{' + element.dataset.modalContent.replaceAll('\'', '"') + '}');
			} catch(error) {
				data = null;
			}
			modalObject = document.querySelector(element.dataset.src);
			if (!modalObject) return;
			for (defaultElement of modalObject.querySelectorAll('[data-default]')) {
				defaultValue = defaultElement.dataset.default;
				if (defaultElement.nodeName.toLowerCase() == 'input') defaultElement.value = defaultValue;
				else defaultElement.innerHTML = defaultValue;
			}
			for (dataItem in data) {
				element = prefix + dataItem;
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
	for (moveElement of document.querySelectorAll('[data-move]')) {
		data = moveElement.dataset;
		windowWidth = window.innerWidth;
		element;
		dataSize = (data.size) ? +data.size : 576;
		dataBreak = (data.break) ? +data.break : windowWidth - 1;
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

//делает копию шапки для фиксированной
//основная шапка должна содержать id=mainHeader
function fixedHeader() {
	header = document.getElementById('mainHeader');
	if (!header) return;
	headerHeight = header.offsetHeight;
	activeClass = ACTIVE_CLASS;
	offset = 50;
	scrollPosition = window.pageYOffset;
	fixedHeaderElement = document.getElementById('fixedHeader');
	let fixedHeader = fixedHeaderElement ? fixedHeaderElement : header.cloneNode(true);
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

//Инициализирует элемент поднятия страницы
function pageUp() {
	pageUpBtn = document.getElementById('pageup');
	topShow = 280;
	activeClass = ACTIVE_CLASS;
	scrollPosition = window.scrollY;
	documentFooter = document.querySelector('footer');
	if (!pageUpBtn) return;
	footerHeight = documentFooter ? documentFooter.offsetHeight : 0;
	if (scrollPosition > topShow && scrollPosition < document.body.offsetHeight - window.innerHeight - footerHeight) pageUpBtn.classList.add(activeClass);
	else pageUpBtn.classList.remove(activeClass);
}

//Ленивая загрузка фото фото должно содержать класс img_ll и data-srcset с возможными размерами
async function lazyLoad() {
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