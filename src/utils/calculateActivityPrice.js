export const calculateActivityPrice = ({
  variant,
  participants,
  addons = [],
}) => {
  let subtotal = 0;

  // Participants pricing
  participants.forEach((p) => {
    const pricing = variant.pricing.find((price) => price.label === p.label);
    if (!pricing) {
      throw new Error(`Pricing not found for ${p.label}`);
    }
    subtotal += pricing.price * p.quantity;
  });

  // Addons pricing
  addons.forEach((addon) => {
    subtotal += addon.price;
  });

  // Discount
  if (variant.discount?.percentage) {
    subtotal -= (subtotal * variant.discount.percentage) / 100;
  }

  return {
    subtotal,
    total: subtotal, // tax can be added later
  };
};
