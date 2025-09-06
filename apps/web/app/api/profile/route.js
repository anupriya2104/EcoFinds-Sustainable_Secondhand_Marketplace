import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile] = await sql`
      SELECT 
        u.id, u.name, u.email,
        p.username, p.phone, p.address
      FROM auth_users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ${session.user.id}
    `;

    return Response.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, phone, address } = body;

    // Update auth_users table if name is provided
    if (name !== undefined) {
      await sql`
        UPDATE auth_users 
        SET name = ${name}
        WHERE id = ${session.user.id}
      `;
    }

    // Check if profile exists
    const [existingProfile] = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (existingProfile) {
      // Update existing profile
      const updates = [];
      const values = [];
      let paramCount = 0;

      if (username !== undefined) {
        paramCount++;
        updates.push(`username = $${paramCount}`);
        values.push(username);
      }
      if (phone !== undefined) {
        paramCount++;
        updates.push(`phone = $${paramCount}`);
        values.push(phone);
      }
      if (address !== undefined) {
        paramCount++;
        updates.push(`address = $${paramCount}`);
        values.push(address);
      }

      if (updates.length > 0) {
        paramCount++;
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(session.user.id);

        const query = `
          UPDATE user_profiles 
          SET ${updates.join(', ')}
          WHERE user_id = $${paramCount}
        `;

        await sql(query, values);
      }
    } else {
      // Create new profile
      await sql`
        INSERT INTO user_profiles (user_id, username, phone, address)
        VALUES (${session.user.id}, ${username}, ${phone}, ${address})
      `;
    }

    // Return updated profile
    const [profile] = await sql`
      SELECT 
        u.id, u.name, u.email,
        p.username, p.phone, p.address
      FROM auth_users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ${session.user.id}
    `;

    return Response.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}


