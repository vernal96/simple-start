loadPage = {
	main: 'main',
	changeClasses: null,
	changeObjects: null,
	changeAttrs: null,
	startLoading: null,
	endLoading: null,
	functions: null,
	init: function (options = null) {
		if (options) this.setOptions(options);
		this.initLinks();
		window.addEventListener('popstate', function (event) {
			let url = event.state != null ? event.state.url : event.target.location.href;
			loadPage.prepareLoading(url, false);
		});
	},
	initLinks: function () {
		let links, a;
		if (!(links = document.querySelectorAll('a'))) return;
		for (a of links) {
			if (a.getAttribute('href') == null) continue;
			if (a.getAttribute('href').match(/^#|tel:|mailto:/g) || a.dataset.fancybox == '' || a.dataset.fancybox || a.getAttribute('target') == '_blank') continue;
			a.addEventListener('click', this.onClick);
		}
	},
	prepareLoading: async function (url, changeHistory = true) {
		let response, content, html, parser;
		loadPage.startLoading();
		try {
			response = await fetch(url);
			if (response.ok) {
				content = await response.text();
				parser = new DOMParser();
				html = parser.parseFromString(content, 'text/html');
				loadPage.setNewContent(html, url, changeHistory);
			}
			else {
				loadPage.endLoading();
			}
		} catch (e) {
			location.href = url;
		}
	},
	onClick: async function (event) {
		if (event.ctrlKey) return;
		if (!document.body.classList.contains('bvi-active')) {
			event.preventDefault();
			if (this.href != window.location.href) loadPage.prepareLoading(this.href);
		}
	},
	startLoading: function () {
		if (Fancybox) Fancybox.close();
		if (!document.getElementById('loadPage')) {
			overlay = document.createElement('div');
			overlayInner = document.createElement('div');
			overlayInner.classList.add('load-page');
			overlayInner.innerHTML = '<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>';
			overlay.setAttribute('id', 'loadPage');
			overlay.setAttribute('style', 'display:flex;align-items:center;justify-content:center;position:fixed;inset:0;transition:all 1s;z-index:9999;backdrop-filter:blur(2px);opacity:0;visibility:hidden;background:rgba(255,255,255, 0.01)');
			document.body.append(overlay);
			overlay.append(overlayInner);
			document.body.classList.add('no-scroll');
		}
		setTimeout(() => { overlay.style.opacity = 1; overlay.style.visibility = 'visible'; }, 0);
	},
	endLoading: function () {
		let overlay, mmo;
		overlay = document.getElementById('loadPage');
		if (overlay) {
			overlay.style.opacity = 0
			overlay.style.visibility = 'hidden';
		}
		document.body.classList.remove('no-scroll');
		mmo = document.querySelectorAll('.mmo-item');
		if (mmo) {
			for (let mmoItem of mmo) {
				mmoItem.classList.remove('is-mmo');
			}
		}
		window.scrollTo(0, 0);
	},
	setNewContent: function (html, url, pushState = true) {
		let main, title;
		main = html.querySelector('#' + loadPage.main);
		if (!main || !document.getElementById(loadPage.main)) location.href = url;
		title = html.title;
		if (pushState) {
			window.history.pushState({ url: url, prev: window.location.href, title: title }, title, url);
		}
		document.title = title;
		document.getElementById(loadPage.main).innerHTML = main.innerHTML;
		loadPage.initChangeClasese(html);
		loadPage.initChangeObjects(html);
		loadPage.initChangeAttrs(html);
		loadPage.initScripts(html);
		loadPage.initFunctions();
		loadPage.endLoading();
	},
	initChangeAttrs: function (html) {
		let key, object, valueObject, value, docObjects, docObject;
		if (!loadPage.changeAttrs) return;
		object = loadPage.changeAttrs
		for (key in object) {
			valueObject = html.querySelector(object[key]);
			if (!valueObject) continue;
			value = valueObject.getAttribute(key);
			docObjects = document.querySelectorAll(object[key]);
			if (docObjects) {
				for (docObject of docObjects) {
					docObject.setAttribute(key, value);
				}
			}
		}
	},
	initChangeObjects: function (html) {
		let object, element, newElement, parent;
		if (!loadPage.changeObjects) return;
		for (object of loadPage.changeObjects) {
			element = document.querySelector(`${object.parent} ${object.element}`);
			newElement = html.querySelector(`${object.parent} ${object.element}`);
			if (element) element.remove();
			if (!newElement) continue;
			if (object.prevSibling) {
				if (prevSibling = document.querySelector(`${object.parent} ${object.prevSibling}`)) {
					prevSibling.after(newElement);
					continue;
				}
			}
			if (object.nextSibling) {
				if (nextSibling = document.querySelector(`${object.parent} ${object.nextSibling}`)) {
					nextSibling.before(newElement);
					continue;
				}
			}
			parent = document.querySelector(`${object.parent}`);
			parent.append(newElement);
		}
	},
	initChangeClasese: function (html) {
		let elementQuery, element, newElement, classes;
		if (!loadPage.changeClasses) return;
		for (elementQuery of loadPage.changeClasses) {
			element = document.querySelector(elementQuery);
			newElement = html.querySelector(elementQuery);
			classes = newElement.getAttribute('class');
			element.setAttribute('class', classes);
		}
	},
	initScripts: function (html) {
		let scripts, newScripts, script;
		scripts = document.querySelectorAll('script');
		newScripts = html.querySelectorAll('script');
		for (script of scripts) {
			if (script.innerHTMl != '') {
				script.remove();
			}
		}
		for (script of newScripts) {
			if (script.innerHTML) {
				document.body.append(script);
				if (script.classList.contains('pdo-page-config')) {
					pdoPage.Reached = false;
					pdoPage.keys = {};
					pdoPage.callbacks = {};
					pdoPage.configs = {};
					eval(script.innerHTML);
				}
			}
		}
	},
	initFunctions: function () {
		if (!loadPage.functions) return;
		for (let func of loadPage.functions) {
			func();
		}
	},
	setOptions: function (options) {
		this.main = options.main ? options.main : this.main;
		this.changeClasses = options.changeClasses ? options.changeClasses : this.changeClasses;
		this.changeObjects = options.changeObjects ? options.changeObjects : this.changeObjects;
		this.changeAttrs = options.changeAttrs ? options.changeAttrs : this.changeAttrs;
		this.functions = options.functions ? options.functions : this.functions;
		this.startLoading = options.startLoading ? options.startLoading : this.startLoading;
		this.endLoading = options.endLoading ? options.endLoading : this.endLoading;
	}
};