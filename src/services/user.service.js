import { prisma } from "../prisma/index.js";
import { hasher, crypto } from "../utils/hash.js";
import { mailer } from "../utils/mailer.js";

class UserService {
    signUp = async (input) => {
        try {
            const hashedPassword = await hasher.hash(input.password);
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);
            console.log(activationToken, hashedActivationToken);
            await prisma.user.create({
                data: {
                    ...input,
                    password: hashedPassword,
                    activationToken: hashedActivationToken
                }
            });
            await mailer.sendActivationMail(input.email, activationToken);
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

    activate = async (token) => {
        try {
            const hashedActivationToken = crypto.hash(token);
            console.log(hashedActivationToken);

            const user = await prisma.user.findFirst({
                where: {
                    activationToken: hashedActivationToken
                },

                select: {
                    id: true,
                    activationToken: true
                }
            });

            if (!user) {
                throw new Error("User not found with provided token");
            }

            const isTokenMatchs = crypto.compare(token, user.activationToken);
            if (!isTokenMatchs) {
                throw new Error("Invalid Token");
            }

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    status: "ACTIVE",
                    activationToken: ""
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
}

export const userService = new UserService();
