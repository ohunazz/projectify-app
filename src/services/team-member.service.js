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
}

export const teamMemberService = new TeamMemberService();
