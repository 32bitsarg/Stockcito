import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  
  // Get the base URL from the request
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`, { status: 302 })
  }

  // First, check if this token was already used (user already verified)
  // We need to find if any user with this email is already verified
  const userWithToken = await db.user.findFirst({
    where: {
      emailVerificationToken: token
    }
  })

  // If no user has this token, it might have been already used
  if (!userWithToken) {
    // Redirect to dashboard with already_verified message
    const response = NextResponse.redirect(`${baseUrl}/dashboard?already_verified=true`, { status: 302 })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  }

  // Check if token is expired
  if (userWithToken.emailVerificationExpires && userWithToken.emailVerificationExpires < new Date()) {
    return NextResponse.redirect(`${baseUrl}/login?error=token_expired`, { status: 302 })
  }

  // Check if already verified
  if (userWithToken.emailVerified) {
    const response = NextResponse.redirect(`${baseUrl}/dashboard?already_verified=true`, { status: 302 })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  }

  // Mark email as verified
  await db.user.update({
    where: { id: userWithToken.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null
    }
  })

  // Redirect to dashboard with success message (use 302 to avoid caching issues)
  const response = NextResponse.redirect(`${baseUrl}/dashboard?verified=true`, { status: 302 })
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
