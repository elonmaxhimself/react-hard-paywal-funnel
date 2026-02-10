export const decodeJWT = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT payload:', payload);
    
    return { success: true, payload };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return { success: false, error };
  }
};