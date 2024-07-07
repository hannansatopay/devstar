import prisma from '../../../lib/db.js';
import { decode } from 'base-64';

export async function GET({ params }) {
  const decryptedId = decode(params.id);

  const poll = await prisma.poll.findUnique({
    where: { id: decryptedId }
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