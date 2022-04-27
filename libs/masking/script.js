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
			input.addEventListener('blur', this.inputValid);
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
				input.addEventListener('input', this.onPhoneInput);
				input.addEventListener('keydown', this.onPhoneKeydown);
			}
			if (input.type == 'number') {
				input.type = 'tel';
				input.old = 'number';
				input.addEventListener('input', this.onNumericInput);
			}
		}
	},
	setSelector: function (input) {
		if (input.classList.contains(masking.selectorClasses.initialized)) return;
		input.classList.add(masking.selectorClasses.initialized);
		let select = input.cloneNode(true),
			selectric = document.createElement('div'),
			options = input.querySelectorAll('option');
		selectric.classList.add(masking.selectorClasses.main);
		selectric.innerHTML = `<div class="${masking.selectorClasses.input}"></div><div class="${masking.selectorClasses.label}"><div class="${masking.selectorClasses.title}"></div></div><ul class="${masking.selectorClasses.list}"></ul>`;
		selectric.querySelector(`.${masking.selectorClasses.input}`).append(select);
		let optionList = selectric.querySelector(`.${masking.selectorClasses['list']}`),
			index = 0;
		for (let option of options) {
			if (option.selected) {
				label = selectric.querySelector(`.${masking.selectorClasses.label}`);
				title = label.querySelector(`.${masking.selectorClasses.title}`);
				title.prepend(option.textContent);
				let selectBtn = document.createElement('div');
				selectBtn.classList.add(masking.selectorClasses.button);
				selectBtn.addEventListener('click', () => {
					if (selectric.classList.contains(masking.selectorClasses.active)) {
						selectric.classList.remove(masking.selectorClasses.active);
						return;
					}
					selectric.classList.add(masking.selectorClasses.active);
					let rect = selectric.querySelector(`.${masking.selectorClasses.label}`).getBoundingClientRect(),
						listHeight = selectric.querySelector(`.${masking.selectorClasses.list}`).offsetHeight;
					if (window.innerHeight - rect.top - rect.height < listHeight) {
						selectric.classList.add(masking.selectorClasses.top);
					}
					else selectric.classList.remove(masking.selectorClasses.top);
				});
				label.append(selectBtn);
				if (option.disabled) label.classList.add(masking.selectorClasses.disabled);
			}
			let optionItem = document.createElement('li');
			if (option.disabled) optionItem.classList.add(masking.selectorClasses.disabled);
			if (option.selected) optionItem.classList.add(masking.selectorClasses.selected);
			optionItem.setAttribute('data-index', index);
			optionItem.innerHTML = option.textContent;
			optionItem.addEventListener('click', masking.changeSelector);
			optionList.append(optionItem);
			index++;
		}
		input.after(selectric);
		input.remove();
	},
	changeSelector: function (event) {
		let element = event.target,
			idx = element.getAttribute('data-index'),
			parent = element.closest(`.${masking.selectorClasses.main}`),
			oldSelected = parent.querySelector(`li.${masking.selectorClasses.selected}`),
			label = parent.querySelector(`.${masking.selectorClasses.title}`),
			oldIdx = oldSelected.getAttribute('data-index');
		if (parent.getElementsByTagName('option')[idx].disabled == true) return;
		oldSelected.classList.remove(masking.selectorClasses.selected);
		parent.getElementsByTagName('option')[oldIdx].selected = false;
		parent.getElementsByTagName('option')[idx].selected = true;
		element.classList.add(masking.selectorClasses.selected);
		parent.classList.remove(masking.selectorClasses.active);
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
		if (!value && required) return masking.addStatus(false, element);
		else if (!value && !required) {
			element.error = false;
			if (element.nextSibling) element.nextSibling.remove();
		}
		else if (element.old == 'number') {
			return (value.replace(/[\d ,\.\s]/g, '') == '') ? masking.addStatus(true, element) : masking.addStatus(false, element);
		}
		else if (element.type == 'email') {
			let reg = /^((([0-9A-Za-z]{1}[-0-9A-z\.]{1,}[0-9A-Za-z]{1})|([0-9А-Яа-я]{1}[-0-9А-я\.]{1,}[0-9А-Яа-я]{1}))@([-A-Za-z]{1,}\.){1,2}[-A-Za-z]{2,})$/u;
			return value.match(reg) ? masking.addStatus(true, element) : masking.addStatus(false, element);
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
			return (phoneError) ? masking.addStatus(false, element) : masking.addStatus(true, element);
		}
		else if (element.type == 'checkbox' || element.type == 'radio') return;
		else {
			return masking.addStatus(true, element);
		}
	},
	onNumericInput: function (event) {
		let input = event.target,
			inputNumber = input.value.trim().replace(/[^\.^,\d]/g, '');
		inputNumber = inputNumber.replace(/,/g, '.');
		inputNumber = inputNumber.replace(/\s/g, '');
		if (!inputNumber.match(/\d/g)) return input.value = '';
		if (inputNumber.indexOf('.') != inputNumber.lastIndexOf('.')) return input.value = input.value.substring(0, input.value.length - 1);
		if (!inputNumber.match(/\.$/g)) input.value = masking.numberFormat.format(inputNumber);
	},
	getInputNumbersValue: function (input) {
		return input.value.trim().replace(/\D/g, '');
	},
	onPhoneKeydown: function (event) {
		let input = event.target;
		if (event.keyCode == 8 && masking.getInputNumbersValue(input).length == 1) input.value = '';
	},
	onPhoneInput: function (event) {
		let input = event.target,
			inputNumbersValue = masking.getInputNumbersValue(input),
			formattedInputValue = '';
		if (!inputNumbersValue) {
			return input.value = '';
		}

		if (input.selectionStart != input.value.length) masking.phonePosition = input.selectionStart;
		else masking.phonePosition = false;

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
		if (masking.phonePosition && inputNumbersValue.length < 11) {
			input.selectionStart = masking.phonePosition;
			input.selectionEnd = masking.phonePosition;
		}
		else masking.phonePosition = false;
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