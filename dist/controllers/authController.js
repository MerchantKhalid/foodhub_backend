"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProviderProfile = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    try {
        const { email, password, name, phone, address, role, restaurantName, restaurantDescription, restaurantAddress, cuisineType, } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return (0, helpers_1.sendError)(res, 'Email already registered', 409);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user with optional provider profile
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                address,
                role: role,
                ...(role === 'PROVIDER' && restaurantName && restaurantAddress
                    ? {
                        providerProfile: {
                            create: {
                                restaurantName,
                                description: restaurantDescription,
                                address: restaurantAddress,
                                cuisineType,
                            },
                        },
                    }
                    : {}),
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                role: true,
                createdAt: true,
                providerProfile: role === 'PROVIDER',
            },
        });
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
        return (0, helpers_1.sendSuccess)(res, { user, token }, 'Registration successful', 201);
    }
    catch (error) {
        console.error('Registration error:', error);
        return (0, helpers_1.sendError)(res, 'Registration failed', 500);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                providerProfile: true,
            },
        });
        if (!user) {
            return (0, helpers_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Check if user is suspended
        if (user.status === 'SUSPENDED') {
            return (0, helpers_1.sendError)(res, 'Account suspended. Please contact support', 403);
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return (0, helpers_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET || '', { expiresIn: '7d' });
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return (0, helpers_1.sendSuccess)(res, { user: userWithoutPassword, token }, 'Login successful');
    }
    catch (error) {
        console.error('Login error:', error);
        return (0, helpers_1.sendError)(res, 'Login failed', 500);
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                role: true,
                status: true,
                createdAt: true,
                providerProfile: true,
            },
        });
        if (!user) {
            return (0, helpers_1.sendError)(res, 'User not found', 404);
        }
        return (0, helpers_1.sendSuccess)(res, user);
    }
    catch (error) {
        console.error('Get me error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to get user info', 500);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const userId = req.user.userId;
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(address && { address }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                role: true,
                status: true,
                createdAt: true,
                providerProfile: true,
            },
        });
        return (0, helpers_1.sendSuccess)(res, user, 'Profile updated successfully');
    }
    catch (error) {
        console.error('Update profile error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to update profile', 500);
    }
};
exports.updateProfile = updateProfile;
const updateProviderProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { restaurantName, description, address, openingHours, closingHours, cuisineType, imageUrl, } = req.body;
        const providerProfile = await prisma.providerProfile.upsert({
            where: { userId },
            update: {
                ...(restaurantName && { restaurantName }),
                ...(description !== undefined && { description }),
                ...(address && { address }),
                ...(openingHours && { openingHours }),
                ...(closingHours && { closingHours }),
                ...(cuisineType && { cuisineType }),
                ...(imageUrl !== undefined && { imageUrl }),
            },
            create: {
                userId,
                restaurantName: restaurantName || 'My Restaurant',
                address: address || '',
                description,
                openingHours,
                closingHours,
                cuisineType,
                imageUrl,
            },
        });
        return (0, helpers_1.sendSuccess)(res, providerProfile, 'Provider profile updated successfully');
    }
    catch (error) {
        console.error('Update provider profile error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to update provider profile', 500);
    }
};
exports.updateProviderProfile = updateProviderProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return (0, helpers_1.sendError)(res, 'User not found', 404);
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return (0, helpers_1.sendError)(res, 'Current password is incorrect', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return (0, helpers_1.sendSuccess)(res, null, 'Password changed successfully');
    }
    catch (error) {
        console.error('Change password error:', error);
        return (0, helpers_1.sendError)(res, 'Failed to change password', 500);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map