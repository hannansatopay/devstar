import prisma from "$lib/prisma";

export const actions = {
    default: async ({ request }) => {
        const data = Object.fromEntries(await request.formData());
        const id = data.id ? parseInt(data.id) : undefined;
        const name = data.name;
        const content = data.content;
        const color = data.color;

        if (id) {
            await prisma.Sticky_Notes.update({
                where: { id },
                data: {
                    name,
                    content,
                    color
                }
            });
        } else {
            await prisma.Sticky_Notes.create({
                data: {
                    name,
                    content,
                    color
                }
            });
        }
    }
};

export const load = async () => {
    const result = await prisma.Sticky_Notes.findMany();
    return { Notes: result };
};


