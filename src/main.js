/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;


    const discountDecimal = discount / 100;
    const fullPrice = sale_price * quantity;
    const revenue = fullPrice * (1 - discountDecimal);
    
    return revenue;
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 * 
 */

function calculateBonuses(sellers, bonusStrategy) {
    const sorted = [...sellers].sort((a, b) => b.profit - a.profit);

    const total = sorted.length;

    return sorted.map((seller, index) => {
    const bonusPercent = bonusStrategy(index, total, seller);

    const bonusAmount = seller.profit * (bonusPercent / 100);

    return {
    ...seller,
    bonusPercent,
    bonusAmount,
    };
});
}

function calculateBonusByProfit(index, total, seller) {
const { profit } = seller;

// 1 место (индекс 0) → 15%
if (index === 0) {
    return 15;
}

// 2 и 3 место (индексы 1 и 2) → 10%
if (index === 1 || index === 2) {
    return 10;
}

// Последнее место (индекс total - 1) → 0%
if (index === total - 1) {
    return 0;
}

// Все остальные → 5%
return 5;}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    
    const { calculateRevenue, calculateBonus } = options;
    // @TODO: Проверка наличия опций

    // @TODO: Подготовка промежуточных данных для сбора статистики

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    // @TODO: Расчет выручки и прибыли для каждого продавца

    // @TODO: Сортировка продавцов по прибыли

    // @TODO: Назначение премий на основе ранжирования

    // @TODO: Подготовка итоговой коллекции с нужными полями
}
