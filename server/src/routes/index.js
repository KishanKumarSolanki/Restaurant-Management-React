import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as v from '../validators/index.js';

import * as auth from '../controllers/auth.controller.js';
import * as customers from '../controllers/customer.controller.js';
import * as categories from '../controllers/menuCategory.controller.js';
import * as items from '../controllers/item.controller.js';
import * as orders from '../controllers/order.controller.js';
import * as staff from '../controllers/staff.controller.js';
import * as shifts from '../controllers/shift.controller.js';
import * as assignment from '../controllers/assignment.controller.js';
import { dashboard } from '../controllers/dashboard.controller.js';
import { reports } from '../controllers/report.controller.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ---------- public ----------
router.post('/auth/register', validate(v.registerSchema), auth.register);
router.post('/auth/login', validate(v.loginSchema), auth.login);
router.post('/auth/forgot-password', validate(v.forgotPasswordSchema), auth.forgotPassword);
router.post('/auth/reset-password', validate(v.resetPasswordSchema), auth.resetPassword);

// ---------- yahan se neeche sab login ke baad ----------
router.use(protect);

router.get('/auth/me', auth.me);
router.patch('/profile', validate(v.profileSchema), auth.updateProfile);
router.put('/profile/password', validate(v.passwordUpdateSchema), auth.updatePassword);
router.delete('/profile', validate(v.deleteAccountSchema), auth.deleteAccount);

router.get('/dashboard', dashboard);
router.get('/reports', reports);

router.route('/customers').get(customers.list).post(validate(v.customerSchema), customers.create);
router.get('/customers/:id/details', customers.show);
router.route('/customers/:id').get(customers.getOne).put(validate(v.customerSchema), customers.update).delete(customers.remove);

router.route('/menu-categories').get(categories.list).post(validate(v.menuCategorySchema), categories.create);
router.route('/menu-categories/:id').get(categories.getOne).put(validate(v.menuCategorySchema), categories.update).delete(categories.remove);

router.route('/items').get(items.list).post(validate(v.itemSchema), items.create);
router.route('/items/:id').get(items.getOne).put(validate(v.itemSchema), items.update).delete(items.remove);

router.get('/orders/cart', orders.cart);
router.get('/orders/cart/count', orders.cartCount);
router.route('/orders').get(orders.list).post(validate(v.orderSchema), orders.create);
router.patch('/orders/:id/payment', validate(v.paymentSchema), orders.savePayment);
router.route('/orders/:id').get(orders.getOne).put(validate(v.orderSchema), orders.update).delete(orders.remove);

router.route('/staff-members').get(staff.list).post(validate(v.staffCreateSchema), staff.create);
router.route('/staff-members/:id').get(staff.getOne).put(validate(v.staffUpdateSchema), staff.update).delete(staff.remove);

router.route('/staff-shifts').get(shifts.list).post(validate(v.shiftSchema), shifts.create);
router.route('/staff-shifts/:id').get(shifts.getOne).put(validate(v.shiftSchema), shifts.update).delete(shifts.remove);

router.get('/staff-assignments', assignment.overview);
router.post('/staff-assignments', validate(v.assignmentSchema), assignment.assign);

export default router;
