import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');

    let query = `
      SELECT 
        p.id, p.title, p.description, p.price, p.image_url, p.status, p.created_at,
        c.name as category_name,
        u.email as seller_email
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN auth_users u ON p.user_id = u.id
      WHERE p.status = 'available'
    `;
    
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (LOWER(p.title) LIKE LOWER($${paramCount}) OR LOWER(p.description) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    if (category && category !== 'all') {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category);
    }

    if (userId) {
      paramCount++;
      query += ` AND p.user_id = $${paramCount}`;
      params.push(userId);
    }

    query += ` ORDER BY p.created_at DESC`;

    const products = await sql(query, params);
    
    return Response.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, categoryId, price, imageUrl } = body;

    if (!title || !price) {
      return Response.json({ error: 'Title and price are required' }, { status: 400 });
    }

    const [product] = await sql`
      INSERT INTO products (user_id, title, description, category_id, price, image_url)
      VALUES (${session.user.id}, ${title}, ${description}, ${categoryId}, ${price}, ${imageUrl})
      RETURNING *
    `;

    return Response.json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}


