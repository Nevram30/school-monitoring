import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { Room } from '@/models';
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
    
    const whereClause = search ? {
      [Op.or]: [
        { r_name: { [Op.like]: `%${search}%` } },
        { r_description: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Room.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let roomData: any = null;
  
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

    roomData = await request.json();
    console.log('Received room data:', roomData);
    
    const { r_name, r_description } = roomData;

    const roomToCreate = {
      r_name,
      r_description: r_description || null,
      r_status: 1
    };

    console.log('Creating room with data:', roomToCreate);

    const room = await Room.create(roomToCreate);

    return NextResponse.json({
      success: true,
      data: room,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Room data received:', roomData);
    return NextResponse.json(
      { success: false, error: `Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
