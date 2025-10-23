(function(){
	'use strict';
	
	
	const $ = (window.Tygh && window.Tygh.$) || null;
	
	const debounce = (fn, delay) => {
		let timeout;
		return function() {
			clearTimeout(timeout);
			const args = arguments;
			const context = this;
			timeout = setTimeout(() => fn.apply(context, args), delay);
		};
	};
	
	document.addEventListener('DOMContentLoaded', () => {
		let input = document.getElementById('dadata_address_input');
		if (!input) return;
		
		console.log('DaData: инициализирован');
		
		let suggestions = [];
		let dropdown;
		let abortController;
		let selectedIndex = -1; // Индекс выбранного элемента в списке
		
		// Префилл из текущих полей Lite Checkout
		if ($) {
			const getValue = selector => ($(selector).first().val() || '').trim();
			const city = getValue('[data-ca-lite-checkout-field="user_data.s_city"]');
			const addr = getValue('[data-ca-lite-checkout-field="user_data.s_address"]');
			const zip = getValue('[data-ca-lite-checkout-field="user_data.s_zipcode"]');
			const prefilled = [addr, city].filter(Boolean).join(', ') + (zip ? (' ' + zip) : '');
			
			if (!input.value && prefilled) {
				input.value = prefilled;
			}
		}
		
		const ensureDropdown = () => {
			input = document.getElementById('dadata_address_input');
			if (!input) return;
			
			// Проверяем, что dropdown еще привязан к правильному родителю
			if (dropdown && dropdown.parentNode !== input.parentNode) {
				dropdown = null;
			}
			
			if (dropdown) return;
			
			dropdown = document.createElement('div');
			dropdown.className = 'dadata-dropdown';
			dropdown.style.cssText = 'position:absolute;background:#fff;border:1px solid #d1d1d1;border-top:none;max-height:300px;overflow-y:auto;z-index:1000;box-shadow:0 2px 4px rgba(0,0,0,0.08);';
			dropdown.style.width = input.offsetWidth + 'px';
			
			input.parentNode.style.position = 'relative';
			input.parentNode.appendChild(dropdown);
			
			// Привязываем события hover только один раз
			if (!dropdown._hoverBound) {
				dropdown.addEventListener('mouseover', function(e) {
					const item = e.target.closest('[data-index]');
					if (item) item.style.background = '#f7f7f7';
				});
				
				dropdown.addEventListener('mouseout', function(e) {
					const item = e.target.closest('[data-index]');
					if (item) item.style.background = '#fff';
				});
				
				dropdown._hoverBound = true;
			}
		};
		
		const fetchSuggestions = async (query) => {
			if (abortController) abortController.abort();
			abortController = new AbortController();
			
			try {
				const response = await fetch('index.php?dispatch=dadata_address.suggest&query=' + encodeURIComponent(query), {
					signal: abortController.signal
				});
				
				if (!response.ok) {
					throw new Error('HTTP ' + response.status);
				}
				
				const data = await response.json();
				suggestions = data.suggestions || [];
				
				ensureDropdown();
				
				if (suggestions.length) {
					dropdown.innerHTML = suggestions.map(function(suggestion, index) {
						const isSelected = index === selectedIndex ? 'background:#e3f2fd;' : '';
						return '<div style="padding:10px;cursor:pointer;border-bottom:1px solid #f0f0f0;font-size:14px;' + isSelected + '" data-index="' + index + '">' + suggestion.value + '</div>';
					}).join('');
				} else {
					dropdown.innerHTML = '<div style="padding:10px;color:#999;font-size:14px;">Ничего не найдено</div>';
					selectedIndex = -1;
				}
			} catch (error) {
				if (error.name !== 'AbortError' && dropdown) {
					dropdown.innerHTML = '<div style="padding:10px;color:#d32f2f;font-size:14px;">Ошибка загрузки</div>';
				}
			}
		};
		
		const debouncedFetch = debounce(fetchSuggestions, 800);
		
		// Функция для обновления визуального выделения
		const updateSelection = () => {
			if (!dropdown || !suggestions.length) return;
			
			const items = dropdown.querySelectorAll('[data-index]');
			items.forEach((item, index) => {
				if (index === selectedIndex) {
					item.style.background = '#e3f2fd';
				} else {
					item.style.background = '#fff';
				}
			});
		};
		
		// Функция для выбора элемента
		const selectSuggestion = (index) => {
			if (index < 0 || index >= suggestions.length) return;
			
			const suggestion = suggestions[index];
			input.value = suggestion.value;
			dropdown.innerHTML = '';
			selectedIndex = -1;
			
			// Сохраняем выбранное предложение для последующего обновления
			window._selectedSuggestion = suggestion;
			
			// Показываем результат
			const resultDiv = document.getElementById('dadata_result');
			if (resultDiv && suggestion.data) {
				const coordsPart = suggestion.data.geo_lat ? 
					(' <span style="color:#999;">(координаты: ' + suggestion.data.geo_lat + ', ' + suggestion.data.geo_lon + ')</span>') : '';
				
				resultDiv.innerHTML = '<div style="margin-top:8px;padding:10px;background:#f5f5f5;border:1px solid #e0e0e0;font-size:13px;color:#666;"><strong>Выбран:</strong> ' + suggestion.value + coordsPart + '</div>';
			}
		};
		
		// Обработчик ввода - привязываем только один раз глобально
		if (!window.__dadataDelegated) {
			document.addEventListener('input', function(e) {
				if (!(e.target && e.target.id === 'dadata_address_input')) return;
				
				const query = e.target.value.trim();
				selectedIndex = -1; // Сбрасываем выделение при новом вводе
				
				if (query.length < 3) {
					if (dropdown) dropdown.innerHTML = '';
					return;
				}
				
				debouncedFetch(query);
			});
			window.__dadataDelegated = true;
		}
		
		// Обработчик клавиатуры
		document.addEventListener('keydown', function(e) {
			if (!(e.target && e.target.id === 'dadata_address_input')) return;
			if (!dropdown || !suggestions.length) return;
			
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
					updateSelection();
					break;
					
				case 'ArrowUp':
					e.preventDefault();
					selectedIndex = Math.max(selectedIndex - 1, -1);
					updateSelection();
					break;
					
				case 'Enter':
				case 'Tab':
					e.preventDefault();
					if (selectedIndex >= 0) {
						selectSuggestion(selectedIndex);
					}
					break;
					
				case 'Escape':
					if (dropdown) {
						dropdown.innerHTML = '';
						selectedIndex = -1;
					}
					break;
			}
		});
		
		// Обработчик клика по выпадающему списку
		document.addEventListener('click', function(e) {
			const item = e.target.closest('[data-index]');
			
			if (item && dropdown && dropdown.contains(item)) {
				const index = +item.dataset.index;
				selectSuggestion(index);
			} else if (dropdown) {
				// Закрываем dropdown при клике вне его
				input = document.getElementById('dadata_address_input');
				if (!(input && !input.contains(e.target) && !dropdown.contains(e.target))) return;
				dropdown.innerHTML = '';
				selectedIndex = -1;
			}
		});
		
		// Обработчик клика по кнопке обновления
		document.addEventListener('click', function(e) {
			if (e.target && e.target.id === 'dadata_update_btn') {
				const suggestion = window._selectedSuggestion;
				if (!suggestion) {
					alert('Сначала выберите адрес из списка');
					return;
				}
				
				// Обновляем поля Lite Checkout
				if ($ && $.ceLiteCheckout && $('[data-ca-lite-checkout-element="form"]').length) {
					try {
						const data = suggestion.data || {};
						const city = data.city || data.settlement || data.area || data.region || '';
						const stateCode = data.region_iso_code || '';
						const state = data.region || '';
						const zipcode = data.postal_code || '';
						const country = data.country_iso_code || '';
						
						$.ceLiteCheckout('setLocationByFields', {
							s_city: city,
							s_state: (stateCode || state),
							s_zipcode: zipcode,
							s_address: suggestion.value || '',
							s_country: country || ''
						});
						
						// Показываем сообщение об успехе
						const resultDiv = document.getElementById('dadata_result');
						if (resultDiv) {
							const coordsPart = suggestion.data.geo_lat ? 
								(' <span style="color:#999;">(координаты: ' + suggestion.data.geo_lat + ', ' + suggestion.data.geo_lon + ')</span>') : '';
							
							resultDiv.innerHTML = '<div style="margin-top:8px;padding:10px;background:#e8f5e8;border:1px solid #4CAF50;font-size:13px;color:#2e7d32;"><strong>✓ Адрес обновлен:</strong> ' + suggestion.value + coordsPart + '</div>';
						}
						
						// Очищаем сохраненное предложение
						window._selectedSuggestion = null;
						
					} catch (error) {
						alert('Ошибка при обновлении адреса');
					}
				} else {
					alert('Lite Checkout не найден');
				}
			}
		});
		
		// Обработчик инициализации Lite Checkout
		if ($ && $.ceEvent) {
			$.ceEvent('on', 'ce.commoninit', function(context) {
				const inp = document.getElementById('dadata_address_input');
				if (!inp) return;
				
				const getValue = function(selector) {
					return ($(selector).first().val() || '').trim();
				};
				
				const city = getValue('[data-ca-lite-checkout-field="user_data.s_city"]');
				const addr = getValue('[data-ca-lite-checkout-field="user_data.s_address"]');
				const zip = getValue('[data-ca-lite-checkout-field="user_data.s_zipcode"]');
				const prefilled = [addr, city].filter(Boolean).join(', ') + (zip ? (' ' + zip) : '');
				
				if (!inp.value && prefilled) {
					inp.value = prefilled;
				}
				
				const topDiv = document.getElementById('dadata_current_address');
				if (topDiv && prefilled) {
					topDiv.innerHTML = '<strong>Адрес для доставки:</strong> ' + prefilled;
				}
			});
		}
		
	});
})();
