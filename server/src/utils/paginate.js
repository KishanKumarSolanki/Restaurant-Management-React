/**
 *  ?page=1&limit=10   -> { data, meta }
 *  ?all=true          -> poori list (dropdowns ke liye), meta = null
 */
export async function paginate(Model, filter, req, { sort = { createdAt: -1 }, populate } = {}) {
  const build = () => {
    let q = Model.find(filter).sort(sort);
    if (populate) q = q.populate(populate);
    return q;
  };

  if (req.query.all === 'true') return { data: await build(), meta: null };

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const [total, data] = await Promise.all([
    Model.countDocuments(filter),
    build().skip((page - 1) * limit).limit(limit),
  ]);
  return { data, meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } };
}
