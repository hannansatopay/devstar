import prisma from '../../../lib/db.js';

export async function POST({ params, request }) {
  const { option } = await request.json();

  const poll = await prisma.poll.update({
    where: { id: params.id },
    data: {
      votes: {
        push: option
      }
    }
  });

  return new Response(null, { status: 200 });
}