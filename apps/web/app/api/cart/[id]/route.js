import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if cart item belongs to user
    const [existingItem] = await sql`
      SELECT user_id FROM cart_items WHERE id = ${id}
    `;

    if (!existingItem) {
      return Response.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (existingItem.user_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await sql`DELETE FROM cart_items WHERE id = ${id}`;

    return Response.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return Response.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}


