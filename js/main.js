// Ожидаем загрузки DOM и запускаем калькулятор
document.addEventListener("DOMContentLoaded", init);

// заводим переменные
let screen,
    historyCurrent,
    keyboard,
    buttons,
    buttonClear,
    numberA,
    numberB,
    operator,
    result,
    processed;

/**
 * Инициализация калькулятора
 */
function init() {
    // находим экран
    screen = document.querySelector(".screen");
    // находим строку результатов
    historyCurrent = {
        root: screen.querySelector(".history_current"),
    };
    historyCurrent.firstNumber = historyCurrent.root.querySelector('.history__operation .history__number:first-of-type');
    historyCurrent.secondNumber = historyCurrent.root.querySelector('.history__operation .history__number:last-of-type');
    historyCurrent.operator = historyCurrent.root.querySelector('.history__operation .history__operator');
    historyCurrent.equals = historyCurrent.root.querySelector('.history__result .history__operator');
    historyCurrent.result = historyCurrent.root.querySelector('.history__result .history__number');
    // находим клавиатуру
    keyboard = document.querySelector(".keyboard");
    // берем все кнопки в клавиатуре
    buttons = keyboard.querySelectorAll(".button");
    // ищем кнопку сброса
    buttonClear = keyboard.querySelector("[data-action='clear-all']");

    // устанавливаем начальные значения
    clearAll();

    // вешаем обработчик клика на всю виртуальную клавиатуру целиком
    keyboard.addEventListener("click", function (event) {
        // определяем на какую кнопку было нажатие
        let button = event.target.closest('button');
        if (!button) return;

        let actions = [
            'backspace', 'percent', 'plus-minus', 'point',
            'equals', 'number',
            // 'plus', 'minus', 'multiple', 'divide',
        ];
        // начинаем новый рассчет
        if (!processed && actions.includes(button.dataset.action))
            startCalculator();

        // сравниваем действие из дата атрибута
        switch (button.dataset.action) {
            case 'clear-all':
                handlerClearAll();
                break;
            case 'clear':
                handlerClear();
                break;
            case 'backspace':
                handlerBackspace();
                break;
            case 'plus':
                handlerSetOperator("+");
                break;
            case 'minus':
                handlerSetOperator("-");
                break;
            case 'multiple':
                handlerSetOperator("*");
                break;
            case 'divide':
                handlerSetOperator("/");
                break;
            case 'percent':
                handlerCalculatePercent();
                break;
            case 'plus-minus':
                handlerInvertSign();
                break;
            case 'point':
                handlerInputPoint();
                break;
            case 'equals':
                handlerCalculateResult();
                break;
            case 'number':
                handlerInputNumber(+button.dataset.digit);
                break;
        }
        // меняем кнопку очистки если надо
        switchClearButton();
        // считаем предварительный результат
        calculateResult();
        // уменьшаем шрифт если текст не влезает
        autoFontSize();
    });

    // вешаем обработчик нажатий на физическую клавиатуру
    document.addEventListener('keydown', function (event) {
        let actions = [
            'Backspace', 'Enter',
            '%', '.', ',',
            '0', '1', '2', '3', '4',
            '5', '6', '7', '8', '9',
            // '+', '-', '*', '/',
        ];
        // начинаем новый рассчет
        if (!processed && actions.includes(event.key))
            startCalculator();

        // сравниваем нажатаю кнопку и действие
        switch (event.key) {
            case 'Escape':
                if (event.shiftKey) {
                    event.preventDefault();
                    handlerClearAll();
                } else
                    handlerClear();
                break;
            case 'Backspace':
                handlerBackspace();
                break;
            case '+':
            case '*':
            case '/':
                handlerSetOperator(event.key);
                break;
            case '%':
                handlerCalculatePercent();
                break;
            case '-':
                if (event.ctrlKey) {
                    event.preventDefault();
                    handlerInvertSign();
                } else
                    handlerSetOperator(event.key);
                break;
            case '.':
            case ',':
                handlerInputPoint();
                break;
            case 'Enter':
                handlerCalculateResult();
                break;
            case '1': case '2': case '3':
            case '4': case '5': case '6':
            case '7': case '8': case '9':
            case '0':
                handlerInputNumber(+event.key);
                break;
        }
        // меняем кнопку очистки если надо
        switchClearButton();
        // считаем предварительный результат
        calculateResult();
        // уменьшаем шрифт если текст не влезает
        autoFontSize();
    });
}

// Функции обрабатывающие события

/**
 * Полный сброс
 */
function handlerClearAll() {
    clearAll();
}

/**
 * Очистка текущих данных
 */
function handlerClear() {
    clear();
}

/**
 * Рассчет результата
 */
function handlerCalculateResult() {
    if (numberA) {
        if (!operator) handlerSetOperator('+');
        if (operator && !numberB.length) handlerInputNumber(0);
        // убираем статус в процессе
        historyCurrent.root.classList.remove('history_in-process');
        processed = false;
    }
}

