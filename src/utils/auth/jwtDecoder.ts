export const decodeJWT = (token: string): any => {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const payload = JSON.parse(atob(padded));
    return { success: true, payload };
  } catch (error) {
    return { success: false, error };
  }
};