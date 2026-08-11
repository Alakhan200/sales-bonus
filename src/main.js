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
}

/**
 * Функция для расчета бонусов (возвращает сумму в рублях)
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;

    let bonusPercent = 0;

    if (index === 0) {
        bonusPercent = 15;
    } else if (index === 1 || index === 2) {
        bonusPercent = 10;
    } else if (index === total - 1) {
        bonusPercent = 0;
    } else {
        bonusPercent = 5;
    }

    return profit * (bonusPercent / 100);
}

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

    if (typeof options !== "object") {
        throw new Error("Ошибка: опции не являются объектом");
    }

    const { calculateRevenue, calculateBonus } = options;

    if (!calculateRevenue || !calculateBonus) {
        throw new Error("Ошибка: не переданы функции для расчёта");
    }

    if (typeof calculateRevenue !== "function") {
        throw new Error("Ошибка: calculateRevenue не является функцией");
    }
    if (typeof calculateBonus !== "function") {
        throw new Error("Ошибка: calculateBonus не является функцией");
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
        const seller = sellerIndex[record.seller_id];

        // Увеличиваем количество продаж на 1
        seller.sales_count += 1;

        for (const item of record.items) {
            const product = productIndex[item.sku];
            const cost = product.purchase_price * item.quantity;
            const revenue = calculateRevenue(item, null);
            const profit = revenue - cost;

            // Добавляем выручку и прибыль
            seller.revenue += revenue;
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

    return sellerStats.map((seller) => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2),
    }));
}
