"use strict";
const stripe = require("stripe")(
  "sk_test_51JYNSMGs3t5gMJGKqufDqqelFFxTZHDWLO2u5jy4ReXlAoruY5jub1R0IB2KQ3zqLwKzn6zcG6wbnLmRksfGjAHO0050iokXFU"
);

module.exports = {
  async create(ctx) {
    const { token, products, idUser, addressShipping } = ctx.request.body;
    let totalPayment = 0;
    products.forEach((product) => {
      totalPayment = totalPayment + product.precio;
    });

    const charge = await stripe.charges.create({
      amount: totalPayment * 100,
      currency: "MXN",
      source: token.id,
      description: `ID Usuario: ${idUser}`,
    });

    const createOrder = [];
    for await (const product of products) {
      const data = {
        game: product.id,
        user: idUser,
        totalPayment,
        idPayment: charge.id,
        addressShipping,
      };
      const validData =
        await strapi.entityValidator.validateEntityCreation(
          strapi.models.order,
          data
        );

      const entry = await strapi.query("order").create(validData);
      createOrder.push(entry);
    }
    return createOrder;
  },
};
