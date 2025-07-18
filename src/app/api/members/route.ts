import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { Member } from '@/models';
import sequelize from '@/lib/database';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { m_fname: { [Op.like]: `%${search}%` } },
          { m_lname: { [Op.like]: `%${search}%` } },
          { m_department: { [Op.like]: `%${search}%` } },
          { m_school_id: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Member.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'DESC']]
    });

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let memberData: any = null;
  
  try {
    await sequelize.authenticate();

    // Verify authentication using NextAuth session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    memberData = await request.json();
    console.log('Received member data:', memberData);

    // Convert member type to integer
    const getTypeNumber = (type: string) => {
      switch (type.toLowerCase()) {
        case 'student': return 1;
        case 'faculty': return 2;
        case 'staff': return 3;
        default: return 1;
      }
    };

    const memberToCreate = {
      m_school_id: Date.now().toString(), // Generate a unique school ID as string
      m_fname: memberData.m_fname,
      m_lname: memberData.m_lname,
      m_gender: 'N/A', // Default value since frontend doesn't collect this (max 10 chars)
      m_contact: memberData.m_contact || '',
      m_department: memberData.m_address || 'General', // Using address field as department for now
      m_year_section: 'N/A', // Default value since frontend doesn't collect this
      m_type: getTypeNumber(memberData.m_type),
      m_password: '', // Default empty password
      m_status: 1
    };

    console.log('Creating member with data:', memberToCreate);

    const newMember = await Member.create(memberToCreate);

    return NextResponse.json({
      success: true,
      data: newMember,
      message: 'Member created successfully'
    });

  } catch (error) {
    console.error('Create member error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Member data received:', memberData);
    return NextResponse.json(
      { success: false, error: `Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
