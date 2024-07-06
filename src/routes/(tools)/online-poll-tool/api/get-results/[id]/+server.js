import prisma from '../../../lib/db.js';

export async function GET({ params }) {
  const poll = await prisma.poll.findUnique({
    where: { id: params.id }
  });

  if (!poll) {
    return new Response('Poll not found', { status: 404 });
  }

  const results = poll.options.map(option => ({
    text: option,
    votes: poll.votes.filter(vote => vote === option).length
  }));

  return new Response(JSON.stringify({ options: results }), { status: 200 });
}