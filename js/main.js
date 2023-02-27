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
    result;

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

    // вешаем обработчик клика на всю клавиатуру целиком
    keyboard.addEventListener("click", function (event) {
        // определяем на какую кнопку было нажатие
        let button = event.target.closest('button');
        if (!button) return;
        // сравниваем действие из дата атрибута
        switch (button.dataset.action) {
            case 'clear-all':
                clearAll();
                break;
            case 'clear':
                clear();
                break;
            case 'backspace':
                backspace();
                break;
            case 'plus':
                setOperator("+");
                break;
            case 'minus':
                setOperator("-");
                break;
            case 'multiple':
                setOperator("*");
                break;
            case 'divide':
                setOperator("/");
                break;
            case 'percent':
                setOperator("%");
                break;
            case 'plus-minus':
                invertSign();
                break;
            case 'point':
                break;
            case 'equals':
                calculateResult();
                break;
            case 'number':
                inputNumber(+button.dataset.digit);
                break;
        }
    });
}

/**
 * Функция очистки текущих данных
*/
function clear() {
    // сбрасываем переменные в начальное значение
    numberA = 0;
    numberB = result = operator = null;

    // очищаем строку результатов
    historyCurrent.root.classList.add('history_in-process');
    historyCurrent.firstNumber.textContent = 0;
    historyCurrent.secondNumber.textContent =
    historyCurrent.operator.textContent =
    historyCurrent.equals.textContent =
    historyCurrent.result.textContent = "";

    // меняем кнопку сброса на кнопку полного сброса
    clearToClearAll();
}

/**
 * Функция полной очистки калькулятора
*/
function clearAll() {
    // очищаем текущие данные
    clear(); // 
    let history = screen.querySelectorAll('.history');
    for (let line of history) {
        if (!line.matches('.history_current')) {
            // удаляем строки истории, кроме текущей
            line.remove();
        }
    }
}

/**
 * Функция меняющая кнопку на полный сброc
 */
function clearToClearAll() {
    buttonClear.textContent = "AC";
    buttonClear.dataset.action = "clear-all";
}

/**
 * Функция меняющая кнопку на простой сброc
 */
function clearAllToClear() {
    buttonClear.textContent = "C";
    buttonClear.dataset.action = "clear";
}

/**
 * Функция расчета результата
*/
function calculateResult() {
    if (numberA) {
        // убираем статус в процессе
        historyCurrent.root.classList.remove('history_in-process');
    }
}


/**
 * Функция ввода числа
 */
function inputNumber(digit) {
    // какое число будет меняться
    if (!operator) {
        // устанавливаем новое число
        numberA = addDigit(numberA, digit);
        historyCurrent.firstNumber.textContent = numberA.toLocaleString('ru');
    } else {
        numberB = addDigit(numberB, digit);
        historyCurrent.secondNumber.textContent = numberB.toLocaleString('ru');
    }

    if (numberA) {
        // меняем кнопку на просто очистку
        clearAllToClear();
    }
}

/**
 * Функция добавления цифры к числу
 */
function addDigit(number, digit) {
    // добавляем цифру в конец
    let newNumber = number*10 + digit;

    // проверка на очень длинное число
    if (String(newNumber).length > 15) newNumber = number;

    return newNumber;
}

/**
 * Функция удаления последней цифры
 */
function removeDigit(number) {
    number = (number / 10) - (number % 10 / 10); 
    return number;
}

/**
 * Функция инвертации знака
 */
function invertSign() {
    // какое число будет меняться
    if (!operator) {
        // устанавливаем новое число
        numberA = numberA ? -numberA : numberA;
        historyCurrent.firstNumber.textContent = numberA.toLocaleString('ru');
    } else {
        numberB = numberB ? -numberB : numberB;
        historyCurrent.secondNumber.textContent = numberB.toLocaleString('ru');
    }
}

/**
 * Функция удаления последнего символа
 */
function backspace() {
    // что будем удалять
    if (numberB !== null) {
        numberB = removeDigit(numberB);
        numberB = numberB ? numberB : null;
        historyCurrent.secondNumber.textContent = numberB ? numberB.toLocaleString('ru') : "";
    } else if (operator) {
        setOperator("");
    } else {
        numberA = removeDigit(numberA);
        historyCurrent.firstNumber.textContent = numberA.toLocaleString('ru');
    }

    if (!numberA) {
        // меняем кнопку на полный сброс
        clearToClearAll();
    }
}

/**
 * Функция установки оператора
 */
function setOperator(symbol) {
    // меняем кнопку на просто очистку
    clearAllToClear();

    // если операция выбирается когда введено второе число
    if (numberB) {
        // считаем результат
        calculateResult();
    }

    // устанавливаем оператор
    operator = symbol;
    historyCurrent.operator.textContent = operator;
}


// расчет введенных данных
// добавление точки - дробных чисел

// продолжение рассчета на основе последних данных
// сохранение в историю

// добавить функцию которая проверяет сколько символов и автоматом уменьшает шрифт

// добавить обработчик ввода с клавиатуры

// проверка деления на ноль