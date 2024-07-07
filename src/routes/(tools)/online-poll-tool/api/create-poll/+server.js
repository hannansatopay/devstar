import prisma from '../../lib/db.js';
import { encode } from 'base-64'; // Using base-64 encoding

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

  const encryptedId = encode(poll.id.toString());

  return new Response(JSON.stringify({ id: encryptedId }), { status: 201 });
}