/**
 * Ввод числа
 */
function handlerInputNumber(digit) {
    // какое число будет меняться
    if (!operator) {
        // устанавливаем новое число
        addDigit(numberA, digit);
        historyCurrent.firstNumber.innerHTML = formatNumber(numberA);
    } else {
        addDigit(numberB, digit);
        historyCurrent.secondNumber.innerHTML = formatNumber(numberB);
    }
}

/**
 * Добавление точки
 */
function handlerInputPoint(digit) {
    // какое число будет меняться
    if (!operator) {
        // если число было целое
        addPoint(numberA);
        historyCurrent.firstNumber.innerHTML = formatNumber(numberA);
    } else {
        addPoint(numberB);
        historyCurrent.secondNumber.innerHTML = formatNumber(numberB);
    }
}

/**
 * Высчитать процент
 */
function handlerCalculatePercent() {
    // какое число будет меняться
    if (!operator) {
        // считаем процент
        numberA = calculatePercent(numberA);
        historyCurrent.firstNumber.innerHTML = formatNumber(numberA);
    } else {
        numberB = calculatePercent(numberB);
        historyCurrent.secondNumber.innerHTML = formatNumber(numberB);
    }
}

/**
 * Поменять знак числа
 */
function handlerInvertSign() {
    // какое число будет меняться
    if (!operator) {
        // меняем знак
        invertNumber(numberA);
        historyCurrent.firstNumber.innerHTML = formatNumber(numberA);
    } else {
        invertNumber(numberB);
        historyCurrent.secondNumber.innerHTML = formatNumber(numberB);
    }
}

/**
 * Стирание последного символа
 */
function handlerBackspace() {
    // что будем удалять
    if (numberB.length) {
        // удаляем символ
        removeDigit(numberB);
        historyCurrent.secondNumber.innerHTML = numberB.length ? formatNumber(numberB) : "";
    } else if (operator) {
        handlerSetOperator("");
    } else {
        removeDigit(numberA);
        historyCurrent.firstNumber.innerHTML = formatNumber(numberA);
    }
}

/**
 * Установка оператора
 */
function handlerSetOperator(symbol) {
    // если операция выбирается когда введено второе число
    if (numberB.length) {
        // считаем результат
        handlerCalculateResult();
        let tempResult = String(result).split("");
        startCalculator();
        tempResult.forEach(function (digit) {
            if (digit !== '.') handlerInputNumber(digit);
            else handlerInputPoint();
        });
        handlerSetOperator(symbol);
        return;
    }

    // устанавливаем оператор
    operator = symbol;
    historyCurrent.operator.innerHTML = operator;
}

// Вспомогательные функции

/**
 * Очистка текущих данных
*/
function clear() {
    // сбрасываем переменные в начальное значение
    numberA = [0]; numberB = [];
    result = operator = null;
    processed = true;

    // очищаем строку результатов
    historyCurrent.root.classList.add('history_in-process');
    historyCurrent.firstNumber.innerHTML = 0;
    historyCurrent.secondNumber.innerHTML =
        historyCurrent.operator.innerHTML =
        historyCurrent.equals.innerHTML =
        historyCurrent.result.innerHTML = "";
}

/**
 * Полная очистка калькулятора
*/
function clearAll() {
    // очищаем текущие данные
    clear();
    let history = screen.querySelectorAll('.history');
    for (let line of history) {
        // удаляем строки истории, кроме текущей
        if (!line.matches('.history_current')) line.remove();
    }
}

/**
 * Изменение кнопку на полный сброc
 */
function setButtonClearAll() {
    buttonClear.innerHTML = "AC";
    buttonClear.dataset.action = "clear-all";
}

/**
 * Изменение кнопки на простой сброc
 */
function setButtonClear() {
    buttonClear.innerHTML = "C";
    buttonClear.dataset.action = "clear";
}

/**
 * Проверка какую кнопку очистки показывать
 */
function switchClearButton() {
    (numberA.length > 1 || (numberA.length == 1 && numberA[0] != 0) || operator)
        ? setButtonClear()
        : setButtonClearAll();
}

/**
 * Запуск нового расчета
 */
function startCalculator() {
    saveHistory();
    clear();
}

/**
 * Удалить самую старую историю
 */
function trimHistory() {
    let histories = document.querySelectorAll('.history');
    if (histories.length > 4) {
        histories[0].remove();
        trimHistory(); // <= рекурсия О_о
    }
}

/**
 * Сохранение текущего расчета в историю
 */
function saveHistory() {
    let newHistory = historyCurrent.root.cloneNode(true);
    newHistory.classList.remove('history_current');
    historyCurrent.root.before(newHistory);
    trimHistory();
}

/**
 * Уменьшить шрифт если текст не влезает
 */
