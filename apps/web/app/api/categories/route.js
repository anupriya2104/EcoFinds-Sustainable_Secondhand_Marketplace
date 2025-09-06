import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, description 
      FROM categories 
      ORDER BY name ASC
    `;
    
    return Response.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}


