import { prisma } from "../prisma/index.js";
import { hashFunction, generateSalt } from "../utils/hash.js";

class UserService {
    signUp = async (input) => {
        try {
            const salt = generateSalt();
            console.log(salt);
            const hashedPassword = hashFunction(input.password + salt);
            await prisma.user.create({
                data: { ...input, password: `${salt}.${hashedPassword}` }
            });
        } catch (error) {
            throw new Error(error);
        }
    };

    // login = async (input) => {
    //     try {
    //         const user = await prisma.user.findFirst({
    //             where: {
    //                 email: input.email
    //             }
    //         });

    //         if (user) {
    //             if (user.password !== input.password) {
    //                 throw new Error("Invalid Credentials");
    //             } else if (user.password === input.password) {
    //                 return user;
    //             }
    //         } else {
    //             throw new Error("Invalid Credentials");
    //         }
    //     } catch (error) {
    //         throw new Error(error);
    //     }
    // };

    login = async (input) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email: input.email
                }
            });

            if (user) {
                const [salt, userHashedPassword] = user.password.split(".");
                const hashedPassword = hashFunction(input.password + salt);
                console.log(hashedPassword);
                if (userHashedPassword !== hashedPassword) {
                    throw new Error("Invalid Credentials");
                } else if (userHashedPassword === hashedPassword) {
                    return user;
                }
            } else {
                throw new Error("Invalid Credentials");
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
}

export const userService = new UserService();
