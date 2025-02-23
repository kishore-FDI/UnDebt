import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const client = await clientPromise;
    const db = client.db("debt-calculator");
    
    const calculation = await db.collection('calculations').findOne({
      _id: new ObjectId(id)
    });

    if (!calculation) {
      return NextResponse.json(
        { error: 'Calculation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(calculation);
  } catch (error) {
    console.error('Error fetching calculation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculation' },
      { status: 500 }
    );
  }
} 