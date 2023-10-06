import { prisma } from "../prisma/index.js";
import crypto from "crypto-js";

class UserService {
    signUp = async (input) => {
        try {
            await prisma.user.create({
                data: input
            });
        } catch (error) {
            throw new Error(error);
        }
    };
}

export const userService = new UserService();
