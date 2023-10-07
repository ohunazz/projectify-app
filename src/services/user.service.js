import { prisma } from "../prisma/index.js";
// import { hashFunction, generateSalt } from "../utils/hash.js";
import { hasher } from "../utils/hash.js";

class UserService {
    signUp = async (input) => {
        try {
            // const salt = generateSalt();

            const hashedPassword = await hasher.hash(input.password);
            await prisma.user.create({
                data: { ...input, password: hashedPassword } //`${salt}.${hashedPassword}`
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

            if (!user) {
                // const [salt, userHashedPassword] = user.password.split(".");
                // const hashedPassword = hashFunction(input.password + salt);
                // if (userHashedPassword !== hashedPassword) {
                //     throw new Error("Invalid Credentials");
                // } else if (userHashedPassword === hashedPassword) {
                //     return user;
                // }
            }

            const isPasswordMatch = await hasher.compare(
                input.password,
                user.password
            );
            if (!isPasswordMatch) {
                throw new Error("Invalid Credentials");
            }
        } catch (error) {
            throw error;
        }
    };

    update = async (input, id) => {
        try {
            await prisma.user.update({
                where: { id },
                data: input
            });
        } catch (error) {
            throw error;
        }
    };
}

export const userService = new UserService();
