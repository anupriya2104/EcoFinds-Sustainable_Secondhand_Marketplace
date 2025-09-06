import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await sql`
      SELECT 
        ci.id, ci.quantity,
        p.id as product_id, p.title, p.price, p.image_url,
        u.email as seller_email
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN auth_users u ON p.user_id = u.id
      WHERE ci.user_id = ${session.user.id}
      ORDER BY ci.created_at DESC
    `;

    return Response.json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return Response.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if product exists and is available
    const [product] = await sql`
      SELECT id, user_id FROM products WHERE id = ${productId} AND status = 'available'
    `;

    if (!product) {
      return Response.json({ error: 'Product not found or not available' }, { status: 404 });
    }

    // Prevent users from adding their own products to cart
    if (product.user_id === session.user.id) {
      return Response.json({ error: 'Cannot add your own product to cart' }, { status: 400 });
    }

    // Check if item already in cart
    const [existingItem] = await sql`
      SELECT id FROM cart_items WHERE user_id = ${session.user.id} AND product_id = ${productId}
    `;

    if (existingItem) {
      return Response.json({ error: 'Product already in cart' }, { status: 400 });
    }

    const [cartItem] = await sql`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (${session.user.id}, ${productId}, ${quantity})
      RETURNING *
    `;

    return Response.json({ cartItem });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return Response.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}


