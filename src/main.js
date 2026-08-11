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
    if (
    !data ||
    !Array.isArray(data.sellers) ||
    data.sellers.length === 0 ||
    !Array.isArray(data.products) ||
    data.products.length === 0 ||
    !Array.isArray(data.purchase_records) ||
    data.purchase_records.length === 0
) {
    throw new Error("Некорректные входные данные");
    }



    if (typeof options !== 'object') {
        throw new Error('Ошибка: опции не являются объектом');
    }

    const { calculateRevenue, calculateBonus } = options;

    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Ошибка: не переданы функции для расчёта');
    }

    if (typeof calculateRevenue !== 'function') {
        throw new Error('Ошибка: calculateRevenue не является функцией');
    }
    if (typeof calculateBonus !== 'function') {
        throw new Error('Ошибка: calculateBonus не является функцией');
    }



    const sellerStats = data.sellers.map((seller) => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {},
    }));



    const sellerIndex = {};
    for (const seller of sellerStats) {
        sellerIndex[seller.id] = seller;
    }

    const productIndex = {};
    for (const product of data.products) {
        productIndex[product.sku] = product;
    }

    for (const record of data.purchase_records) {
      // Находим продавца по ID из чека
    const seller = sellerIndex[record.seller_id];

      // Увеличиваем количество продаж на 1
    seller.sales_count += 1;

      // Увеличиваем выручку на общую сумму чека
    seller.revenue += record.total_amount;

      // Проходим по каждому товару в чеке
    for (const item of record.items) {
        // Находим товар по артикулу
        const product = productIndex[item.sku];

        // Считаем себестоимость
        const cost = product.purchase_price * item.quantity;

        // Считаем выручку с этого товара (используем переданную функцию)
        const revenue = calculateRevenue(item, null);

        // Считаем прибыль
        const profit = revenue - cost;

        // Добавляем прибыль к общей прибыли продавца
        seller.profit += profit;

        // Запоминаем, какой товар продал продавец
        if (!seller.products_sold[item.sku]) {
            seller.products_sold[item.sku] = 0;
        }
        seller.products_sold[item.sku] += item.quantity;
        }
    }


    
    sellerStats.sort((a, b) => b.profit - a.profit);

    sellerStats.forEach((seller, index) => {
        const total = sellerStats.length;
        const bonusPercent = calculateBonus(index, total, seller);
        seller.bonus = seller.profit * (bonusPercent / 100);

        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    // ЕДИНСТВЕННЫЙ return — с округлением
    return sellerStats.map((seller) => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
}
