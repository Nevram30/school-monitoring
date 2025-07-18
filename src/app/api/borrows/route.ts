import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { Borrow, Item, Member, Room } from '@/models';
import sequelize from '@/lib/database';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    await sequelize.authenticate();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    let whereClause: any = {};
    
    if (search) {
      // Search in related models
      whereClause[Op.or] = [
        { '$Item.i_model$': { [Op.like]: `%${search}%` } },
        { '$Item.i_deviceID$': { [Op.like]: `%${search}%` } },
        { '$Member.m_fname$': { [Op.like]: `%${search}%` } },
        { '$Member.m_lname$': { [Op.like]: `%${search}%` } },
        { '$Room.r_name$': { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereClause.b_status = parseInt(status);
    }

    const { count, rows } = await Borrow.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Item,
          as: 'Item',
          attributes: ['i_model', 'i_deviceID']
        },
        {
          model: Member,
          as: 'Member',
          attributes: ['m_fname', 'm_lname']
        },
        {
          model: Room,
          as: 'Room',
          attributes: ['r_name']
        }
      ],
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
    console.error('Get borrows error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch borrows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let borrowData: any = null;
  
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

    borrowData = await request.json();
    console.log('Received borrow data:', borrowData);

    // Check if item has enough stock
    const item = await Item.findByPk(borrowData.item_id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.item_rawstock < borrowData.stock_id) {
      return NextResponse.json(
        { success: false, error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // Generate a unique borrow code
    const borrowcode = Date.now();

    const borrowToCreate = {
      member_id: borrowData.member_id,
      item_id: borrowData.item_id,
      room_id: borrowData.room_assigned,
      b_due_date: new Date(borrowData.time_limit),
      b_quantity: borrowData.stock_id,
      b_status: 1, // 1 = borrowed
      b_purpose: null,
      b_notes: null
    };

    console.log('Creating borrow with data:', borrowToCreate);

    const newBorrow = await Borrow.create(borrowToCreate);

    // Update item stock
    await item.update({
      item_rawstock: item.item_rawstock - borrowData.stock_id
    });

    return NextResponse.json({
      success: true,
      data: newBorrow,
      message: 'Borrow record created successfully'
    });

  } catch (error) {
    console.error('Create borrow error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Borrow data received:', borrowData);
    return NextResponse.json(
      { success: false, error: `Failed to create borrow record: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
