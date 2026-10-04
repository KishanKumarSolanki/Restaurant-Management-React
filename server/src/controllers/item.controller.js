import mongoose from 'mongoose';
import Item from '../models/Item.js';
import MenuCategory from '../models/MenuCategory.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paginate } from '../utils/paginate.js';

const findOr404 = async (id) => {
  const item = mongoose.isValidObjectId(id) ? await Item.findById(id) : null;
  if (!item) throw new ApiError(404, 'Item not found.');
  return item;
};

async function resolveCategory(id) {
  const category = mongoose.isValidObjectId(id) ? await MenuCategory.findById(id) : null;
  if (!category) throw new ApiError(422, 'Selected category does not exist.', { menuCategory: 'Selected category does not exist.' });
  return category;
}

export const list = asyncHandler(async (req, res) => {
  res.json(await paginate(Item, {}, req, { sort: { name: 1 } }));
});

export const getOne = asyncHandler(async (req, res) => res.json({ item: await findOr404(req.params.id) }));

export const create = asyncHandler(async (req, res) => {
  const category = await resolveCategory(req.body.menuCategory);
  const item = await Item.create({ ...req.body, menuCategory: category.id, category: category.name });
  res.status(201).json({ item, message: 'Item created successfully.' });
});

export const update = asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  const category = await resolveCategory(req.body.menuCategory);
  item.set({ ...req.body, menuCategory: category.id, category: category.name });
  await item.save();
  res.json({ item, message: 'Item updated successfully.' });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await findOr404(req.params.id);
  await item.deleteOne();
  res.json({ message: 'Item deleted successfully.' });
});
