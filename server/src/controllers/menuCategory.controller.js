import MenuCategory from '../models/MenuCategory.js';
import Item from '../models/Item.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';

const findOr404 = async (id) => {
  const category = await MenuCategory.findById(id);
  if (!category) throw new ApiError(404, 'Menu category not found.');
  return category;
};

const dupCheck = async (name, excludeId) => {
  const filter = { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await MenuCategory.exists(filter)) {
    throw new ApiError(422, 'This category name already exists.', { name: 'This category name already exists.' });
  }
};

export const list = asyncHandler(async (req, res) => {
  const filter = req.query.active === 'true' ? { isActive: true } : {};
  const result = await paginate(MenuCategory, filter, req, { sort: { name: 1 } });

  const counts = await Item.aggregate([{ $group: { _id: '$menuCategory', count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  result.data = result.data.map((c) => ({ ...c.toJSON(), itemsCount: map[c.id] || 0 }));
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => res.json({ category: await findOr404(req.params.id) }));

export const create = asyncHandler(async (req, res) => {
  await dupCheck(req.body.name);
  const category = await MenuCategory.create(req.body);
  res.status(201).json({ category, message: 'Menu category created successfully.' });
});

export const update = asyncHandler(async (req, res) => {
  const category = await findOr404(req.params.id);
  await dupCheck(req.body.name, category.id);
  category.set(req.body);
  await category.save();
  await Item.updateMany({ menuCategory: category.id }, { $set: { category: category.name } });
  res.json({ category, message: 'Menu category updated successfully.' });
});

export const remove = asyncHandler(async (req, res) => {
  const category = await findOr404(req.params.id);
  await Item.updateMany({ menuCategory: category.id }, { $set: { menuCategory: null } });
  await category.deleteOne();
  res.json({ message: 'Menu category deleted successfully.' });
});
