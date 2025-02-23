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
    const db = client.db("debt-calculator");
    
    // Check if a document with the same email already exists
    const existingEntry = await db.collection('calculations').findOne({
      'userDetails.email': data.userDetails.email
    });

    let result;
    const calculatorEntry = {
      ...data,
      updatedAt: new Date(),
    };

    if (existingEntry) {
      // Update existing document
      result = await db.collection('calculations').updateOne(
        { 'userDetails.email': data.userDetails.email },
        { 
          $set: calculatorEntry
        }
      );

      return NextResponse.json({ 
        message: 'Data updated successfully',
        calculationId: existingEntry._id,
        data: calculatorEntry
      });
    } else {
      // Create new document with creation timestamp
      calculatorEntry.createdAt = new Date();
      
      // Insert new document
      result = await db.collection('calculations').insertOne(calculatorEntry);

      return NextResponse.json({ 
        message: 'Data saved successfully',
        calculationId: result.insertedId,
        data: calculatorEntry
      });
    }

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
    const email = searchParams.get('email');

    const client = await clientPromise;
    const db = client.db("debt-calculator");

    // If email is provided, fetch by email
    if (email) {
      const calculation = await db.collection('calculations').findOne({
        'userDetails.email': email
      });

      if (!calculation) {
        return NextResponse.json(
          { exists: false },
          { status: 404 }
        );
      }

      return NextResponse.json({
        exists: true,
        data: calculation
      });
    }

    // Existing ID-based fetch logic
    if (!id) {
      return NextResponse.json(
        { error: 'ID or email is required' },
        { status: 400 }
      );
    }

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