function calculateAutoFontSize(elementSelector, parentSelector) {
    let element = document.querySelector(elementSelector);
    let parentElement = element.closest(parentSelector);

    element.style.fontSize = '';

    if (element.offsetWidth >= parentElement.offsetWidth) {
        let fontSize = parseInt(getComputedStyle(element)['font-size']);

        while (element.offsetWidth >= parentElement.offsetWidth) {
            // element.style.transition = 'none';
            if (!fontSize--) break;
            element.style.fontSize = fontSize + 'px';
        }
    }
}

/**
 * Автоматический размер текста
 */
function autoFontSize() {
    calculateAutoFontSize('.history_current .history__operation', '.history');
    calculateAutoFontSize('.history_current .history__result', '.history');
    checkFontSizeForHistories();
}

/**
 * Проверяем размер шрифта в истории
 */
function checkFontSizeForHistories() {
    // для всех рассчетов
    let histories = document.querySelectorAll('.history');
    for (let item of histories) {
        // кроме текущего
        if (item.matches('.history_current')) continue;

        for (let selector of ['.history__operation', '.history__result']) {
            let element = item.querySelector(selector);
            let elementInlineFontSize = parseInt(element.style.fontSize);
            element.style.fontSize = '';
            let elementSourceFontSize = parseInt(getComputedStyle(element)['font-size']);
            // если установленный размер меньше чем исходный, то оставляем инлайн
            console.log(elementInlineFontSize, elementSourceFontSize);
            if (elementInlineFontSize < elementSourceFontSize)
                element.style.fontSize = elementInlineFontSize + 'px';
        }
    }
}

// Функции работы с числами

/**
 * Форматирование числа
 */
function formatNumber(number) {
    let copyNumber = number.slice();
    let textNumber = triple = '';

    // перебираем с конца
    for (let i = copyNumber.length; i > 0; i--) {
        // берем последний элемент
        let digit = copyNumber.pop();
        // если это все что после точки
        if (digit == '.' || copyNumber.includes('.')) {
            // добавляем без пробелов
            textNumber = digit + textNumber;
        } else {
            // если после, то делим по три числа
            triple = digit + triple;
            if (triple.length === 3 || !copyNumber.length) {
                textNumber = '&nbsp;' + triple + textNumber;
                triple = '';
            }
        }
    }
    if (textNumber.startsWith('&nbsp;'))
        textNumber = textNumber.slice(6, textNumber.length);
    return textNumber ? textNumber : '0';
}

/**
 * Добавление цифры к числу
 */
function addDigit(number, digit) {
    // проверка на очень длинное число
    if (number.length >= 15) return;

    // проверка что единственное число ноль
    if (number.length === 1 && number[0] == 0) {
        number.splice(0, 1, digit)
    } else if (number.length === 2 && number[0] == '-' && number[1] == 0) {
        // проверка что это минус ноль
        number.splice(1, 1, digit)
    } else {
        number.push(digit);
    }
}

/**
 * Удаление последнего символа
 */
function removeDigit(number) {
    number.splice(-1, 1);
    // если остался единственный символ -
    if (number.length === 1 && number[0] == '-') number.splice(-1, 1);
}

/**
 * Добавление точки в конец
 */
function addPoint(number) {
    // проверка на очень длинное число
    if (number.length >= 15) return;
    // если число пустое
    if (!number.length) {
        number.push('0', '.');
        return;
    }
    // если еще нет точки
    if (!number.includes('.')) number.push('.');
}

/**
 * Высчитать процент от числа
 */
function calculatePercent(number) {
    // если массив пустой
    if (!number.length) return number;

    let newNumber = String(Number(number.join("")) / 100).split('');

    // если число получилось со степенью
    if (newNumber.includes('e')) return number;

    return newNumber;
}

/**
 * Инвертация знака
 */
function invertNumber(number) {
    // если массив пустой
    if (!number.length) return;

    // если минус уже стоит
    number[0] == '-'
        ? number.shift()
        : number.unshift('-');
}

/**
 * Расчет результата
*/
function calculateResult() {
    let numA = Number(numberA.join(''));
    let numB = Number(numberB.join(''));
    switch (operator) {
        case '+':
            result = numA + numB;
            break;
        case '-':
            result = numA - numB;
            break;
        case '*':
            result = numA * numB;
            break;
        case '/':
            // проверка чтобы второе число не было равно нулю
            if (numberB.length)
                if (numB)
                    result = numA / numB;
                else
                    result = '∞';
            else
                result = numA;
            break;
        default:
            result = numA;
            break;
    }
    // если есть результаты вычисления
    if (numA || operator) {
        if (result != '∞') {
            // оставляем только 7 символов после запятой
            if (result != Number(result).toFixed(0)) {
                result = Number(Number(result).toFixed(7));
            }
            historyCurrent.equals.innerHTML = '=';
            historyCurrent.result.innerHTML = formatNumber(String(result).split(""));
        } else {
            historyCurrent.equals.innerHTML = '';
            historyCurrent.result.innerHTML = result;
        }
    } else {
        historyCurrent.equals.innerHTML =
            historyCurrent.result.innerHTML = '';
    }
}
