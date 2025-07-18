import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { Borrow, Item, Member, Room } from '@/models';
import sequelize from '@/lib/database';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const reportType = searchParams.get('type') || 'summary';

    let whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.b_date_borrowed = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    switch (reportType) {
      case 'summary':
        // Get summary statistics
        const totalBorrows = await Borrow.count({ where: whereClause });
        const activeBorrows = await Borrow.count({ 
          where: { ...whereClause, b_status: 1 } 
        });
        const returnedBorrows = await Borrow.count({ 
          where: { ...whereClause, b_status: 2 } 
        });
        const overdueBorrows = await Borrow.count({ 
          where: { 
            ...whereClause, 
            b_status: 1,
            b_due_date: { [Op.lt]: new Date() }
          } 
        });

        // Get most borrowed items
        const mostBorrowedItems = await Borrow.findAll({
          where: whereClause,
          include: [{
            model: Item,
            as: 'Item',
            attributes: ['i_model', 'i_deviceID']
          }],
          attributes: [
            'item_id',
            [sequelize.fn('COUNT', sequelize.col('Borrow.id')), 'borrow_count']
          ],
          group: ['item_id', 'Item.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('Borrow.id')), 'DESC']],
          limit: 10
        });

        // Get most active members
        const mostActiveMembers = await Borrow.findAll({
          where: whereClause,
          include: [{
            model: Member,
            as: 'Member',
            attributes: ['m_fname', 'm_lname']
          }],
          attributes: [
            'member_id',
            [sequelize.fn('COUNT', sequelize.col('Borrow.id')), 'borrow_count']
          ],
          group: ['member_id', 'Member.id'],
          order: [[sequelize.fn('COUNT', sequelize.col('Borrow.id')), 'DESC']],
          limit: 10
        });

        // Get total counts for items, members, rooms
        const totalItems = await Item.count();
        const totalMembers = await Member.count();
        const totalRooms = await Room.count();

        // Transform mostBorrowedItems to match frontend expectations
        const popularItems = mostBorrowedItems.map((item: any) => ({
          id: item.item_id,
          i_model: item.Item?.i_model || 'Unknown',
          i_deviceID: item.Item?.i_deviceID || 'Unknown',
          borrowCount: parseInt(item.getDataValue('borrow_count'))
        }));

        // Create recent activity from recent borrows
        const recentBorrows = await Borrow.findAll({
          where: whereClause,
          include: [
            {
              model: Item,
              as: 'Item',
              attributes: ['i_model']
            },
            {
              model: Member,
              as: 'Member',
              attributes: ['m_fname', 'm_lname']
            }
          ],
          order: [['b_date_borrowed', 'DESC']],
          limit: 10
        });

        const recentActivity = recentBorrows.map((borrow: any) => ({
          id: borrow.id,
          type: 'borrow',
          description: `${borrow.Member?.m_fname} ${borrow.Member?.m_lname} borrowed ${borrow.Item?.i_model}`,
          date: borrow.b_date_borrowed
        }));

        return NextResponse.json({
          success: true,
          data: {
            totalItems,
            totalMembers,
            totalRooms,
            activeBorrows,
            overdueBorrows,
            returnedThisMonth: returnedBorrows,
            popularItems,
            recentActivity
          }
        });

      case 'detailed':
        // Get detailed borrow records
        const detailedBorrows = await Borrow.findAll({
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
          order: [['b_date_borrowed', 'DESC']]
        });

        return NextResponse.json({
          success: true,
          data: detailedBorrows
        });

      case 'overdue':
        // Get overdue items
        const overdueItems = await Borrow.findAll({
          where: {
            ...whereClause,
            b_status: 1, // Still borrowed
            b_due_date: { [Op.lt]: new Date() }
          },
          include: [
            {
              model: Item,
              as: 'Item',
              attributes: ['i_model', 'i_deviceID']
            },
            {
              model: Member,
              as: 'Member',
              attributes: ['m_fname', 'm_lname', 'm_contact']
            },
            {
              model: Room,
              as: 'Room',
              attributes: ['r_name']
            }
          ],
          order: [['b_due_date', 'ASC']]
        });

        return NextResponse.json({
          success: true,
          data: overdueItems
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid report type'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
