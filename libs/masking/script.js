masking = {
	phonePosition: false,
	numberFormat: null,
	selectorClasses: {
		main: 'select',
		initialized: 'select-initialized',
		input: 'select-input',
		label: 'select-label',
		list: 'select-list',
		title: 'select-title',
		button: 'select-btn',
		top: 'top',
		active: 'active',
		disabled: 'disabled',
		selected: 'selected'
	},
	init: function () {
		this.numberFormat = new Intl.NumberFormat();
		for (let input of document.querySelectorAll('input, textarea, select')) {
			input.addEventListener('change', this.inputValid.bind(this));
			if (input.nodeName.toLowerCase() == 'select') {
				this.setSelector(input);
				document.addEventListener('click', (event) => {
					for (let select of document.querySelectorAll(`.${this.selectorClasses.main}`)) {
						const withinBoundaries = event.composedPath().includes(select);
						if (!withinBoundaries) {
							select.classList.remove(this.selectorClasses.active);
						};
					}
				});
			}
			if (input.type == 'tel') {
				input.addEventListener('input', this.onPhoneInput.bind(this));
				input.addEventListener('keydown', this.onPhoneKeydown.bind(this));
			}
			if (input.type == 'number') {
				input.type = 'tel';
				input.old = 'number';
				input.addEventListener('input', this.onNumericInput.bind(this));
			}
		}
	},
	setSelector: function (input) {
		if (input.classList.contains(this.selectorClasses.initialized)) return;
		input.classList.add(this.selectorClasses.initialized);
		let select = input.cloneNode(true),
			selectric = document.createElement('div'),
			options = input.querySelectorAll('option');
		selectric.classList.add(this.selectorClasses.main);
		selectric.innerHTML = `<div class="${this.selectorClasses.input}"></div><div class="${this.selectorClasses.label}"><div class="${this.selectorClasses.title}"></div></div><ul class="${this.selectorClasses.list}"></ul>`;
		selectric.querySelector(`.${this.selectorClasses.input}`).append(select);
		let optionList = selectric.querySelector(`.${this.selectorClasses['list']}`),
			index = 0;
		for (let option of options) {
			if (option.selected) {
				label = selectric.querySelector(`.${this.selectorClasses.label}`);
				title = label.querySelector(`.${this.selectorClasses.title}`);
				title.prepend(option.textContent);
				let selectBtn = document.createElement('div');
				selectBtn.classList.add(this.selectorClasses.button);
				selectBtn.addEventListener('click', () => {
					if (selectric.classList.contains(this.selectorClasses.active)) {
						selectric.classList.remove(this.selectorClasses.active);
						return;
					}
					selectric.classList.add(this.selectorClasses.active);
					let rect = selectric.querySelector(`.${this.selectorClasses.label}`).getBoundingClientRect(),
						listHeight = selectric.querySelector(`.${this.selectorClasses.list}`).offsetHeight;
					if (window.innerHeight - rect.top - rect.height < listHeight) {
						selectric.classList.add(this.selectorClasses.top);
					}
					else selectric.classList.remove(this.selectorClasses.top);
				});
				label.append(selectBtn);
				if (option.disabled) label.classList.add(this.selectorClasses.disabled);
			}
			let optionItem = document.createElement('li');
			if (option.disabled) optionItem.classList.add(this.selectorClasses.disabled);
			if (option.selected) optionItem.classList.add(this.selectorClasses.selected);
			optionItem.setAttribute('data-index', index);
			optionItem.innerHTML = option.textContent;
			optionItem.addEventListener('click', this.changeSelector.bind(this));
			optionList.append(optionItem);
			index++;
		}
		input.after(selectric);
		input.remove();
	},
	changeSelector: function (event) {
		let element = event.target,
			idx = element.getAttribute('data-index'),
			parent = element.closest(`.${this.selectorClasses.main}`),
			oldSelected = parent.querySelector(`li.${this.selectorClasses.selected}`),
			label = parent.querySelector(`.${this.selectorClasses.title}`),
			oldIdx = oldSelected.getAttribute('data-index');
		if (parent.getElementsByTagName('option')[idx].disabled == true) return;
		oldSelected.classList.remove(this.selectorClasses.selected);
		parent.getElementsByTagName('option')[oldIdx].selected = false;
		parent.getElementsByTagName('option')[idx].selected = true;
		element.classList.add(this.selectorClasses.selected);
		parent.classList.remove(this.selectorClasses.active);
		label.innerHTML = element.textContent;
	},
	addStatus: function (status, element) {
		if (element.nextSibling) element.nextSibling.remove();
		let statusField = document.createElement('div');
		statusField.classList.add('input-status');
		if (status) {
			element.error = false;
			statusField.classList.add('true');
		}
		else {
			element.error = true;
			statusField.classList.add('false');
		}
		element.after(statusField);
	},
	inputValid: function (event) {
		let element = event.target,
			value = element.value,
			required = element.required;
		if (!value && required) return this.addStatus(false, element);
		else if (!value && !required) {
			element.error = false;
			if (element.nextSibling) element.nextSibling.remove();
		}
		else if (element.old == 'number') {
			return (value.replace(/[\d ,\.\s]/g, '') == '') ? this.addStatus(true, element) : this.addStatus(false, element);
		}
		else if (element.type == 'email') {
			let reg = /^((([0-9A-Za-z]{1}[-0-9A-z\.]{1,}[0-9A-Za-z]{1})|([0-9А-Яа-я]{1}[-0-9А-я\.]{1,}[0-9А-Яа-я]{1}))@([-A-Za-z]{1,}\.){1,2}[-A-Za-z]{2,})$/u;
			return value.match(reg) ? this.addStatus(true, element) : this.addStatus(false, element);
		}
		else if (element.type == 'tel') {
			let regs = [
				/^8 \(\d\d\d\) \d\d\d-\d\d-\d\d$/g,
				/^\+7 \(\d\d\d\) \d\d\d-\d\d-\d\d$/g,
				/^\+\d{10,}/g,
			],
				phoneError = true;
			for (let reg of regs) {
				if (value.match(reg)) {
					phoneError = false;
					break;
				}
			}
			return (phoneError) ? this.addStatus(false, element) : this.addStatus(true, element);
		}
		else if (element.type == 'checkbox' || element.type == 'radio') return;
		else {
			return this.addStatus(true, element);
		}
	},
	onNumericInput: function (event) {
		let input = event.target,
			inputNumber = input.value.trim().replace(/[^\.^,\d]/g, '');
		inputNumber = inputNumber.replace(/,/g, '.');
		inputNumber = inputNumber.replace(/\s/g, '');
		if (!inputNumber.match(/\d/g)) return input.value = '';
		if (inputNumber.indexOf('.') != inputNumber.lastIndexOf('.')) return input.value = input.value.substring(0, input.value.length - 1);
		if (!inputNumber.match(/\.$/g)) input.value = this.numberFormat.format(inputNumber);
	},
	getInputNumbersValue: function (input) {
		return input.value.trim().replace(/\D/g, '');
	},
	onPhoneKeydown: function (event) {
		let input = event.target;
		if (event.keyCode == 8 && this.getInputNumbersValue(input).length == 1) input.value = '';
	},
	onPhoneInput: function (event) {
		let input = event.target,
			inputNumbersValue = this.getInputNumbersValue(input),
			formattedInputValue = '';
		if (!inputNumbersValue) {
			return input.value = '';
		}

		if (input.selectionStart != input.value.length) this.phonePosition = input.selectionStart;
		else this.phonePosition = false;

		if (['7', '8', '9'].includes(inputNumbersValue[0])) {
			if (inputNumbersValue[0] == '9') inputNumbersValue = '7' + inputNumbersValue;
			let firstSymbols = (inputNumbersValue[0] == '8') ? '8' : '+7';
			formattedInputValue = firstSymbols + ' ';
			if (inputNumbersValue.length > 1) formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
			if (inputNumbersValue.length > 4) formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
			if (inputNumbersValue.length > 7) formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
			if (inputNumbersValue.length > 9) formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
		}
		else formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
		input.value = formattedInputValue;
		if (this.phonePosition && inputNumbersValue.length < 11) {
			input.selectionStart = this.phonePosition;
			input.selectionEnd = this.phonePosition;
		}
		else this.phonePosition = false;
	}
};

submitForm = {
	init: function () {
		for (let form of document.querySelectorAll('form[data-ajax]')) {
			form.addEventListener('submit', this.submit);
		}
	},
	submit: async function (event) {
		event.preventDefault();
		let form = event.target,
			data = new FormData(event.target),
			action = form.action,
			method = form.method;
		for (let formItem of form.querySelectorAll('input, textarea')) {
			if (formItem.error) {
				return formItem.focus();
			}
		}

		for (let button of form.querySelectorAll('[type=submit]')) {
			button.disabled = true;
		}

		let response = await fetch(action, {
			method: method,
			body: data
		});

		if (response.ok) {
			console.log('Успех', response);
		}
		else {
			console.log('Ошибка', response)
		}

		for (let button of form.querySelectorAll('[type=submit]')) {
			button.disabled = false;
		}

	}
}