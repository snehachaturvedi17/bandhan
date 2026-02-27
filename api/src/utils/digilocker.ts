/**
 * DigiLocker OAuth Service
 * Integration with MeitY (Ministry of Electronics and IT) DigiLocker API
 * DPDP Act 2023 Compliance - Only encrypted tokens stored, no Aadhaar numbers
 */

import axios from "axios";

interface DigiLockerTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
}

interface DigiLockerUserInfo {
  sub: string; // Unique user identifier (NOT Aadhaar)
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
}

/**
 * Get DigiLocker authorization URL
 * @param state - Random state parameter for CSRF protection
 * @returns DigiLocker OAuth authorization URL
 */
export const getDigiLockerAuthUrl = (state: string): string => {
  const baseUrl = process.env.DIGILOCKER_AUTH_URL ||
    "https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DIGILOCKER_CLIENT_ID!,
    redirect_uri: process.env.DIGILOCKER_REDIRECT_URI!,
    scope: "profile",
    state,
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 * @param code - Authorization code from DigiLocker callback
 * @returns Access token response
 */
export const exchangeDigiLockerCode = async (
  code: string
): Promise<DigiLockerTokenResponse> => {
  try {
    const tokenUrl = process.env.DIGILOCKER_TOKEN_URL ||
      "https://digilocker.meripehchaan.gov.in/public/oauth2/1/token";

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DIGILOCKER_REDIRECT_URI!,
      client_id: process.env.DIGILOCKER_CLIENT_ID!,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET!,
    });

    const response = await axios.post<DigiLockerTokenResponse>(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.error) {
      throw new Error(`DIGILOCKER_ERROR: ${response.data.error_description}`);
    }

    return response.data;
  } catch (error: any) {
    console.error("DigiLocker token exchange failed:", error);
    throw new Error("DIGILOCKER_VERIFICATION_FAILED");
  }
};

/**
 * Get user profile from DigiLocker
 * @param accessToken - DigiLocker access token
 * @returns User profile information
 */
export const getDigiLockerProfile = async (
  accessToken: string
): Promise<DigiLockerUserInfo> => {
  try {
    const profileUrl = process.env.DIGILOCKER_PROFILE_URL ||
      "https://digilocker.meripehchaan.gov.in/public/oauth2/1/profile";

    const response = await axios.get<DigiLockerUserInfo>(profileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("DigiLocker profile fetch failed:", error);
    throw new Error("DIGILOCKER_PROFILE_FETCH_FAILED");
  }
};

/**
 * Verify DigiLocker token validity
 * @param accessToken - DigiLocker access token
 * @returns True if token is valid
 */
export const verifyDigiLockerToken = async (
  accessToken: string
): Promise<boolean> => {
  try {
    const introspectUrl = process.env.DIGILOCKER_INTROSPECT_URL ||
      "https://digilocker.meripehchaan.gov.in/public/oauth2/1/introspect";

    const params = new URLSearchParams({
      token: accessToken,
      client_id: process.env.DIGILOCKER_CLIENT_ID!,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET!,
    });

    const response = await axios.post(introspectUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data.active === true;
  } catch (error) {
    console.error("DigiLocker token introspection failed:", error);
    return false;
  }
};

/**
 * Refresh DigiLocker access token
 * @param refreshToken - Refresh token from initial authorization
 * @returns New access token response
 */
export const refreshDigiLockerToken = async (
  refreshToken: string
): Promise<DigiLockerTokenResponse> => {
  try {
    const tokenUrl = process.env.DIGILOCKER_TOKEN_URL ||
      "https://digilocker.meripehchaan.gov.in/public/oauth2/1/token";

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.DIGILOCKER_CLIENT_ID!,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET!,
    });

    const response = await axios.post<DigiLockerTokenResponse>(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.error) {
      throw new Error(`DIGILOCKER_ERROR: ${response.data.error_description}`);
    }

    return response.data;
  } catch (error: any) {
    console.error("DigiLocker token refresh failed:", error);
    throw new Error("DIGILOCKER_TOKEN_REFRESH_FAILED");
  }
};
