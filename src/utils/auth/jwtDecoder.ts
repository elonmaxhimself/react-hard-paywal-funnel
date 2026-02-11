export const decodeJWT = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { success: true, payload };
  } catch (error) {
    return { success: false, error };
  }
};