import { prisma } from "../prisma/index.js";

class UserService {
    signUp = async (input) => {
        // console.log(input);
        // const finalInput = { ...input };
        try {
            await prisma.user.create({
                data: input
            });
        } catch (error) {
            return error;
            // throw new Error(error);
        }
    };
}

export const userService = new UserService();
