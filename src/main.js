/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
    // @TODO: Расчет выручки от операции
    const { discount, sale_price, quantity } = purchase;
    const discountCoefficient = 1 - purchase.discount / 100;
    return sale_price * quantity * discountCoefficient;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
    if (index === 0) {
        return +(profit * 0.15).toFixed(2);
    } else if (index === 1 || index === 2) {
        return +(profit * 0.1).toFixed(2);
    } else if (index === total - 1) {
        return 0;
    } else {
        // Для всех остальных
        return +(profit * 0.05).toFixed(2);
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (
        !data ||
        !Array.isArray(data.sellers) ||
        !Array.isArray(data.purchase_records) ||
        !Array.isArray(data.products) ||
        data.sellers.length === 0 ||
        data.purchase_records.length === 0 ||
        data.products.length === 0
    ) {
        throw new Error("Некорректные входные данные");
    }
    // @TODO: Проверка наличия опций
    const { calculateRevenue, calculateBonus } = options;
    if (
        typeof calculateRevenue !== "function" ||
        typeof calculateBonus !== "function"
    ) {
        throw new Error(
            "Ой-йой! calculateRevenue и/или calculateBonus не функции!",
        );
    }
    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map((seller) => {
        return {
            seller_id: seller.id,
            name: seller.first_name + " " + seller.last_name,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {},
            top_products: [],
            bonus: 0,
        };
    });

    //{
    //     seller_id: "seller_1",
    //     name: "Alexey Petrov",
    //     revenue: 123456,
    //     profit: 12345,
    //     sales_count: 20,
    //     top_products: [...],
    //     bonus: 1234
    // }

    // @TODO: Индексация продавцов и товаров для быстрого доступа

    const sellerIndex = Object.fromEntries(
        sellerStats.map((seller) => {
            return [seller.seller_id, seller];
        }),
    );
    const productIndex = Object.fromEntries(
        data.products.map((product) => {
            return [product.sku, product];
        }),
    );
    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach((record) => {
        // Чек
        const seller = sellerIndex[record.seller_id]; // Продавец
        seller.sales_count += 1; // Увеличить количество продаж
        seller.revenue += record.total_amount; // Увеличить общую сумму выручки всех продаж

        // Расчёт прибыли для каждого товара
        record.items.forEach((item) => {
            const product = productIndex[item.sku]; // Товар
            const cost = product.purchase_price * item.quantity; // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
            const revenue = calculateRevenue(item, product); // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
            seller.profit += revenue - cost; // Посчитать прибыль: выручка минус себестоимость
            // Увеличить общую накопленную прибыль (profit) у продавца

            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity; // По артикулу товара увеличить его проданное количество у продавца
        });
    });

    // @TODO: Сортировка продавцов по прибыли

    sellerStats.sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sellerStats.length, seller); // Считаем бонус
        seller.top_products = Object.entries(seller.products_sold); // Формируем топ-10 товаров
        seller.top_products = seller.top_products.map(([sku, quantity]) => ({
            sku,
            quantity,
        }));
        seller.top_products = seller.top_products.sort(
            (a, b) => b.quantity - a.quantity,
        );
        seller.top_products = seller.top_products.slice(0, 10);
    });
    // @TODO: Подготовка итоговой коллекции с нужными полями
    sellerStats.forEach((seller) => {
        seller.revenue = +seller.revenue.toFixed(2);
        seller.profit = +seller.profit.toFixed(2);
    });
    return sellerStats.map((seller) => ({
        seller_id: seller.seller_id,
        name: seller.name,
        revenue: seller.revenue,
        profit: seller.profit,
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: seller.bonus,
    }));
}
