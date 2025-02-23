import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const data = await request.json();
    
    // Log the received data
    console.log('Received calculator data:', {
      userDetails: data.userDetails,
      loans: data.loans
    });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("debt-calculator"); // Your database name
    
    // Create a new document with timestamp
    const calculatorEntry = {
      ...data,
      createdAt: new Date(),
    };

    // Insert the document into the 'calculations' collection
    const result = await db.collection('calculations').insertOne(calculatorEntry);

    // Return success response with the inserted document's ID
    return NextResponse.json({ 
      message: 'Data saved successfully',
      calculationId: result.insertedId,
      data: calculatorEntry
    });

  } catch (error) {
    console.error('Error processing calculator data:', error);
    return NextResponse.json(
      { error: 'Failed to process data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

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
