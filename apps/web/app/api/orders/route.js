import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await sql`
      SELECT 
        o.id, o.total_amount, o.status, o.created_at,
        p.id as product_id, p.title, p.image_url,
        seller.email as seller_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN auth_users seller ON o.seller_id = seller.id
      WHERE o.buyer_id = ${session.user.id}
      ORDER BY o.created_at DESC
    `;

    return Response.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return Response.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get product details
    const [product] = await sql`
      SELECT id, user_id, price, status FROM products WHERE id = ${productId}
    `;

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status !== 'available') {
      return Response.json({ error: 'Product is not available' }, { status: 400 });
    }

    if (product.user_id === session.user.id) {
      return Response.json({ error: 'Cannot purchase your own product' }, { status: 400 });
    }

    // Create order and update product status in a transaction
    const [order] = await sql.transaction([
      sql`
        INSERT INTO orders (buyer_id, seller_id, product_id, total_amount)
        VALUES (${session.user.id}, ${product.user_id}, ${productId}, ${product.price})
        RETURNING *
      `,
      sql`
        UPDATE products SET status = 'sold' WHERE id = ${productId}
      `,
      sql`
        DELETE FROM cart_items WHERE product_id = ${productId}
      `
    ]);

    return Response.json({ order: order[0] });
  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}


