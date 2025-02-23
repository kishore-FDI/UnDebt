import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: any, context: any) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("debt-calculator");

    let calculation;
    try {
      calculation = await db.collection('calculations').findOne({
        _id: new ObjectId(id)
      });
    } catch (error) {
      // Handle invalid ObjectId format
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    if (!calculation) {
      return NextResponse.json(
        { error: 'Calculation not found' },
        { status: 404 }
      );
    }

    // Return the full calculation data
    return NextResponse.json({
      userDetails: calculation.userDetails,
      loans: calculation.loans
    });

  } catch (error) {
    console.error('Error fetching calculation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculation' },
      { status: 500 }
    );
  }
}
