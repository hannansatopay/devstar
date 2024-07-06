import prisma from '../../../lib/db.js';

export async function GET({ params }) {
  const poll = await prisma.poll.findUnique({
    where: { id: params.id }
  });

  if (!poll) {
    return new Response('Poll not found', { status: 404 });
  }

  return new Response(JSON.stringify(poll), { status: 200 });
}