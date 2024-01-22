import axios from "axios";

interface Credentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export async function authApi(credentials: Credentials): Promise<User | null> {
  try {
    const response = await axios.post<User>(
      `${process.env.NEXT_PUBLIC_SPRING_BOOT_BACKEND_PATH}/auth/authenticate`,
      credentials
    );
    console.log("RESPONSE", response);
    return response.data;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}
