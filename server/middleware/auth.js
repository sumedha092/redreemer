import { expressjwt as jwt } from 'express-jwt'
import { expressJwtSecret } from 'jwks-rsa'
import dotenv from 'dotenv'
dotenv.config()

export const checkJwt = jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
})

/**
 * Extract Auth0 user ID and role from the verified JWT.
 */
export function getAuth0User(req) {
  const payload = req.auth
  if (!payload) return null
  return {
    auth0Id: payload.sub,
    role: payload['https://redreemer.app/role'] || payload['app_metadata']?.role || 'caseworker'
  }
}
