import prisma from '../../lib/db.js';

export async function POST({ request }) {
  const { question, pollType, options } = await request.json();

  const poll = await prisma.poll.create({
    data: {
      question,
      pollType,
      options,
      votes: []
    }
  });

  return new Response(JSON.stringify({ id: poll.id }), { status: 201 });
}