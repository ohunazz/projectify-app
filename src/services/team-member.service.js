import { prisma } from "../prisma/index.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { CustomError } from "../utils/custom-error.js";
import { bcrypt } from "../utils/bcrypt.js";

class TeamMemberService {
    create = async (adminId, input) => {
        const inviteToken = crypto.createToken();
        const hashedInviteToken = crypto.hash(inviteToken);

        await prisma.teamMember.create({
            data: {
                ...input,
                adminId: adminId,
                inviteToken: hashedInviteToken
            }
        });

        await mailer.sendCreatePasswordInviteToTeamMember(
            input.email,
            inviteToken
        );
    };

    login = async (input) => {
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                email: input.email
            },
            select: {
                id: true,
                status: true,
                password: true,
                password: true
            }
        });

        if (!teamMember) throw new CustomError("User does not exists", 404);

        if (teamMember.status === "INACTIVE" && !teamMember.password) {
            const inviteToken = crypto.createToken();
            const hashedInviteToken = crypto.hash(inviteToken);

            await prisma.teamMember.update({
                where: {
                    id: teamMember.id
                },
                data: {
                    activationToken: hashedInviteToken
                }
            });

            await mailer.sendCreatePasswordInviteToTeamMember(
                input.email,
                inviteToken
            );

            throw new CustomError(
                "We just sent you password setup email. Follow instructions",
                400
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            input.password,
            teamMember.password
        );
        if (!isPasswordMatches) {
            throw new CustomError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            {
                teamMemberId: teamMember.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2 days"
            }
        );

        return token;
    };

    createPassword = async (inviteToken, password, email) => {
        const hashedInviteToken = crypto.hash(inviteToken);
        const hashedPassword = await bcrypt.hash(password);

        const admin = await prisma.teamMember.findFirst({
            where: {
                inviteToken: hashedInviteToken
            }
        });

        if (!admin) {
            throw new CustomError("Invalid Token", 400);
        }

        await prisma.teamMember.update({
            where: {
                email: email,
                inviteToken: hashedInviteToken
            },

            data: {
                password: hashedPassword,
                status: "ACTIVE",
                inviteToken: null
            }
        });
    };

    getAll = async (adminId) => {
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                adminId: adminId
            },

            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                createdAt: true
            }
        });
        return teamMembers;
    };

    verifyTeamMemberandAdminRelation = async (id, adminId) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id,
                adminId
            }
        });

        if (!teamMember) {
            throw new CustomError(
                "Forbidden: Team Member does not belong to you or it does not exist",
                403
            );
        }
    };
}

export const teamMemberService = new TeamMemberService();
