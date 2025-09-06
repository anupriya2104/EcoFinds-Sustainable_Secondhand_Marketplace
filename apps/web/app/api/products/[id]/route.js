import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const [product] = await sql`
      SELECT 
        p.id, p.title, p.description, p.price, p.image_url, p.status, p.created_at, p.user_id,
        c.name as category_name,
        u.email as seller_email
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN auth_users u ON p.user_id = u.id
      WHERE p.id = ${id}
    `;

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { title, description, categoryId, price, imageUrl, status } = body;

    // Check if user owns this product
    const [existingProduct] = await sql`
      SELECT user_id FROM products WHERE id = ${id}
    `;

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existingProduct.user_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }
    if (categoryId !== undefined) {
      paramCount++;
      updates.push(`category_id = $${paramCount}`);
      values.push(categoryId);
    }
    if (price !== undefined) {
      paramCount++;
      updates.push(`price = $${paramCount}`);
      values.push(price);
    }
    if (imageUrl !== undefined) {
      paramCount++;
      updates.push(`image_url = $${paramCount}`);
      values.push(imageUrl);
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE products 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const [product] = await sql(query, values);

    return Response.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user owns this product
    const [existingProduct] = await sql`
      SELECT user_id FROM products WHERE id = ${id}
    `;

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existingProduct.user_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await sql`DELETE FROM products WHERE id = ${id}`;

    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}


