import cron from 'node-cron';
import prisma from './db.js';

// This cron job runs every minute and deletes every poll which exist for more than 15min in db
cron.schedule('* * * * *', async () => {
    console.log("Running Scheduler from src/hooks.server.js!");
    try {
        const currentTime = new Date();
        const threshold = new Date(currentTime - 15 * 60 * 1000);

        const pollsToDelete = await prisma.poll.findMany({
            where: {
                createdAt: {
                    lt: threshold
                }
            }
        });

        for (const poll of pollsToDelete) {
            const expirationTime = new Date(poll.createdAt.getTime() + 24 * 60 * 60 * 1000);

            if (currentTime >= expirationTime) {
                await prisma.poll.delete({
                    where: {
                        id: poll.id
                    }
                });
                console.log(`Poll with ID ${poll.id} deleted`);
            }
        }
    } catch (error) {
        console.error('Failed to delete polls:', error);
    }
});