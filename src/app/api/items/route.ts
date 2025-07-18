import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { Item } from '@/models';
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
          { i_model: { [Op.like]: `%${search}%` } },
          { i_category: { [Op.like]: `%${search}%` } },
          { i_brand: { [Op.like]: `%${search}%` } },
          { i_description: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const { count, rows } = await Item.findAndCountAll({
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
    console.error('Get items error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const itemData = await request.json();

    const newItem = await Item.create({
      i_deviceID: itemData.i_deviceID,
      i_model: itemData.i_model,
      i_category: itemData.i_category,
      i_brand: itemData.i_brand,
      i_description: itemData.i_description,
      i_type: itemData.i_type,
      item_rawstock: itemData.item_rawstock,
      i_status: 1,
      i_mr: itemData.i_mr,
      i_price: itemData.i_price,
      i_photo: 'default.jpg'
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    });

  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
