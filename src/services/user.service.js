import { prisma } from "../prisma/index.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { bcrypt } from "../utils/bcrypt.js";
import { date } from "../utils/date.js";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { CustomError } from "../utils/custom-error.js";

class UserService {
    signUp = async (userInput, companyInput) => {
        const hashedPassword = await bcrypt.hash(userInput.password);
        const activationToken = crypto.createToken();
        const hashedActivationToken = crypto.hash(activationToken);
        const user = await prisma.user.create({
            data: {
                ...userInput,
                password: hashedPassword,
                activationToken: hashedActivationToken
            },
            select: {
                id: true
            }
        });

        await prisma.company.create({
            data: {
                ...companyInput,
                userId: user.id
            }
        });
        await mailer.sendActivationMail(userInput.email, activationToken);
    };

    login = async (input) => {
        const user = await prisma.user.findFirst({
            where: {
                email: input.email
            },
            select: {
                id: true,
                status: true,
                password: true
            }
        });

        if (!user) throw new CustomError("User does not exists", 404);

        if (user.status === "INACTIVE") {
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    activationToken: hashedActivationToken
                }
            });

            await mailer.sendActivationMail(input.email, activationToken);

            throw new CustomError(
                "We just sent you activation email. Follow instructions",
                400
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            input.password,
            user.password
        );
        if (!isPasswordMatches) {
            throw new CustomError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2 days"
            }
        );

        return token;
    };

    activate = async (token) => {
        const hashedActivationToken = crypto.hash(token);
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
            throw new Error("Invalid Token");
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                status: "ACTIVE",
                activationToken: null
            }
        });
    };

    forgotPassword = async (email) => {
        const user = await prisma.user.findFirst({
            where: {
                email
            },
            select: {
                id: true
            }
        });

        if (!user) {
            throw new Error(
                "We could not find a user with the email you provided"
            );
        }

        const passwordResetToken = crypto.createToken();
        const hashedPasswordResetToken = crypto.hash(passwordResetToken);

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                passwordResetToken: hashedPasswordResetToken,
                passwordResetTokenExpirationDate: date.addMinutes(10)
            }
        });

        await mailer.sendPasswordResetToken(email, passwordResetToken);
    };

    resetPassword = async (token, password) => {
        const hashedPasswordResetToken = crypto.hash(token);
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedPasswordResetToken
            },
            select: {
                id: true,
                passwordResetToken: true,
                passwordResetTokenExpirationDate: true
            }
        });

        if (!user) {
            throw new Error("Invalid Token");
        }

        const currentTime = new Date();
        const tokenExpDate = new Date(user.passwordResetTokenExpirationDate);

        if (tokenExpDate < currentTime) {
            // Token Expired;
            throw new Error("Reset Token Expired");
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: await bcrypt.hash(password),
                passwordResetToken: null,
                passwordResetTokenExpirationDate: null
            }
        });
    };

    getMe = async (userId) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                firstName: true,
                lastName: true,
                preferredFirstName: true,
                email: true,
                id: true
            }
        });

        if (!user) {
            throw new Error("User does not exist anymore, 404");
        }

        const company = await prisma.company.findFirst({
            where: { userId: user.id },
            select: {
                name: true,
                position: true
            }
        });

        return { ...user, company };
    };

    createTask = async (userId, input) => {
        const id = uuid();
        const task = {
            ...input,
            status: "TODO",
            id
        };

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                tasks: {
                    push: task
                }
            }
        });

        return task;
    };

    getTasks = async (userId) => {
        const tasks = await prisma.user.findUnique({
            where: {
                id: userId
            },

            select: {
                tasks: true
            }
        });

        return tasks;
    };

    getTask = async (userId, taskId) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },

            select: {
                tasks: true
            }
        });

        const task = user.tasks.find((task) => task.id === taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        return task;
    };

    deleteTask = async (userId, taskId) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },

            select: {
                tasks: true
            }
        });

        const tasksToKeep = user.tasks.filter((task) => task.id !== taskId);

        if (tasksToKeep.length === user.tasks.length) {
            throw new Error("Task not found");
        }

        await prisma.user.update({
            where: {
                id: userId
            },

            data: {
                tasks: tasksToKeep
            }
        });
    };

    updateTask = async (userId, taskId, input) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },

            select: {
                tasks: true
            }
        });

        const tasksNotToUpdate = [];
        let taskToUpdate = null;

        user.tasks.forEach((task) => {
            if (task.id === taskId) {
                taskToUpdate = task;
            } else {
                tasksNotToUpdate.push(task);
            }
        });

        if (!taskToUpdate) {
            throw new Error("Task not found");
        }

        const updatedTask = {
            ...taskToUpdate,
            ...input
        };

        await prisma.user.update({
            where: {
                id: userId
            },

            data: {
                tasks: [...tasksNotToUpdate, updatedTask]
            }
        });
    };
}

export const userService = new UserService();
