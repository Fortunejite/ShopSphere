import { NextResponse } from 'next/server';
import { Shop } from '@/models/Shop';
import { errorHandler } from '@/lib/errorHandler';

export const GET = errorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      { message: 'Domain parameter is required' },
      { status: 400 }
    );
  }

  // Validate domain format (basic validation)
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
  if (!domainRegex.test(domain)) {
    return NextResponse.json(
      { 
        available: false,
        message: 'Invalid domain format. Domain must contain only letters, numbers, and hyphens.' 
      },
      { status: 200 }
    );
  }

  // Check minimum length
  if (domain.length < 3) {
    return NextResponse.json(
      { 
        available: false,
        message: 'Domain must be at least 3 characters long.' 
      },
      { status: 200 }
    );
  }

  // Check maximum length
  if (domain.length > 63) {
    return NextResponse.json(
      { 
        available: false,
        message: 'Domain must be less than 63 characters long.' 
      },
      { status: 200 }
    );
  }

  try {
    // Check if domain already exists
    const existingShop = await Shop.findByDomain(domain);
    
    return NextResponse.json({
      available: !existingShop,
      message: existingShop ? 'Domain is already taken' : 'Domain is available'
    });
  } catch (error) {
    console.error('Domain check error:', error);
    return NextResponse.json(
      { 
        available: false,
        message: 'Error checking domain availability' 
      },
      { status: 500 }
    );
  }
});
