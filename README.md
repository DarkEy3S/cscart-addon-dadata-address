# Dadata Address — CS-Cart Addon

Минималистичный аддон для CS-Cart с автокомплитом адреса через DaData API.

## Возможности

- ✅ Автокомплит адресов через DaData API
- ✅ Минималистичный дизайн в стиле CS-Cart
- ✅ Блок для размещения в любом месте сайта
- ✅ Вывод координат выбранного адреса
- ✅ Поддержка русского и английского языков

## Установка

### 1. Создание симлинков

```bash
cscart-sdk addon:symlink dadata_address .\repos\cs-cart-delivery-service-block\ .\public\ --templates-to-design
```

### 2. Активация аддона

Перейди в **Модули → Управление модулями → Dadata Address** и активируй аддон.

### 3. Настройка API токена

1. Получи бесплатный токен на [dadata.ru](https://dadata.ru)
2. Перейди: **Модули → Управление модулями → Dadata Address → ⚙️ Настройки**
3. Вставь токен в поле "DaData API токен"

### 4. Добавление блока

1. Перейди в **Дизайн → Макеты**
2. Нажми **+ Добавить блок**
3. Выбери **Блок адреса Dadata**
4. Размести блок в нужном месте (главная, корзина, оформление заказа и т.д.)

## Структура файлов

```
app/addons/dadata_address/
  ├── addon.xml                          # Конфигурация аддона
  ├── init.php                           # Инициализация
  ├── func.php                           # Функции
  ├── controllers/frontend/
  │   └── dadata_address.php             # API контроллер для запросов к DaData
  └── schemas/block_manager/
      └── blocks.post.php                # Регистрация блока

js/addons/dadata_address/
  └── dadata_address.js                  # Логика автокомплита

var/themes_repository/responsive/templates/
  ├── addons/dadata_address/blocks/
  │   └── dadata_block.tpl               # Шаблон блока (включает подключение JS)
  └── hooks/index/
      └── scripts.post.tpl               # Глобальное подключение JS

var/langs/
  ├── ru/addons/dadata_address.po        # Русский перевод
  └── en/addons/dadata_address.po        # English translation
```

## Использование

После добавления блока на страницу:

1. Начни вводить адрес (минимум 3 символа)
2. Выбери адрес из выпадающего списка навигацией или кликом
3. Нажми "Обновить адрес" для заполнения полей Lite Checkout
4. Координаты отобразятся под полем

## Особенности

- Автокомплит с задержкой 800мс для оптимизации запросов
- Поддержка навигации клавиатурой (стрелки, Enter, Tab, Escape)
- Интеграция с Lite Checkout для автозаполнения полей
- Показ координат выбранного адреса
- Префилл текущего адреса из полей доставки

## Требования

- CS-Cart 4.0.1+
- DaData API токен (бесплатный на [dadata.ru](https://dadata.ru))
- Активный аддон после установки через CS-Cart CDM
