import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

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
